// backend/functions/medicine/index.ts
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
    // Action: get-stock
    // -----------------------------------------------------
    if (action === 'get-stock') {
      const { phcId } = body;
      if (!phcId) throw new Error('Missing parameter: phcId');

      const { data, error } = await supabase
        .from('medicine_stock')
        .select('*, medicine:medicine_master(*)')
        .eq('phc_id', phcId)
        .eq('soft_delete', false);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: update-stock
    // -----------------------------------------------------
    if (action === 'update-stock') {
      const { phcId, medicineId, newStock, reason } = body;
      if (!phcId || !medicineId || newStock === undefined) {
        throw new Error('Missing parameters: phcId, medicineId, or newStock');
      }

      // 1. Get current stock
      const { data: currentStockRecord } = await supabase
        .from('medicine_stock')
        .select('current_stock')
        .eq('phc_id', phcId)
        .eq('medicine_id', medicineId)
        .single();

      const oldStock = currentStockRecord ? currentStockRecord.current_stock : 0;
      const difference = newStock - oldStock;

      // 2. Upsert stock count
      const { data, error } = await supabase
        .from('medicine_stock')
        .upsert({
          phc_id: phcId,
          medicine_id: medicineId,
          current_stock: newStock,
          updated_by: userProfile.user.id,
        }, {
          onConflict: 'phc_id,medicine_id'
        })
        .select()
        .single();

      if (error) throw error;

      // 3. Log stock audit trail history
      await supabase.from('medicine_stock_history').insert({
        phc_id: phcId,
        medicine_id: medicineId,
        quantity_changed: difference,
        change_type: difference >= 0 ? 'INWARD' : 'OUTWARD',
        reason: reason || 'Manual count adjustment via inventory manager',
        created_by: userProfile.user.id,
      });

      // 4. Log custom user activity
      await supabase.from('activity_logs').insert({
        user_id: userProfile.user.id,
        activity_type: 'INVENTORY_ADJUSTMENT',
        description: `Adjusted medicine stock ID ${medicineId} at PHC ${phcId} from ${oldStock} to ${newStock}.`,
      });

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: request-transfer (or redistribution transfer)
    // -----------------------------------------------------
    if (action === 'request-transfer' || action === 'transfer') {
      const { sourcePhcId, targetPhcId, medicineId, quantity } = body;
      if (!sourcePhcId || !targetPhcId || !medicineId || !quantity) {
        throw new Error('Missing parameters: sourcePhcId, targetPhcId, medicineId, or quantity');
      }

      // Check stock levels at source
      const { data: srcStock, error: srcErr } = await supabase
        .from('medicine_stock')
        .select('current_stock')
        .eq('phc_id', sourcePhcId)
        .eq('medicine_id', medicineId)
        .single();

      if (srcErr || !srcStock) throw new Error('INSUFFICIENT_STOCK');
      if (srcStock.current_stock < quantity) throw new Error('INSUFFICIENT_STOCK');

      // Create the transfer record (locks stock immediately)
      const { data: transfer, error: transErr } = await supabase
        .from('medicine_transfers')
        .insert({
          source_phc_id: sourcePhcId,
          target_phc_id: targetPhcId,
          medicine_id: medicineId,
          quantity,
          status: 'PENDING',
          created_by: userProfile.user.id,
        })
        .select()
        .single();

      if (transErr) throw transErr;

      // Deduct immediately from source stock to prevent double allocations
      await supabase
        .from('medicine_stock')
        .update({ current_stock: srcStock.current_stock - quantity })
        .eq('phc_id', sourcePhcId)
        .eq('medicine_id', medicineId);

      // Log outward history
      await supabase.from('medicine_stock_history').insert({
        phc_id: sourcePhcId,
        medicine_id: medicineId,
        quantity_changed: -quantity,
        change_type: 'TRANSFER',
        reason: formatReason(transfer.id, 'outward'),
        created_by: userProfile.user.id,
      });

      // Log user activity
      await supabase.from('activity_logs').insert({
        user_id: userProfile.user.id,
        activity_type: 'TRANSFER_REQUESTED',
        description: `Requested redistribution transfer of ${quantity} units of medicine ID ${medicineId} from PHC ${sourcePhcId} to PHC ${targetPhcId}.`,
      });

      return new Response(JSON.stringify({ success: true, data: transfer }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: approve-transfer (Invokes DB transactional function)
    // -----------------------------------------------------
    if (action === 'approve-transfer' || action === 'process-transfer') {
      const { transferId, action: decision, reason } = body;
      if (!transferId || !decision) {
        throw new Error('Missing parameters: transferId or action');
      }

      // Invoke process_medicine_transfer database function
      const { data: processResult, error: processErr } = await supabase.rpc(
        'process_medicine_transfer',
        {
          transfer_uuid: transferId,
          action_status: decision, // 'APPROVED' | 'DELIVERED' | 'REJECTED' | 'CANCELLED'
          actor_uuid: userProfile.user.id,
          reject_reason: reason || null,
        }
      );

      if (processErr) throw processErr;

      // Log action in activities
      await supabase.from('activity_logs').insert({
        user_id: userProfile.user.id,
        activity_type: `TRANSFER_${decision}`,
        description: `Processed transfer ${transferId} with action state: ${decision}. Reason: ${reason || 'N/A'}.`,
      });

      return new Response(JSON.stringify({ success: true, data: { status: decision, success: processResult } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------
    // Action: list-transfers
    // -----------------------------------------------------
    if (action === 'list-transfers') {
      const { phcId } = body;
      let query = supabase
        .from('medicine_transfers')
        .select('*, source_phc:phcs!medicine_transfers_source_phc_id_fkey(name), target_phc:phcs!medicine_transfers_target_phc_id_fkey(name), medicine:medicine_master(*)')
        .eq('soft_delete', false)
        .order('created_at', { ascending: false });

      if (phcId) {
        query = query.or(`source_phc_id.eq.${phcId},target_phc_id.eq.${phcId}`);
      }

      const { data, error } = await query;
      if (error) throw error;

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

function formatReason(id: string, dir: string): string {
  return `Transfer order ${id} ${dir}`;
}
