import { useEffect, useState } from 'react';
import client from '../api/client';
import { TrendingUp, AlertTriangle, DollarSign, Clock, Trash2 } from 'lucide-react';

const TABS = [
  { key: 'stock', label: 'Stock Predictions', icon: TrendingUp },
  { key: 'pricing', label: 'Menu Pricing', icon: DollarSign },
  { key: 'prep', label: 'Prep Time', icon: Clock },
  { key: 'waste', label: 'Waste Risk', icon: Trash2 },
];

export default function Insights() {
  const [tab, setTab] = useState('stock');
  const [stock, setStock] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [prep, setPrep] = useState([]);
  const [waste, setWaste] = useState([]);

  useEffect(() => {
    client.get('/ai/stock-predictions').then(res => setStock(res.data));
    client.get('/ai/menu-pricing').then(res => setPricing(res.data));
    client.get('/ai/prep-time').then(res => setPrep(res.data));
    client.get('/ai/waste-analysis').then(res => setWaste(res.data));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream mb-1">AI Insights</h1>
      <p className="text-cream/50 mb-6">Predictions and recommendations powered by your operational data</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              tab === key ? 'bg-terracotta-500 text-charcoal-950 font-medium' : 'bg-charcoal-900 border border-charcoal-700 text-cream/70 hover:text-cream'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'stock' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stock.map(p => (
            <div key={p.ingredient_id} className={`bg-charcoal-900 border rounded-2xl p-5 ${p.is_low_stock ? 'border-amber-500/40' : 'border-charcoal-700'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg text-cream">{p.ingredient_name}</h3>
                {p.is_low_stock && <AlertTriangle size={16} className="text-amber-400" />}
              </div>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between text-cream/60"><span>Current stock</span><span className="font-mono text-cream">{p.current_stock} {p.unit}</span></div>
                <div className="flex justify-between text-cream/60"><span>Avg. daily use</span><span className="font-mono text-cream">{p.avg_daily_consumption} {p.unit}</span></div>
                <div className="flex justify-between text-cream/60"><span>Days remaining</span><span className="font-mono text-cream">{p.days_remaining ?? '—'}</span></div>
              </div>
              {p.suggested_reorder_qty > 0 && (
                <div className="mt-3 pt-3 border-t border-charcoal-700 flex items-center gap-2 text-terracotta-400 text-sm">
                  <TrendingUp size={14} /> Suggest reordering {p.suggested_reorder_qty} {p.unit}
                </div>
              )}
            </div>
          ))}
          {stock.length === 0 && <div className="text-center py-16 text-cream/40 col-span-full">No ingredients to analyze yet</div>}
        </div>
      )}

      {tab === 'pricing' && (
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal-700 text-cream/50 text-left">
                <th className="px-5 py-3 font-normal">Menu Item</th>
                <th className="px-5 py-3 font-normal">Current Price</th>
                <th className="px-5 py-3 font-normal">Ingredient Cost</th>
                <th className="px-5 py-3 font-normal">Suggested Price</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map(p => (
                <tr key={p.menu_item_id} className="border-b border-charcoal-800 last:border-0">
                  <td className="px-5 py-3 text-cream">{p.menu_item_name}</td>
                  <td className="px-5 py-3 text-cream/60 font-mono">₹{p.current_price}</td>
                  <td className="px-5 py-3 text-cream/60 font-mono">₹{p.estimated_ingredient_cost}</td>
                  <td className="px-5 py-3 text-terracotta-400 font-mono font-medium">₹{p.suggested_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pricing.length === 0 && <div className="text-center py-16 text-cream/40">No menu items to price yet</div>}
        </div>
      )}

      {tab === 'prep' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prep.map(p => (
            <div key={p.menu_item_id} className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5">
              <h3 className="font-display text-lg text-cream mb-2">{p.menu_item_name}</h3>
              <div className="flex items-center gap-2 text-terracotta-400">
                <Clock size={16} />
                <span className="font-mono text-xl">{p.estimated_prep_minutes} min</span>
              </div>
            </div>
          ))}
          {prep.length === 0 && <div className="text-center py-16 text-cream/40 col-span-full">No menu items to estimate yet</div>}
        </div>
      )}

      {tab === 'waste' && (
        <div className="space-y-3">
          {waste.map(w => (
            <div key={w.ingredient_id} className={`bg-charcoal-900 border rounded-2xl p-5 ${w.risk_level === 'high' ? 'border-red-500/40' : 'border-amber-500/40'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg text-cream">{w.ingredient_name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${w.risk_level === 'high' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {w.risk_level} risk
                </span>
              </div>
              <p className="text-cream/60 text-sm">{w.note}</p>
              <div className="text-cream/40 text-xs mt-2 font-mono">Current stock: {w.current_stock} {w.unit}</div>
            </div>
          ))}
          {waste.length === 0 && <div className="text-center py-16 text-cream/40">No waste risk items detected — good stock management!</div>}
        </div>
      )}
    </div>
  );
}
