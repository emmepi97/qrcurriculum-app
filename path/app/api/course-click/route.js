import { createClient } from '@supabase/supabase-js';

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request) {
  try {
    const { sponsor_id } = await request.json();
    if (!sponsor_id) return Response.json({ ok: false }, { status: 400 });
    const admin = serverClient();
    const { data: row } = await admin.from('course_sponsors').select('clicks').eq('id', sponsor_id).maybeSingle();
    await admin.from('course_sponsors').update({ clicks: (row?.clicks || 0) + 1 }).eq('id', sponsor_id);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
