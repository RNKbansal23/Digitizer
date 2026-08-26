import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ success: false, error: 'Missing studentId' }, { status: 400 });
  }

  try {
    // 1. Get Student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError || !student) throw studentError;

    // 2. Get latest log for class
    const { data: logData } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('class_id', student.class_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Check if absent today
    let isAbsent = false;
    if (logData) {
      const { data: absenceData } = await supabase
        .from('absences')
        .select('id')
        .eq('student_id', studentId)
        .eq('log_id', logData.id)
        .maybeSingle();
      if (absenceData) isAbsent = true;
    }

    // 4. Get recent announcements
    const { data: announcements } = await supabase
      .from('announcements')
      .select('*')
      .eq('class_id', student.class_id)
      .order('created_at', { ascending: false })
      .limit(1);

    return NextResponse.json({
      success: true,
      student,
      logData,
      isAbsent,
      announcements: announcements || []
    });

  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
