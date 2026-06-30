// backend/functions/patients/index.ts
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
    // Action: list-patients (Search and list patients)
    // -----------------------------------------------------
    if (action === 'list-patients' || action === 'get-patients') {
      const { search } = body;
      
      let query = supabase
        .from('patients')
        .select('*')
        .eq('soft_delete', false)
        .order('name', { ascending: true });

      if (search) {
        // Search by name or phone
        query = query.or(`name.ilike.%${search}%,phone.like.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: create-patient (Register new patient)
    // -----------------------------------------------------
    if (action === 'create-patient') {
      const { name, age, gender, phone } = body;
      if (!name || age === undefined || !gender) {
        throw new Error('Missing parameters: name, age, or gender');
      }

      const { data, error } = await supabase
        .from('patients')
        .insert({
          name,
          age,
          gender,
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
        activity_type: 'PATIENT_REGISTERED',
        description: `Registered new patient ${name} (Age: ${age}, Gender: ${gender}).`,
      });

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: get-visits (Retrieve clinical history)
    // -----------------------------------------------------
    if (action === 'get-visits') {
      const { patientId, phcId } = body;
      
      let query = supabase
        .from('patient_visits')
        .select('*, patient:patients(*), phc:phcs(name)')
        .eq('soft_delete', false)
        .order('visit_date', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
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
    // Action: create-visit (Log clinic visit & link outbreak metrics)
    // -----------------------------------------------------
    if (action === 'create-visit') {
      const { patientId, phcId, symptoms, diagnosis, diseaseName, caseCount } = body;
      if (!patientId || !phcId) {
        throw new Error('Missing parameters: patientId or phcId');
      }

      // 1. Insert patient visit record
      const { data: visit, error: visitErr } = await supabase
        .from('patient_visits')
        .insert({
          patient_id: patientId,
          phc_id: phcId,
          visit_date: new Date().toISOString(),
          symptoms,
          diagnosis,
          status: 'ACTIVE',
          created_by: userProfile.user.id,
        })
        .select()
        .single();

      if (visitErr) throw visitErr;

      // 2. Log disease case if diagnosis matches a reportable outbreak indicator
      if (diseaseName) {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if case count already recorded today for this PHC and disease
        const { data: existingCases } = await supabase
          .from('disease_cases')
          .select('id, case_count')
          .eq('phc_id', phcId)
          .eq('disease_name', diseaseName)
          .eq('report_date', today)
          .eq('soft_delete', false)
          .maybeSingle();

        if (existingCases) {
          // Update count
          await supabase
            .from('disease_cases')
            .update({ 
              case_count: existingCases.case_count + (caseCount || 1),
              updated_by: userProfile.user.id
            })
            .eq('id', existingCases.id);
        } else {
          // Insert new case count
          await supabase
            .from('disease_cases')
            .insert({
              phc_id: phcId,
              disease_name: diseaseName,
              case_count: caseCount || 1,
              report_date: today,
              status: 'ACTIVE',
              created_by: userProfile.user.id,
            });
        }
      }

      // Log user activity
      await supabase.from('activity_logs').insert({
        user_id: userProfile.user.id,
        activity_type: 'PATIENT_VISIT_RECORDED',
        description: `Logged visit for patient ID ${patientId} at PHC ${phcId}. Diagnosis: ${diagnosis || 'None'}.`,
      });

      return new Response(JSON.stringify({ success: true, data: visit }), {
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
