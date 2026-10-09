import { createClient } from '@supabase/supabase-js';

// Tracciamento eventi lato server: più affidabile dell'insert diretto dal
// browser perché usa la Service Role Key (bypassa del tutto RLS e vincoli
// legacy) e perché un eventuale errore finisce nei log del server (Vercel),
// non solo nella console del browser di chi visita il profilo.
function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const eventType = body.event_type === 'qr_scan' ? 'qr_scan' : 'profile_view';
    const profileUserId = body.profile_user_id;
    const publicSlug = String(body.public_slug || '').slice(0, 200);
    if (!profileUserId || !publicSlug) {
      return Response.json({ ok: false, error: 'profile_user_id e public_slug sono obbligatori' }, { status: 400 });
    }

    const admin = serverClient();
    const row = {
      profile_user_id: profileUserId,
      owner_id: profileUserId,
      event_type: eventType,
      event_date: new Date().toISOString(),
      public_slug: publicSlug,
      path: String(body.path || '').slice(0, 300),
      referrer: String(body.referrer || '').slice(0, 500),
      user_agent: String(body.user_agent || '').slice(0, 500)
    };

    const { error } = await admin.from('analytics_events').insert(row);
    if (error) {
      console.error('track-event insert error:', error.message, row);
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error('track-event unexpected error:', e.message);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
