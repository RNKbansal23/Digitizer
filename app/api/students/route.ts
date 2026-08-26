import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all students for a class
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('class_id') || '5A';

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('roll', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, students: data });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST a new student
export async function POST(request: Request) {
  try {
    const { name, roll, parent_phone, class_id } = await request.json();

    if (!name || !roll || !parent_phone) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('students')
      .insert([{ name, roll: parseInt(roll, 10), parent_phone, class_id: class_id || '5A' }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, student: data });
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
