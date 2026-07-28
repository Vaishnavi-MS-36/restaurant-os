import { useEffect, useState } from 'react';
import client from '../api/client';
import { ScrollText } from 'lucide-react';

const actionColors = {
  create: 'bg-green-500/15 text-green-400',
  update: 'bg-amber-500/15 text-amber-400',
  delete: 'bg-red-500/15 text-red-400',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    client.get('/audit-logs/').then(res => setLogs(res.data));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream mb-1 flex items-center gap-2">
        <ScrollText size={28} className="text-terracotta-400" /> Audit Logs
      </h1>
      <p className="text-cream/50 mb-6">Recent activity across the platform</p>

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-700 text-cream/50 text-left">
              <th className="px-5 py-3 font-normal">Action</th>
              <th className="px-5 py-3 font-normal">Entity</th>
              <th className="px-5 py-3 font-normal">Details</th>
              <th className="px-5 py-3 font-normal">User ID</th>
              <th className="px-5 py-3 font-normal">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-charcoal-800 last:border-0">
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${actionColors[log.action] || 'bg-charcoal-800 text-cream/60'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-5 py-3 text-cream/70 capitalize">{log.entity_type.replace('_', ' ')} #{log.entity_id}</td>
                <td className="px-5 py-3 text-cream/60">{log.details || '—'}</td>
                <td className="px-5 py-3 text-cream/50 font-mono">{log.user_id ?? '—'}</td>
                <td className="px-5 py-3 text-cream/40 text-xs">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <div className="text-center py-16 text-cream/40">No activity logged yet</div>}
      </div>
    </div>
  );
}
