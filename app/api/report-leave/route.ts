import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { student_id, reason, date } = await request.json();

    if (!student_id || !date) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert([{ student_id, reason, date }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, leave: data });
  } catch (error) {
    console.error('Error reporting leave:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
