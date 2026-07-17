import { createClient } from '@supabase/supabase-js';

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Lettura eventi lato server: usa la Service Role Key (bypassa RLS) ma
// verifica prima che l'access_token appartenga davvero all'utente che
// richiede i dati, così nessuno può leggere le statistiche di un altro
// semplicemente cambiando lo user id nella richiesta.
export async function POST(request) {
  try {
    const body = await request.json();
    const accessToken = body.access_token;
    const rangeDays = Math.max(1, Math.min(365, Number(body.range_days) || 30));
    if (!accessToken) return Response.json({ error: 'Sessione mancante' }, { status: 401 });

    const admin = serverClient();
    const { data: userData, error: userErr } = await admin.auth.getUser(accessToken);
    if (userErr || !userData?.user) return Response.json({ error: 'Sessione non valida' }, { status: 401 });
    const uid = userData.user.id;

    const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await admin
      .from('analytics_events')
      .select('id,event_type,path,referrer,created_at')
      .eq('profile_user_id', uid)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1000);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ events: data || [] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
