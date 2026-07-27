import { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  available: 'bg-green-500/15 text-green-400',
  occupied: 'bg-red-500/15 text-red-400',
  reserved: 'bg-amber-500/15 text-amber-400',
};

export default function Tables() {
  const { user } = useAuth();
  const canManage = ['owner', 'manager'].includes(user?.role);
  const [tables, setTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ number: '', capacity: '', status: 'available' });

  const load = () => { client.get('/tables/').then(res => setTables(res.data)); };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await client.post('/tables/', {
        number: parseInt(form.number),
        capacity: parseInt(form.capacity),
        status: form.status,
      });
      setShowModal(false);
      setForm({ number: '', capacity: '', status: 'available' });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add table');
    }
  };

  const cycleStatus = async (table) => {
    const next = table.status === 'available' ? 'occupied' : table.status === 'occupied' ? 'reserved' : 'available';
    await client.put(`/tables/${table.id}`, { ...table, status: next });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Tables</h1>
          <p className="text-cream/50">Click a table to cycle its status</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setShowModal(true); setError(''); }}
            className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={18} /> Add Table
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => cycleStatus(table)}
            className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5 text-left hover:border-terracotta-500/50 transition-colors"
          >
            <div className="font-display text-2xl text-cream mb-1">#{table.number}</div>
            <div className="text-cream/50 text-sm mb-3">Seats {table.capacity}</div>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[table.status]}`}>
              {table.status}
            </span>
          </button>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-16 text-cream/40">No tables yet</div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Table">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormField label="Table Number" type="number" required value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
          <FormField label="Capacity" type="number" required value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
          <button type="submit" className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors">
            Add Table
          </button>
        </form>
      </Modal>
    </div>
  );
}
