'use client';
import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useLang } from '@/components/LanguageProvider';

function emptyFromFields(fields) {
  return fields.reduce((a, f) => { a[f.name] = f.type === 'checkbox' ? false : (f.default ?? ''); return a; }, {});
}
function cleanPayload(payload, fields, userId) {
  const next = { ...payload, user_id: userId };
  fields.forEach(f => {
    if (f.type === 'date' && next[f.name] === '') next[f.name] = null;
    if (f.type === 'number') next[f.name] = Math.max(Number(f.min ?? 0), Math.min(Number(f.max ?? 999), Number(next[f.name] || f.default || 0)));
    if (typeof next[f.name] === 'string') next[f.name] = next[f.name].trim();
  });
  return next;
}
function mainLabel(row) { return row.role_title || row.title || row.name || row.lingua || 'Elemento senza titolo'; }
function secondLabel(row) { return row.company || row.institution || row.issuer || row.role || row.category || row.livello || row.description || row.impact || 'Elemento salvato'; }

export default function SectionManager({ title, description, table, fields, rows, userId, onChange, globalSkills = [] }) {
  const { t } = useLang();
  const initial = useMemo(() => emptyFromFields(fields), [fields]);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const requiredField = fields.find(f => f.required)?.name || fields.find(f => !['date', 'textarea', 'checkbox', 'select', 'number'].includes(f.type || 'text'))?.name;
  const isSkills = table === 'skills';
  const skillExists = isSkills && form.name && globalSkills.map(s => s.toLowerCase()).includes(String(form.name).toLowerCase());
  const showNewSkillNotice = isSkills && form.name && !skillExists;

  function startNew() { setForm(emptyFromFields(fields)); setEditingId(null); setOpen(true); setError(''); setSuccess(''); }
  function editRow(row) { const next = { ...emptyFromFields(fields) }; fields.forEach(f => { next[f.name] = row[f.name] ?? (f.type === 'checkbox' ? false : ''); }); setForm(next); setEditingId(row.id); setOpen(true); setError(''); setSuccess(''); }
  function closeForm() { setForm(emptyFromFields(fields)); setEditingId(null); setOpen(false); setError(''); }
  async function saveItem(keepOpen = false) {
    setBusy(true); setError(''); setSuccess('');
    const payload = cleanPayload(form, fields, userId);
    if (requiredField && !payload[requiredField]) { setBusy(false); setError('Compila almeno il campo principale prima di salvare.'); return; }
    const result = editingId
      ? await supabase.from(table).update(payload).eq('id', editingId).eq('user_id', userId).select().single()
      : await supabase.from(table).insert(payload).select().single();
    setBusy(false);
    if (result.error) { setError(result.error.message); return; }
    await onChange?.({ preserveScroll: true });
    if (keepOpen && !editingId) { setForm(emptyFromFields(fields)); setSuccess('Elemento salvato. Puoi inserirne subito un altro.'); setOpen(true); setTimeout(() => setSuccess(''), 2500); return; }
    setForm(emptyFromFields(fields)); setEditingId(null); setOpen(false); setSuccess(editingId ? 'Elemento aggiornato.' : 'Elemento salvato.'); setTimeout(() => setSuccess(''), 2500);
  }
  async function remove(id) {
    if (!confirm(t.confirmDelete)) return;
    const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);
    if (error) { setError(error.message); return; }
    await onChange?.({ preserveScroll: true });
  }
  return <section className="smartSection wideSection" id={table}>
    <div className="smartSectionHeader"><div><h2>{title}</h2><p>{description}</p><span className="sectionCount">{rows.length} elementi salvati</span></div><button className="btn primary" type="button" onClick={open ? closeForm : startNew}>{open ? t.close : `${t.add} ${title}`}</button></div>
    {open ? <form className="quickForm" onSubmit={e => { e.preventDefault(); saveItem(false); }}>
      <div className="quickFormHead"><strong>{editingId ? `${t.edit} ${title}` : `${t.add} ${title}`}</strong><button className="linkButton noMargin" type="button" onClick={closeForm}>{t.cancel}</button></div>
      {isSkills ? <p className="hint">{t.catalogHint}</p> : null}
      <div className="quickFormGrid">
        {fields.map(f => <label key={f.name} className={f.type === 'textarea' ? 'wide' : f.type === 'checkbox' ? 'check compactCheck' : ''}>{f.label}
          {f.type === 'textarea' ? <textarea value={form[f.name] || ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })} rows={3} /> :
           f.type === 'select' ? <select value={form[f.name] ?? ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })}>{(f.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select> :
           f.type === 'checkbox' ? <input type="checkbox" checked={Boolean(form[f.name])} onChange={e => setForm({ ...form, [f.name]: e.target.checked })} /> :
           <input type={f.type || 'text'} min={f.min} max={f.max} list={f.listId} value={form[f.name] ?? ''} onChange={e => setForm({ ...form, [f.name]: e.target.value })} />}
        </label>)}
      </div>
      {showNewSkillNotice ? <p className="warning">{t.newSkillNotice}</p> : null}
      <div className="quickFormActions splitActions">{!editingId ? <button className="btn" type="button" disabled={busy} onClick={() => saveItem(true)}>{busy ? t.saving : t.saveAddAnother}</button> : <span /> }<button className="btn primary" disabled={busy}>{busy ? t.saving : editingId ? t.update : t.saveClose}</button></div>
      {error ? <p className="error">{error}</p> : null}{success ? <p className="success">{success}</p> : null}
    </form> : null}
    <div className="simpleRows">{rows.length === 0 ? <p className="muted">{t.noItems}</p> : rows.map(row => <div className="simpleRow" key={row.id}><div className="simpleRowMain"><strong>{mainLabel(row)}</strong><span>{secondLabel(row)}{row.rating ? ` · ${row.rating}/5` : ''}</span></div><div className="simpleRowActions">{row.is_hidden ? <span className="hiddenPill">{t.hidden}</span> : null}{row.hide_description ? <span className="hiddenPill lightPill">No descr.</span> : null}<button type="button" onClick={() => editRow(row)}>{t.edit}</button><button type="button" className="danger" onClick={() => remove(row.id)}>{t.delete}</button></div></div>)}</div>
  </section>;
}
