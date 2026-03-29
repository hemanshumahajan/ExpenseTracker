import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import styles from './App.module.css';

const NAV = [
  { to: '/',             icon: '◈', label: 'Dashboard'    },
  { to: '/transactions', icon: '⇄', label: 'Transactions'  },
  { to: '/categories',   icon: '◉', label: 'Categories'    },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>₹</span>
            <span className={styles.logoText}>Xpense</span>
          </div>
          <nav className={styles.nav}>
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.navIcon}>{n.icon}</span>
                <span>{n.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className={styles.sidebarFooter}>
            <div className={styles.dot} />
            <span className={styles.footerText}>Live Sync</span>
          </div>
        </aside>

        <main className={styles.main}>
          <Routes>
            <Route path="/"             element={<Dashboard />}    />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories"   element={<Categories />}   />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
