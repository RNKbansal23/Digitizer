import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('class_id') || '5A';

  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return NextResponse.json({ success: true, announcements: data });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { type, message, date, class_id } = await request.json();

    if (!type || !message || !date) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert([{ type, message, date, class_id: class_id || '5A' }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, announcement: data });
  } catch (error) {
    console.error('Error adding announcement:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
