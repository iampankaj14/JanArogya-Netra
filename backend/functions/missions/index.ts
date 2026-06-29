// backend/functions/missions/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    const body = await req.json().catch(() => ({}));

    const { data: userProfile } = await supabase.auth.getUser();
    if (!userProfile.user) throw new Error('AUTH/USER_NOT_FOUND');

    // -----------------------------------------------------
    // Action: get-missions (Retrieve Mission List)
    // -----------------------------------------------------
    if (action === 'get-missions') {
      const { status } = body;
      let query = supabase
        .from('missions')
        .select('*, recommendation:ai_recommendations(*)')
        .eq('soft_delete', false)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: get-recommendations (Retrieve AI redistribution suggestions)
    // -----------------------------------------------------
    if (action === 'get-recommendations') {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*, source_phc:phcs!ai_recommendations_source_phc_id_fkey(name), target_phc:phcs!ai_recommendations_target_phc_id_fkey(name), medicine:medicine_master(*)')
        .eq('soft_delete', false)
        .order('confidence', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: create-mission (Deploy a redistribution drill/mission)
    // -----------------------------------------------------
    if (action === 'create-mission') {
      const { title, recommendationId } = body;
      if (!title || !recommendationId) {
        throw new Error('Missing parameters: title or recommendationId');
      }

      // 1. Create mission
      const { data: mission, error: missionErr } = await supabase
        .from('missions')
        .insert({
          title,
          recommendation_id: recommendationId,
          status: 'PENDING',
          created_by: userProfile.user.id,
        })
        .select()
        .single();

      if (missionErr) throw missionErr;

      // 2. Update recommendation status to INACTIVE/RESOLVED
      await supabase
        .from('ai_recommendations')
        .update({ status: 'INACTIVE', updated_by: userProfile.user.id })
        .eq('id', recommendationId);

      // Log user activity
      await supabase.from('activity_logs').insert({
        user_id: userProfile.user.id,
        activity_type: 'MISSION_CREATED',
        description: `Deployed new redistribution mission "${title}" based on AI recommendation ID ${recommendationId}.`,
      });

      return new Response(JSON.stringify({ success: true, data: mission }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: update-mission-status
    // -----------------------------------------------------
    if (action === 'update-mission-status') {
      const { missionId, status } = body;
      if (!missionId || !status) {
        throw new Error('Missing parameters: missionId or status');
      }

      const { data, error } = await supabase
        .from('missions')
        .update({ status, updated_by: userProfile.user.id })
        .eq('id', missionId)
        .select()
        .single();

      if (error) throw error;

      // Log user activity
      await supabase.from('activity_logs').insert({
        user_id: userProfile.user.id,
        activity_type: 'MISSION_STATUS_UPDATED',
        description: `Updated status of mission ID ${missionId} to ${status}.`,
      });

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: get-command-queue (Consolidated operational feeds)
    // -----------------------------------------------------
    if (action === 'get-command-queue' || action === 'command-queue') {
      // 1. Fetch pending medicine transfers
      const { data: pendingTransfers } = await supabase
        .from('medicine_transfers')
        .select('id, quantity, created_at, source_phc:phcs!medicine_transfers_source_phc_id_fkey(name), target_phc:phcs!medicine_transfers_target_phc_id_fkey(name), medicine:medicine_master(name)')
        .eq('status', 'PENDING')
        .eq('soft_delete', false);

      // 2. Fetch pending resource requests
      const { data: pendingResources } = await supabase
        .from('resource_requests')
        .select('id, resource_type, quantity, created_at, phc:phcs(name)')
        .eq('status', 'PENDING')
        .eq('soft_delete', false);

      // 3. Fetch active medicine shortages
      const { data: shortages } = await supabase
        .from('v_medicine_shortages')
        .select('*');

      // 4. Fetch outbreak disease cases (>5 count) from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: outbreaks } = await supabase
        .from('disease_cases')
        .select('id, disease_name, case_count, report_date, phc:phcs(name)')
        .eq('status', 'ACTIVE')
        .eq('soft_delete', false)
        .gt('case_count', 5)
        .gte('report_date', sevenDaysAgo.toISOString().split('T')[0]);

      // 5. Consolidate into structured queue feed
      const queue: any[] = [];

      (pendingTransfers || []).forEach((t: any) => {
        queue.push({
          id: t.id,
          timestamp: t.created_at,
          priority: 'MEDIUM',
          category: 'PENDING_APPROVAL',
          title: 'Stock Transfer Approval Required',
          description: `PHC ${t.target_phc?.name} requested redistribution of ${t.quantity} units of ${t.medicine?.name} from ${t.source_phc?.name}.`,
          metadata: { type: 'MEDICINE_TRANSFER', id: t.id }
        });
      });

      (pendingResources || []).forEach((r: any) => {
        queue.push({
          id: r.id,
          timestamp: r.created_at,
          priority: 'MEDIUM',
          category: 'PENDING_APPROVAL',
          title: 'Resource Allocation Request',
          description: `PHC ${r.phc?.name} is requesting ${r.quantity} additional ${r.resource_type.toLowerCase()} units.`,
          metadata: { type: 'RESOURCE_REQUEST', id: r.id }
        });
      });

      (shortages || []).forEach((s: any) => {
        queue.push({
          id: s.stock_id,
          timestamp: new Date().toISOString(), // Current alert context
          priority: 'HIGH',
          category: 'CRITICAL_ALERT',
          title: `Medicine Shortage at ${s.phc_name}`,
          description: `${s.medicine_name} count is ${s.current_stock}, falling short of threshold limit (${s.min_required_stock}). Needs replenishment of ${s.shortage_qty} units.`,
          metadata: { type: 'STOCK_SHORTAGE', phcId: s.phc_id, medicineId: s.medicine_id }
        });
      });

      (outbreaks || []).forEach((o: any) => {
        queue.push({
          id: o.id,
          timestamp: o.report_date,
          priority: 'CRITICAL',
          category: 'OUTBREAK_ALERT',
          title: `Epidemic Warning: ${o.disease_name}`,
          description: `PHC ${o.phc?.name} reported ${o.case_count} active cases of ${o.disease_name} on ${o.report_date}. Potential outbreak cluster!`,
          metadata: { type: 'EPIDEMIOLOGY_WARNING', disease: o.disease_name }
        });
      });

      // Sort timeline order (priority hierarchy or chronological)
      const priorityWeights: Record<string, number> = { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1 };
      queue.sort((a, b) => {
        const priorityDiff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      return new Response(JSON.stringify({ success: true, data: queue }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Endpoint action not resolved' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
