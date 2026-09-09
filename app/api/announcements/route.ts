import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

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
    const body = await request.json();
    const { type, message, date, class_id, title, scope, school_id, urgency, posted_by } = body;

    // Use service role if we are creating from the mobile app (which might not send auth cookies properly)
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Some fields might be missing if called from the old web dashboard, so we keep fallbacks
    const insertData = {
      type: type || 'Notice',
      message: message,
      date: date || new Date().toISOString().split('T')[0],
      class_id: class_id || null, // null for school_wide
      title: title || type || 'Notice',
      scope: scope || (class_id ? 'class_specific' : 'school_wide'),
      school_id: school_id || null,
      urgency: urgency || 'routine',
      posted_by: posted_by || null
    };

    const { data, error } = await supabaseClient
      .from('announcements')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, announcement: data, data });
  } catch (error: any) {
    console.error('Error adding announcement:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
