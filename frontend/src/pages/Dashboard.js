import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import styles from './Dashboard.module.css';

const COLORS = ['#6c63ff','#ff6584','#00e5a0','#ffa94d','#74c0fc','#f783ac'];

function StatCard({ label, value, type }) {
  const colorMap = { income: '#00e5a0', expense: '#ff4d6d', balance: '#6c63ff' };
  const color = colorMap[type] || '#6c63ff';
  return (
    <div className={styles.statCard} style={{ '--card-accent': color }}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue} style={{ color }}>{value}</span>
    </div>
  );
}

const fmtCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {fmtCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}><div className={styles.spinner} /></div>;
  if (error)   return <div className={styles.center}><p className={styles.error}>⚠ {error}</p></div>;

  const spline = data.splineChartData || [];
  const donut  = data.doughnutChartData || [];
  const recent = data.recentTransactions || [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Last 7 days overview</p>
        </div>
        <div className={styles.dateChip}>
          {new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
        </div>
      </header>

      {/* Stat Cards */}
      <div className={styles.statsRow}>
        <StatCard label="Total Income"  value={fmtCurrency(data.totalIncome)}  type="income"  />
        <StatCard label="Total Expense" value={fmtCurrency(data.totalExpense)} type="expense" />
        <StatCard label="Balance"       value={fmtCurrency(data.balance)}      type="balance" />
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Spline / Area Chart */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={spline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00e5a0" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00e5a0" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ff4d6d" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
              <XAxis dataKey="day" tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false}
                     tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income"  stroke="#00e5a0" strokeWidth={2} fill="url(#gIncome)"  name="Income"  />
              <Area type="monotone" dataKey="expense" stroke="#ff4d6d" strokeWidth={2} fill="url(#gExpense)" name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Expense Breakdown</h2>
          {donut.length === 0 ? (
            <div className={styles.empty}>No expense data</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={donut} dataKey="amount" nameKey="categoryTitleWithIcon"
                     cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                     paddingAngle={3} strokeWidth={0}>
                  {donut.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmtCurrency(v)} />
                <Legend iconType="circle" iconSize={8}
                        formatter={(v) => <span style={{ color:'#9ca3af', fontSize:12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Recent Transactions</h2>
        {recent.length === 0 ? (
          <div className={styles.empty}>No recent transactions</div>
        ) : (
          <div className={styles.txList}>
            {recent.map(t => (
              <div key={t.transactionId} className={styles.txRow}>
                <span className={styles.txIcon}>{t.icon}</span>
                <div className={styles.txInfo}>
                  <span className={styles.txCategory}>{t.category}</span>
                  {t.note && <span className={styles.txNote}>{t.note}</span>}
                </div>
                <span className={styles.txDate}>
                  {new Date(t.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                </span>
                <span className={`${styles.txAmount} ${t.type === 'Income' ? styles.income : styles.expense}`}>
                  {t.type === 'Income' ? '+' : '-'} {fmtCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
