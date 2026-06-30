// backend/functions/attendance/index.ts
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
    // Action: get-attendance
    // -----------------------------------------------------
    if (action === 'get-attendance') {
      const { phcId, date } = body;
      
      const query = supabase
        .from('doctor_attendance')
        .select('*, doctor:doctors(*)')
        .eq('soft_delete', false);
        
      if (phcId) {
        const { data: doctors } = await supabase
          .from('doctors')
          .select('id')
          .eq('phc_id', phcId)
          .eq('soft_delete', false);
          
        const doctorIds = (doctors || []).map(d => d.id);
        query.in('doctor_id', doctorIds);
      }
      
      if (date) {
        query.eq('date', date);
      } else {
        query.eq('date', new Date().toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: record
    // -----------------------------------------------------
    if (action === 'record') {
      const { doctorId, present, timeIn } = body;
      if (!doctorId || present === undefined) {
        throw new Error('Missing parameters: doctorId or present status');
      }

      const today = new Date().toISOString().split('T')[0];

      // Upsert attendance record
      const { data, error } = await supabase
        .from('doctor_attendance')
        .upsert({
          doctor_id: doctorId,
          date: today,
          present,
          time_in: present ? (timeIn || '09:00:00') : null,
          created_by: userProfile.user.id,
          updated_by: userProfile.user.id,
        }, {
          onConflict: 'doctor_id,date'
        })
        .select()
        .single();

      if (error) throw error;

      // Log user activity
      await supabase.from('activity_logs').insert({
        user_id: userProfile.user.id,
        activity_type: 'ATTENDANCE_RECORDED',
        description: `Recorded attendance for doctor ${doctorId} on ${today} as ${present ? 'Present' : 'Absent'}.`,
      });

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: list-doctors (Roster listing)
    // -----------------------------------------------------
    if (action === 'list-doctors' || action === 'get-doctors') {
      const { phcId } = body;
      
      let query = supabase
        .from('doctors')
        .select('*')
        .eq('soft_delete', false)
        .order('name', { ascending: true });

      if (phcId) {
        query = query.eq('phc_id', phcId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: add-doctor (Register new physician)
    // -----------------------------------------------------
    if (action === 'add-doctor') {
      const { phcId, name, specialty, email, phone } = body;
      if (!phcId || !name) {
        throw new Error('Missing parameters: phcId or name');
      }

      const { data, error } = await supabase
        .from('doctors')
        .insert({
          phc_id: phcId,
          name,
          specialty,
          email,
          phone,
          status: 'ACTIVE',
          created_by: userProfile.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log user activity
      await supabase.from('activity_logs').insert({
        user_id: userProfile.user.id,
        activity_type: 'DOCTOR_REGISTERED',
        description: `Registered new doctor ${name} under PHC ${phcId}.`,
      });

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
