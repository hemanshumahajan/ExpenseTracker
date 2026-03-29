import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import styles from './CRUD.module.css';

const EMPTY = { title: '', icon: '', type: 'Expense' };

export default function Categories() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await api.getCategories()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (c) => {
    setForm({ title: c.title, icon: c.icon, type: c.type });
    setEditId(c.categoryId);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await api.updateCategory(editId, { ...form, categoryId: editId });
      else        await api.createCategory(form);
      setModal(false);
      await load();
    } catch (e) { alert('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    setDeleting(id);
    try { await api.deleteCategory(id); await load(); }
    catch (e) { alert('Error: ' + e.message); }
    finally { setDeleting(null); }
  };

  const income  = rows.filter(r => r.type === 'Income');
  const expense = rows.filter(r => r.type === 'Expense');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.subtitle}>{rows.length} categories</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>+ New Category</button>
      </header>

      {error && <p className={styles.error}>⚠ {error}</p>}

      {loading ? (
        <div className={styles.center}><div className={styles.spinner} /></div>
      ) : rows.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>◉</span>
          <p>No categories yet</p>
          <button className={styles.btnPrimary} onClick={openCreate}>Add your first category</button>
        </div>
      ) : (
        <div className={styles.catGrid}>
          {[['Income', income, '#00e5a0'], ['Expense', expense, '#ff4d6d']].map(([label, list, color]) => (
            <div key={label} className={styles.catSection}>
              <div className={styles.catSectionHeader} style={{ '--c': color }}>
                <span className={styles.catSectionDot} style={{ background: color }} />
                <span>{label}</span>
                <span className={styles.catCount}>{list.length}</span>
              </div>
              <div className={styles.catCards}>
                {list.map(c => (
                  <div key={c.categoryId} className={styles.catCard}>
                    <span className={styles.catCardIcon}>{c.icon}</span>
                    <div className={styles.catCardBody}>
                      <span className={styles.catCardTitle}>{c.title}</span>
                      <span className={styles.catCardType} style={{ color }}>{c.type}</span>
                    </div>
                    <div className={styles.catCardActions}>
                      <button className={styles.btnEdit} onClick={() => openEdit(c)}>Edit</button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(c.categoryId)}
                        disabled={deleting === c.categoryId}
                      >
                        {deleting === c.categoryId ? '…' : 'Del'}
                      </button>
                    </div>
                  </div>
                ))}
                {list.length === 0 && (
                  <p className={styles.emptySection}>No {label.toLowerCase()} categories</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSave} className={styles.form}>
          <label className={styles.label}>
            Title
            <input
              type="text" maxLength={50} className={styles.input}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Food & Dining"
              required
            />
          </label>

          <label className={styles.label}>
            Icon (emoji)
            <input
              type="text" maxLength={5} className={styles.input}
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              placeholder="🍔"
            />
          </label>

          <label className={styles.label}>
            Type
            <select
              className={styles.input}
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </label>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
