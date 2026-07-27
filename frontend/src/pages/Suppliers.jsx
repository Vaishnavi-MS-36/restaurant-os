import { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Suppliers() {
  const { user } = useAuth();
  const canManage = ['owner', 'manager'].includes(user?.role);
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '' });

  const load = () => { client.get('/suppliers/').then(res => setSuppliers(res.data)); };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await client.post('/suppliers/', form);
      setShowModal(false);
      setForm({ name: '', contact_person: '', phone: '', email: '', address: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add supplier');
    }
  };

  const handleDelete = async (id) => {
    await client.delete(`/suppliers/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Suppliers</h1>
          <p className="text-cream/50">Manage supplier contacts</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setShowModal(true); setError(''); }}
            className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={18} /> Add Supplier
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display text-lg text-cream">{s.name}</h3>
              {canManage && (
                <button onClick={() => handleDelete(s.id)} className="text-cream/30 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            {s.contact_person && <p className="text-cream/60 text-sm">{s.contact_person}</p>}
            {s.phone && <p className="text-cream/50 text-sm font-mono">{s.phone}</p>}
            {s.email && <p className="text-cream/50 text-sm">{s.email}</p>}
          </div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="text-center py-16 text-cream/40">No suppliers yet</div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Supplier">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormField label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <FormField label="Contact Person" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} />
          <FormField label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <FormField label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <FormField label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          <button type="submit" className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors">
            Add Supplier
          </button>
        </form>
      </Modal>
    </div>
  );
}
