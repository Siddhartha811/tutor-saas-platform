import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Wallet, Settings, LogOut, Bell } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/students', icon: Users, label: 'Students' },
  { to: '/dashboard/sessions', icon: CalendarDays, label: 'Sessions' },
  { to: '/dashboard/billing', icon: Wallet, label: 'Billing' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { user, tenant, logout } = useAuth();
  const initials = user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="font-body flex h-screen bg-neutral-50">
      <aside className="flex w-[220px] flex-col justify-between bg-emerald-950 px-5 py-6">
        <div>
          <div className="font-display px-1 text-[13px] tracking-[0.2em] text-emerald-200/70">ATELIER</div>
          <nav className="mt-8 space-y-1">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors ${
                    isActive ? 'bg-emerald-900 text-emerald-50' : 'text-emerald-200/60 hover:bg-emerald-900/50 hover:text-emerald-100'
                  }`
                }
              >
                <Icon size={15} strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button onClick={logout} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-emerald-200/50 hover:text-emerald-100">
          <LogOut size={15} strokeWidth={1.75} />
          Log out
        </button>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-8 py-5">
          <div>
            <p className="font-display text-[19px] text-neutral-900">{tenant?.name || '—'}</p>
            <p className="font-body text-[12px] text-neutral-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={17} strokeWidth={1.75} className="text-neutral-400" />
            <div className="h-8 w-8 rounded-full bg-emerald-950 text-center text-[12px] font-medium leading-8 text-emerald-50">
              {initials}
            </div>
          </div>
        </header>

        <main className="px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}