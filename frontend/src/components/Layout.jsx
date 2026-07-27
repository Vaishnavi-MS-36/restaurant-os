import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, UtensilsCrossed, Package, ChefHat,
  Table2, ShoppingCart, Truck, ClipboardList,
  Receipt, TrendingUp, LogOut
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/ingredients', label: 'Ingredients', icon: Package },
  { to: '/recipes', label: 'Recipes', icon: ChefHat },
  { to: '/tables', label: 'Tables', icon: Table2 },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/insights', label: 'AI Insights', icon: TrendingUp },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-charcoal-950">
      <aside className="w-64 bg-charcoal-900 border-r border-charcoal-700 flex flex-col">
        <div className="p-6 border-b border-charcoal-700">
          <h1 className="font-display text-2xl text-terracotta-400 font-semibold">RestaurantOS</h1>
          <p className="text-xs text-cream/50 mt-1 font-mono">{user?.role?.toUpperCase()}</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-terracotta-500/15 text-terracotta-400'
                    : 'text-cream/70 hover:bg-charcoal-800 hover:text-cream'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-charcoal-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream/70 hover:bg-charcoal-800 hover:text-cream w-full transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
