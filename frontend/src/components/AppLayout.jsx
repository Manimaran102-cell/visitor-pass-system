import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE = {
  admin: [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/employees', label: 'Employees' },
    { to: '/users', label: 'User Accounts' },
    { to: '/visitors', label: 'Visitor Reports' },
    { to: '/activity', label: 'Activity History' },
    { to: '/reports', label: 'Reports' },
  ],
  receptionist: [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/register', label: 'Register Visitor' },
    { to: '/visitors', label: 'Visitor Desk' },
    { to: '/history', label: 'Visitor History' },
  ],
  employee: [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/requests', label: 'Visitor Requests' },
  ],
};

const ROLE_LABEL = { admin: 'Administrator', receptionist: 'Receptionist', employee: 'Employee' };

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = NAV_BY_ROLE[user.role] || [];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-ink-950 text-mist-100 flex flex-col transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static`}
      >
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div className="badge-punch h-9 w-9 rounded-md bg-brass-500 flex items-center justify-center shrink-0">
            <span className="font-mono text-[11px] font-bold text-ink-950">VP</span>
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-none">Gatekeep</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-mist-100/50 mt-1">Visitor Pass System</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brass-500 text-ink-950' : 'text-mist-100/80 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-5 border-t border-white/10">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-mist-100/50">{ROLE_LABEL[user.role]}</p>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-mist-100/80 hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-mist-200">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2" aria-label="Open menu">
            <span className="block w-5 h-0.5 bg-ink-900 mb-1" />
            <span className="block w-5 h-0.5 bg-ink-900 mb-1" />
            <span className="block w-5 h-0.5 bg-ink-900" />
          </button>
          <p className="font-display font-semibold">Gatekeep</p>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
