import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const classId = searchParams.get('class_id');
    const schoolId = searchParams.get('school_id');

    if (!date || !classId || !schoolId) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Fetch Daily Log
    const { data: logData, error: logError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('date', date)
      .eq('class_id', classId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (logError) throw logError;

    if (!logData) {
      return NextResponse.json({ success: true, log: null, absences: [] });
    }

    // 2. Fetch Absences for this log
    const { data: absencesData, error: absencesError } = await supabase
      .from('absences')
      .select('student_id')
      .eq('log_id', logData.id);

    if (absencesError) throw absencesError;

    const absentIds = absencesData ? absencesData.map(a => a.student_id) : [];

    return NextResponse.json({ success: true, log: logData, absences: absentIds });
  } catch (error) {
    console.error('Fetch Log Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
