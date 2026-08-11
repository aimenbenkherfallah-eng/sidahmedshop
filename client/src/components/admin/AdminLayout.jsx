import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { to: '/admin', icon: '📊', key: 'dashboard', end: true },
  { to: '/admin/orders', icon: '📦', key: 'orders' },
  { to: '/admin/products', icon: '🛍️', key: 'products' },
  { to: '/admin/settings', icon: '⚙️', key: 'settings' },
];

export default function AdminLayout() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100" dir="ltr">
      <aside className="fixed inset-y-0 start-0 z-30 flex w-16 flex-col border-e border-slate-200 bg-white lg:w-60">
        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-4 lg:px-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 font-black text-white">
            S
          </span>
          <div className="hidden lg:block">
            <p className="text-sm font-extrabold text-primary-800">Sidahmed Shop</p>
            <p className="text-xs font-bold text-accent-600">Admin</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden lg:inline">{t.admin[item.key]}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-2">
          <div className="hidden px-3 py-1 text-xs text-slate-400 lg:block">{user?.username}</div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50"
          >
            <span className="text-lg">🚪</span>
            <span className="hidden lg:inline">{t.admin.logout}</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 ps-16 lg:ps-60">
        <div className="mx-auto max-w-6xl p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
