import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { absentIds, homeworkImage, date, class_id, school_id } = await request.json();

    if (!class_id || !school_id) {
      return NextResponse.json({ success: false, error: 'Missing class or school ID' }, { status: 400 });
    }

    // 1. Upsert Daily Log (Homework) using the unique constraint (date, class_id, school_id)
    const { data: logData, error: logError } = await supabase
      .from('daily_logs')
      .upsert(
        [{ date, homework_base64: homeworkImage, class_id, school_id }],
        { onConflict: 'date,class_id,school_id' }
      )
      .select()
      .single();

    if (logError) throw logError;

    // 2. Clear existing absences for this log to handle edits
    const { error: deleteError } = await supabase
      .from('absences')
      .delete()
      .eq('log_id', logData.id);
      
    if (deleteError) throw deleteError;

    // 3. Mark New Absences in Database (If any)
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

    return NextResponse.json({ success: true, message: 'Log saved' });
  } catch (error) {
    console.error('Submission Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}