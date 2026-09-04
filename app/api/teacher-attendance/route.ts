import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { date, school_id } = await req.json();

    const { data, error } = await supabase
      .from('teacher_attendance')
      .upsert([
        { school_id, teacher_id: user.id, date, status: 'present' }
      ], { onConflict: 'teacher_id, date' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
