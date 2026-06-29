'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

function emptyFromFields(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'checkbox' ? false : '';
    return acc;
  }, {});
}

export default function SectionManager({ title, table, fields, rows, userId, onChange }) {
  const [form, setForm] = useState(emptyFromFields(fields));
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function editRow(row) {
    const next = emptyFromFields(fields);
    fields.forEach((field) => {
      next[field.name] = row[field.name] ?? (field.type === 'checkbox' ? false : '');
    });
    setForm(next);
    setEditingId(row.id);
    setError('');
  }

  function reset() {
    setForm(emptyFromFields(fields));
    setEditingId(null);
    setError('');
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = { ...form, user_id: userId };
    fields.forEach((field) => {
      if (field.type === 'date' && payload[field.name] === '') payload[field.name] = null;
    });
    const query = editingId
      ? supabase.from(table).update(payload).eq('id', editingId).eq('user_id', userId)
      : supabase.from(table).insert(payload);
    const { error: saveError } = await query;
    setBusy(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    reset();
    onChange();
  }

  async function remove(id) {
    const confirmDelete = window.confirm('Vuoi eliminare questo elemento?');
    if (!confirmDelete) return;
    const { error: deleteError } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    onChange();
  }

  return (
    <section className="card section-card">
      <div className="section-head">
        <h2>{title}</h2>
        {editingId ? <button className="btn small" onClick={reset}>Annulla modifica</button> : null}
      </div>

      <form className="inline-form" onSubmit={save}>
        {fields.map((field) => (
          <label key={field.name} className={field.type === 'textarea' ? 'wide' : ''}>
            <span>{field.label}</span>
            {field.type === 'textarea' ? (
              <textarea value={form[field.name] || ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} rows={3} />
            ) : field.type === 'select' ? (
              <select value={form[field.name] || ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}>
                {(field.options || []).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            ) : field.type === 'checkbox' ? (
              <input type="checkbox" checked={Boolean(form[field.name])} onChange={(e) => setForm({ ...form, [field.name]: e.target.checked })} />
            ) : (
              <input type={field.type || 'text'} value={form[field.name] || ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
            )}
          </label>
        ))}
        <button className="btn primary" disabled={busy}>{editingId ? 'Aggiorna' : 'Aggiungi'}</button>
      </form>

      {error ? <p className="error">{error}</p> : null}

      <div className="rows">
        {rows.length === 0 ? <p className="muted">Nessun elemento inserito.</p> : null}
        {rows.map((row) => (
          <div className="row" key={row.id}>
            <div>
              <strong>{row.role_title || row.title || row.name || row.lingua}</strong>
              <span>{row.company || row.institution || row.issuer || row.role || row.livello || row.description || row.impact}</span>
            </div>
            <div className="row-actions">
              <button onClick={() => editRow(row)}>Modifica</button>
              <button className="danger" onClick={() => remove(row.id)}>Elimina</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
