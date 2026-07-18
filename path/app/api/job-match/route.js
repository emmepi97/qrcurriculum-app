import { createClient } from '@supabase/supabase-js';
import { matchKeywords } from '@/lib/helpers';

// Client server-side: usa la Service Role Key se disponibile (bypassa RLS,
// serve per leggere ai_settings anche per utenti non-admin), altrimenti
// ricade sulla anon key (in quel caso l'AI resterà semplicemente disattivata
// finché non viene configurata la Service Role Key).
// Cache in-memory di breve durata: evita di interrogare tutta la tabella
// skills ad ogni singola analisi. Si "autoalimenta": più skill le persone
// aggiungono nel tempo, più ampio diventa il riconoscimento delle keyword,
// senza bisogno di toccare la lista statica nel codice.
let skillKeywordsCache = { list: [], fetchedAt: 0 };
const SKILL_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minuti

async function getDynamicSkillKeywords(admin) {
  const now = Date.now();
  if (skillKeywordsCache.list.length && (now - skillKeywordsCache.fetchedAt) < SKILL_CACHE_TTL_MS) {
    return skillKeywordsCache.list;
  }
  try {
    const { data, error } = await admin.from('skills').select('name').eq('is_hidden', false).limit(5000);
    if (error) throw error;
    const names = Array.from(new Set(
      (data || [])
        .map(r => String(r.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim())
        .filter(n => n.length > 2)
    ));
    skillKeywordsCache = { list: names, fetchedAt: now };
    return names;
  } catch {
    // Se la lettura fallisce (es. Service Role Key non configurata), si
    // continua comunque con la sola lista statica: nessun errore per l'utente.
    return skillKeywordsCache.list;
  }
}

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function runAiMatch(jobText, skills, settings) {
  const model = settings.model || 'claude-haiku-4-5';
  const prompt = `Sei un assistente che valuta la compatibilita tra il profilo di un candidato e un annuncio di lavoro.
Competenze del candidato: ${skills.join(', ') || 'nessuna indicata'}.
Annuncio di lavoro:
"""
${jobText}
"""
Rispondi SOLO con un JSON valido, senza testo aggiuntivo prima o dopo, in questo formato esatto:
{"score": <numero intero 0-100>, "matched": ["competenze del candidato rilevanti per l'annuncio"], "missing": ["competenze richieste dall'annuncio che il candidato non ha"], "summary": "1-2 frasi in italiano sul perche del punteggio"}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.api_key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model, max_tokens: 700, messages: [{ role: 'user', content: prompt }] })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Anthropic API error ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = (data.content || []).map(b => b.text || '').join('').trim();
  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return {
    mode: 'ai',
    score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0))),
    matched: Array.isArray(parsed.matched) ? parsed.matched.slice(0, 30) : [],
    missing: Array.isArray(parsed.missing) ? parsed.missing.slice(0, 30) : [],
    summary: String(parsed.summary || '')
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const jobText = String(body.job_text || '').slice(0, 8000);
    const skills = Array.isArray(body.skills) ? body.skills.slice(0, 60) : [];
    const userId = body.user_id || null;

    const admin = serverClient();
    let settings = null;
    try {
      const { data } = await admin.from('ai_settings').select('*').eq('is_active', true).order('updated_at', { ascending: false }).limit(1).maybeSingle();
      settings = data || null;
    } catch { /* tabella non ancora creata: si ricade sul matching testuale */ }

    let result;
    if (settings?.api_key) {
      try {
        result = await runAiMatch(jobText, skills, settings);
      } catch (aiError) {
        console.error('Job Match AI error, fallback a matching testuale:', aiError.message);
        const dynamicKeywords = await getDynamicSkillKeywords(admin);
        result = { ...matchKeywords(jobText, skills, dynamicKeywords), mode: 'keywords', aiError: aiError.message };
      }
    } else {
      const dynamicKeywords = await getDynamicSkillKeywords(admin);
      result = { ...matchKeywords(jobText, skills, dynamicKeywords), mode: 'keywords' };
    }

    if (userId) {
      try {
        await admin.from('ai_generations').insert({
          user_id: userId,
          job_text: jobText,
          match_score: result.score,
          matched_keywords: result.matched,
          missing_keywords: result.missing
        });
      } catch { /* storico opzionale, non deve bloccare la risposta */ }
    }

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
