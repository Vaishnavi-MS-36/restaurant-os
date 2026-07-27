import { useEffect, useState } from 'react';
import client from '../api/client';
import { TrendingUp, ShoppingCart, Table2, AlertTriangle, Wallet, Truck } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sublabel }) {
  return (
    <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-cream/50 text-sm">{label}</span>
        <Icon size={18} className="text-terracotta-400" />
      </div>
      <div className="font-display text-3xl text-cream">{value}</div>
      {sublabel && <div className="text-cream/40 text-xs mt-1">{sublabel}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [sales, setSales] = useState(null);
  const [activeOrders, setActiveOrders] = useState(null);
  const [occupancy, setOccupancy] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [expenses, setExpenses] = useState(null);
  const [purchases, setPurchases] = useState(null);

  useEffect(() => {
    Promise.all([
      client.get('/dashboard/sales-overview'),
      client.get('/dashboard/active-orders'),
      client.get('/dashboard/table-occupancy'),
      client.get('/dashboard/low-stock'),
      client.get('/dashboard/monthly-expenses'),
      client.get('/dashboard/purchase-summary'),
    ]).then(([s, a, o, l, e, p]) => {
      setSales(s.data);
      setActiveOrders(a.data);
      setOccupancy(o.data);
      setLowStock(l.data);
      setExpenses(e.data);
      setPurchases(p.data);
    });
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream mb-1">Dashboard</h1>
      <p className="text-cream/50 mb-6">Overview of your restaurant's performance</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={sales ? `₹${sales.total_revenue.toFixed(2)}` : '—'}
          sublabel={sales ? `${sales.total_orders} completed orders` : ''}
        />
        <StatCard
          icon={ShoppingCart}
          label="Active Orders"
          value={activeOrders ? activeOrders.active_orders : '—'}
        />
        <StatCard
          icon={Table2}
          label="Table Occupancy"
          value={occupancy ? `${occupancy.occupied}/${occupancy.total_tables}` : '—'}
          sublabel={occupancy ? `${occupancy.available} available` : ''}
        />
        <StatCard
          icon={Wallet}
          label="Monthly Expenses"
          value={expenses ? `₹${expenses.total_this_month.toFixed(2)}` : '—'}
        />
        <StatCard
          icon={Truck}
          label="Purchase Orders"
          value={purchases ? purchases.total_purchase_orders : '—'}
          sublabel={purchases ? `${purchases.pending} pending, ${purchases.received} received` : ''}
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={lowStock.length}
          sublabel={lowStock.length > 0 ? lowStock.map(i => i.name).join(', ') : 'All stocked'}
        />
      </div>
    </div>
  );
}
