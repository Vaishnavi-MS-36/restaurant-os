import { useEffect, useState } from 'react';
import client from '../api/client';
import { TrendingUp, ShoppingCart, Table2, AlertTriangle, Wallet, Truck, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [profit, setProfit] = useState(null);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    Promise.all([
      client.get('/dashboard/sales-overview'),
      client.get('/dashboard/active-orders'),
      client.get('/dashboard/table-occupancy'),
      client.get('/dashboard/low-stock'),
      client.get('/dashboard/monthly-expenses'),
      client.get('/dashboard/purchase-summary'),
      client.get('/dashboard/profit-overview'),
      client.get('/dashboard/sales-trend'),
    ]).then(([s, a, o, l, e, p, pr, t]) => {
      setSales(s.data);
      setActiveOrders(a.data);
      setOccupancy(o.data);
      setLowStock(l.data);
      setExpenses(e.data);
      setPurchases(p.data);
      setProfit(pr.data);
      setTrend(t.data.data.map(d => ({ ...d, date: d.date.slice(5) })));
    });
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream mb-1">Dashboard</h1>
      <p className="text-cream/50 mb-6">Overview of your restaurant's performance</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={sales ? `₹${sales.total_revenue.toFixed(2)}` : '—'}
          sublabel={sales ? `${sales.total_orders} completed orders` : ''}
        />
        <StatCard
          icon={DollarSign}
          label="Profit"
          value={profit ? `₹${profit.profit.toFixed(2)}` : '—'}
          sublabel={profit ? `₹${profit.total_expenses.toFixed(2)} total expenses` : ''}
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

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5">
        <h2 className="font-display text-lg text-cream mb-4">Revenue — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#332b26" />
            <XAxis dataKey="date" stroke="#f5efe680" fontSize={12} />
            <YAxis stroke="#f5efe680" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#25201d', border: '1px solid #332b26', borderRadius: '8px', color: '#f5efe6' }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#d9754a" strokeWidth={2} dot={{ fill: '#d9754a' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
