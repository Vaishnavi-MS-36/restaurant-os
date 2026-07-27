import { useEffect, useState } from 'react';
import client from '../api/client';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function Insights() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    client.get('/ai/stock-predictions').then(res => setPredictions(res.data));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream mb-1">AI Insights</h1>
      <p className="text-cream/50 mb-6">Stock predictions based on recent consumption patterns</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {predictions.map(p => (
          <div key={p.ingredient_id} className={`bg-charcoal-900 border rounded-2xl p-5 ${p.is_low_stock ? 'border-amber-500/40' : 'border-charcoal-700'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg text-cream">{p.ingredient_name}</h3>
              {p.is_low_stock && <AlertTriangle size={16} className="text-amber-400" />}
            </div>

            <div className="text-sm space-y-1.5">
              <div className="flex justify-between text-cream/60">
                <span>Current stock</span>
                <span className="font-mono text-cream">{p.current_stock} {p.unit}</span>
              </div>
              <div className="flex justify-between text-cream/60">
                <span>Avg. daily use</span>
                <span className="font-mono text-cream">{p.avg_daily_consumption} {p.unit}</span>
              </div>
              <div className="flex justify-between text-cream/60">
                <span>Days remaining</span>
                <span className="font-mono text-cream">{p.days_remaining ?? '—'}</span>
              </div>
            </div>

            {p.suggested_reorder_qty > 0 && (
              <div className="mt-3 pt-3 border-t border-charcoal-700 flex items-center gap-2 text-terracotta-400 text-sm">
                <TrendingUp size={14} />
                Suggest reordering {p.suggested_reorder_qty} {p.unit}
              </div>
            )}
          </div>
        ))}
      </div>

      {predictions.length === 0 && (
        <div className="text-center py-16 text-cream/40">No ingredients to analyze yet</div>
      )}
    </div>
  );
}
