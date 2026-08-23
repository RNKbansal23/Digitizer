// Backend route to handle attendance logging
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const data = await request.json();
  const { student_id, present, timestamp } = data;
  const { error } = await supabase.from('attendance').insert({
    student_id,
    present,
    timestamp,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
}
