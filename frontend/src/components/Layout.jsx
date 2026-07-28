import { NavLink, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, UtensilsCrossed, Package, ChefHat,
  Table2, ShoppingCart, Truck, ClipboardList,
  Receipt, TrendingUp, LogOut, Users, Warehouse, Box, ScrollText
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: null },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed, roles: null },
  { to: '/ingredients', label: 'Ingredients', icon: Package, roles: null },
  { to: '/recipes', label: 'Recipes', icon: ChefHat, roles: null },
  { to: '/tables', label: 'Tables', icon: Table2, roles: null },
  { to: '/orders', label: 'Orders', icon: ShoppingCart, roles: null },
  { to: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['owner', 'manager', 'store_manager'] },
  { to: '/warehouses', label: 'Warehouses', icon: Warehouse, roles: ['owner', 'manager', 'store_manager'] },
  { to: '/products', label: 'Products', icon: Box, roles: ['owner', 'manager', 'store_manager'] },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardList, roles: ['owner', 'manager', 'store_manager'] },
  { to: '/expenses', label: 'Expenses', icon: Receipt, roles: ['owner', 'manager'] },
  { to: '/staff', label: 'Staff', icon: Users, roles: ['owner'] },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: ['owner', 'manager'] },
  { to: '/insights', label: 'AI Insights', icon: TrendingUp, roles: null },
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
          {navItems.filter(item => !item.roles || item.roles.includes(user?.role)).map(({ to, label, icon: Icon }) => (
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
        <div className="flex justify-end items-center px-8 pt-6">
          <NotificationBell />
        </div>
        <div className="px-8 pb-8 pt-2">{children}</div>
      </main>
    </div>
  );
}
