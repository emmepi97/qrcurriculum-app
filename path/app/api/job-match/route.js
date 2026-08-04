import { createClient } from '@supabase/supabase-js';
import { matchKeywords, categoryForText, categoryLabel, suggestSkillsForCategory, COURSE_LIBRARY, categorizeJobFamily, isPremiumSubscription } from '@/lib/helpers';

let skillKeywordsCache = { list: [], fetchedAt: 0 };
const SKILL_CACHE_TTL_MS = 10 * 60 * 1000;

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getDynamicSkillKeywords(admin) {
  const now = Date.now();
  if (skillKeywordsCache.list.length && now - skillKeywordsCache.fetchedAt < SKILL_CACHE_TTL_MS) return skillKeywordsCache.list;
  try {
    const { data } = await admin.from('skills').select('name').eq('is_hidden', false).limit(5000);
    const names = Array.from(new Set((data || []).map(r => String(r.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()).filter(n => n.length > 2)));
    skillKeywordsCache = { list: names, fetchedAt: now };
    return names;
  } catch {
    return skillKeywordsCache.list;
  }
}

async function verifyUser(admin, token, fallbackUserId) {
  if (token) {
    const { data, error } = await admin.auth.getUser(token);
    if (!error && data?.user?.id) return data.user.id;
  }
  return fallbackUserId || null;
}

async function isPremiumUser(admin, userId) {
  if (!userId) return false;
  const { data } = await admin.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
  return isPremiumSubscription(data);
}

async function buildImprovementAreas(admin, categories, lang) {
  const list = (categories || []).slice(0, 4);
  const areas = [];
  for (const category of list) {
    let sponsor = null;
    try {
      const { data } = await admin.from('course_sponsors').select('id,category,title,provider_name,url,logo_url').eq('category', category).eq('is_active', true).order('priority', { ascending: false }).limit(1).maybeSingle();
      sponsor = data || null;
    } catch {}
    if (sponsor) areas.push({ category, categoryLabel: categoryLabel(category, lang), sponsored: true, sponsor });
    else areas.push({ category, categoryLabel: categoryLabel(category, lang), sponsored: false, skills: suggestSkillsForCategory(category), courses: COURSE_LIBRARY[category] || COURSE_LIBRARY['Industry Expertise'] });
  }
  return areas;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const admin = serverClient();
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7) : '';
    const userId = await verifyUser(admin, token, body.user_id || null);
    const premium = await isPremiumUser(admin, userId);
    const jobText = String(body.job_text || '').slice(0, 8000);
    const skills = Array.isArray(body.skills) ? body.skills.slice(0, 60) : [];
    const lang = body.lang === 'en' ? 'en' : 'it';
    const dynamicKeywords = await getDynamicSkillKeywords(admin);
    const raw = { ...matchKeywords(jobText, skills, dynamicKeywords), mode: 'keywords' };
    const missingCategories = raw.missingCategories?.length ? raw.missingCategories : Array.from(new Set((raw.missing || []).map(categoryForText)));
    const improvementAreas = await buildImprovementAreas(admin, missingCategories, lang);
    const jobFamily = categorizeJobFamily(jobText);

    const fullResult = {
      mode: raw.mode,
      score: raw.score,
      matched: raw.matched || [],
      missing: raw.missing || [],
      improvementAreas,
      summary: lang === 'en'
        ? `The match score is ${raw.score}%. Premium unlocks the detailed explanation, gaps and action plan.`
        : `Il match score è ${raw.score}%. Il Premium sblocca dettaglio, gap e piano di miglioramento.`,
      jobFamily,
      premium
    };

    if (userId) {
      try {
        await admin.from('ai_generations').insert({
          user_id: userId,
          job_text: jobText,
          match_score: raw.score,
          matched_keywords: raw.matched || [],
          missing_keywords: raw.missing || [],
          is_premium_detail: premium,
          job_family: jobFamily,
          result_json: fullResult
        });
      } catch {}
    }

    if (!premium) {
      return Response.json({
        mode: raw.mode,
        score: raw.score,
        matched: [],
        missing: [],
        improvementAreas: [],
        summary: fullResult.summary,
        jobFamily,
        premium: false,
        locked: true,
        lockedMessage: lang === 'en'
          ? 'Upgrade to Premium to see matched skills, missing keywords, improvement areas and suggested actions.'
          : 'Passa a Premium per vedere skill trovate, keyword mancanti, aree di miglioramento e azioni consigliate.'
      });
    }

    return Response.json(fullResult);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
