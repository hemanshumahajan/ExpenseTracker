import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import styles from './CRUD.module.css';

const EMPTY = { categoryId: '', amount: '', note: '', date: new Date().toISOString().split('T')[0] };

const fmtCurrency = v =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default function Transactions() {
  const [rows, setRows]         = useState([]);
  const [categories, setCats]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txns, cats] = await Promise.all([api.getTransactions(), api.getCategories()]);
      setRows(txns.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setCats(cats);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (t) => {
    setForm({
      categoryId: t.categoryId,
      amount:     t.amount,
      note:       t.note || '',
      date:       t.date.split('T')[0],
    });
    setEditId(t.transactionId);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        categoryId: parseInt(form.categoryId),
        amount:     parseInt(form.amount),
      };
      if (editId) {
        await api.updateTransaction(editId, { ...payload, transactionId: editId });
      } else {
        await api.createTransaction(payload);
      }
      setModal(false);
      await load();
    } catch (e) { alert('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    setDeleting(id);
    try { await api.deleteTransaction(id); await load(); }
    catch (e) { alert('Error: ' + e.message); }
    finally { setDeleting(null); }
  };

  const getCat = (id) => categories.find(c => c.categoryId === id);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.subtitle}>{rows.length} records</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>+ New Transaction</button>
      </header>

      {error && <p className={styles.error}>⚠ {error}</p>}

      {loading ? (
        <div className={styles.center}><div className={styles.spinner} /></div>
      ) : rows.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>⇄</span>
          <p>No transactions yet</p>
          <button className={styles.btnPrimary} onClick={openCreate}>Add your first transaction</button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Note</th>
                <th>Date</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => {
                const cat = getCat(t.categoryId);
                const isIncome = (typeof t.type === 'string' ? t.type : cat?.type) === 'Income';
                return (
                  <tr key={t.transactionId}>
                    <td className={styles.mono}>{i + 1}</td>
                    <td>
                      <span className={styles.catBadge}>
                        {t.icon || cat?.icon} {typeof t.category === 'object' ? t.category?.title : (t.category || cat?.title)}
                      </span>
                    </td>
                    <td className={styles.note}>{t.note || '—'}</td>
                    <td className={styles.mono}>
                      {new Date(t.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' })}
                    </td>
                    <td>
                      <span className={`${styles.amount} ${isIncome ? styles.income : styles.expense}`}>
                        {isIncome ? '+' : '-'} {fmtCurrency(t.amount)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.btnEdit} onClick={() => openEdit(t)}>Edit</button>
                        <button
                          className={styles.btnDelete}
                          onClick={() => handleDelete(t.transactionId)}
                          disabled={deleting === t.transactionId}
                        >
                          {deleting === t.transactionId ? '…' : 'Del'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Transaction' : 'New Transaction'}>
        <form onSubmit={handleSave} className={styles.form}>
          <label className={styles.label}>
            Category
            <select
              className={styles.input}
              value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              required
            >
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.icon} {c.title} ({c.type})
                </option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Amount (₹)
            <input
              type="number" min="1" className={styles.input}
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              required
            />
          </label>

          <label className={styles.label}>
            Note (optional)
            <input
              type="text" maxLength={75} className={styles.input}
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="What was this for?"
            />
          </label>

          <label className={styles.label}>
            Date
            <input
              type="date" className={styles.input}
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
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
