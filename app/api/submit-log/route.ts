import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { absentIds, homeworkImage, date } = await request.json();

    // 1. Insert Daily Log (Homework)
    const { data: logData, error: logError } = await supabase
      .from('daily_logs')
      .insert([{ date, homework_base64: homeworkImage, class_id: '5A' }])
      .select()
      .single();

    if (logError) throw logError;

    // 2. Mark Absences in Database (If any)
    if (absentIds.length > 0) {
      const absencesToInsert = absentIds.map((studentId: string) => ({
        student_id: studentId,
        date: date,
        log_id: logData.id
      }));

      const { error: absentError } = await supabase
        .from('absences')
        .insert(absencesToInsert);

      if (absentError) throw absentError;
    }

    // 3. (Future Step) Trigger WhatsApp API for parents here.
    // Example: fetch('https://graph.facebook.com/v17.0/.../messages', { ... })

    return NextResponse.json({ success: true, message: 'Log saved' });
  } catch (error) {
    console.error('Submission Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}