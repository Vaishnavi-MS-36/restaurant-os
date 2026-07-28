import { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { Plus, Trash2, Warehouse as WarehouseIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Warehouses() {
  const { user } = useAuth();
  const canManage = ['owner', 'manager', 'store_manager'].includes(user?.role);
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '' });

  const load = () => { client.get('/warehouses/').then(res => setWarehouses(res.data)); };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await client.post('/warehouses/', form);
    setShowModal(false);
    setForm({ name: '', location: '' });
    load();
  };

  const handleDelete = async (id) => {
    await client.delete(`/warehouses/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Warehouses</h1>
          <p className="text-cream/50">Storage locations for ingredients and products</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={18} /> Add Warehouse
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map(w => (
          <div key={w.id} className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <WarehouseIcon size={18} className="text-terracotta-400" />
                <h3 className="font-display text-lg text-cream">{w.name}</h3>
              </div>
              {canManage && (
                <button onClick={() => handleDelete(w.id)} className="text-cream/30 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            {w.location && <p className="text-cream/50 text-sm">{w.location}</p>}
          </div>
        ))}
      </div>
      {warehouses.length === 0 && <div className="text-center py-16 text-cream/40">No warehouses yet</div>}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Warehouse">
        <form onSubmit={handleSubmit}>
          <FormField label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <FormField label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <button type="submit" className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors">
            Add Warehouse
          </button>
        </form>
      </Modal>
    </div>
  );
}
