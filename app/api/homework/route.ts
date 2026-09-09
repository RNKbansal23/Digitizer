import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { class_id, subject, description, attachment_url, due_date, teacher_id } = body;

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data, error } = await supabase
      .from('homework')
      .insert([{
        class_id: class_id,
        subject: subject,
        description: description,
        attachment_url: attachment_url, 
        due_date: due_date,
        created_by: teacher_id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting homework:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in homework endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
