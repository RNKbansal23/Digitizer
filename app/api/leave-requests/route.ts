import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { leave_request_id, status, principal_id, note } = body;

    if (!leave_request_id || !status || !principal_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data, error } = await supabase
      .from('leave_requests')
      .update({ 
        status: status, 
        reviewed_by: principal_id,
        review_note: note 
      })
      .eq('id', leave_request_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating leave request:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in leave-requests endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
