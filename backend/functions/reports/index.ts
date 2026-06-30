// backend/functions/reports/index.ts
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

    // -----------------------------------------------------
    // Action: list (List all reports metadata)
    // -----------------------------------------------------
    if (action === 'list') {
      const { type } = body;
      let query = supabase.from('reports').select('*').eq('soft_delete', false);
      
      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: generate (PDF and CSV Reports compiler)
    // -----------------------------------------------------
    if (action === 'generate') {
      const { title, type, format = 'PDF', metrics } = body;
      if (!title || !type) throw new Error('Missing parameters: title or type');

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('AUTH/USER_NOT_FOUND');

      let fileContent: Uint8Array;
      let contentType = '';
      let fileExtension = '';

      if (format.toUpperCase() === 'CSV') {
        // Compile CSV text
        contentType = 'text/csv';
        fileExtension = 'csv';

        // Fetch medicine stock to populate CSV fields
        const { data: stocks } = await supabase.from('medicine_stock').select('phc_id, medicine_id, current_stock, min_required_stock');
        const csvText = jsonToCsv(stocks || []);
        const encoder = new TextEncoder();
        fileContent = encoder.encode(csvText);
      } else {
        // Default PDF compilation
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        // Mini dummy PDF bytes %PDF-1.4 header
        fileContent = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 226, 227, 207, 211, 10, 49, 32, 48, 32, 111, 98, 106, 10]); 
      }

      const uniqueId = gen_random_string(6);
      const filePath = `reports/report-${uniqueId}.${fileExtension}`;

      // Upload file to Supabase private reports bucket
      const { error: uploadErr } = await supabase.storage
        .from('reports')
        .upload(filePath, fileContent, {
          contentType,
          upsert: true,
        });

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage
        .from('reports')
        .getPublicUrl(filePath);

      // Save report registry to DB
      const { data: report, error: reportErr } = await supabase
        .from('reports')
        .insert({
          title,
          type,
          pdf_url: publicUrlData.publicUrl,
          generated_by: user.user.id,
          summary_metrics: metrics || {},
          created_by: user.user.id,
        })
        .select()
        .single();

      if (reportErr) throw reportErr;

      return new Response(JSON.stringify({ success: true, data: report }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: scheduled-trigger (Simulated cron schedules)
    // -----------------------------------------------------
    if (action === 'scheduled-trigger' || action === 'cron') {
      const { scheduleType } = body; // e.g. 'WEEKLY_EPIDEMIOLOGY'

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('AUTH/USER_NOT_FOUND');

      const { data: caseCountResult } = await supabase.from('disease_cases').select('case_count');
      const caseSum = caseCountResult?.reduce((sum, c) => sum + c.case_count, 0) || 0;

      const title = `Weekly Automatic Health Report - ${new Date().toISOString().split('T')[0]}`;
      const type = 'Epidemiological';
      const metrics = {
        scheduleRun: scheduleType || 'WEEKLY_AUTO_CRON',
        totalDistrictCasesRegistered: caseSum,
      };

      // Recurse into compiler logic
      const compilePayload = {
        title,
        type,
        format: 'PDF',
        metrics
      };

      // Upload and create report
      const docPath = `reports/scheduled-${gen_random_string(6)}.pdf`;
      const dummyPdfContent = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52]);

      const { error: uploadErr } = await supabase.storage
        .from('reports')
        .upload(docPath, dummyPdfContent, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage
        .from('reports')
        .getPublicUrl(docPath);

      const { data: report, error: reportErr } = await supabase
        .from('reports')
        .insert({
          title,
          type,
          pdf_url: publicUrlData.publicUrl,
          generated_by: user.user.id,
          summary_metrics: metrics,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (reportErr) throw reportErr;

      return new Response(JSON.stringify({ success: true, message: 'Scheduled cron execution succeeded', data: report }), {
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

// JSON array serializer helper
function jsonToCsv(items: any[]): string {
  if (items.length === 0) return '';
  const header = Object.keys(items[0]);
  const csv = [
    header.join(','),
    ...items.map(row => header.map(fieldName => {
      const val = row[fieldName];
      return JSON.stringify(val === null ? '' : val);
    }).join(','))
  ].join('\r\n');
  return csv;
}

// Random string generator
function gen_random_string(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
