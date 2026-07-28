import { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { Plus, Trash2, Pencil, AlertTriangle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Ingredients() {
  const { user } = useAuth();
  const canManage = ['owner', 'manager'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', unit: '', current_stock: '', reorder_threshold: '' });

  const load = () => { client.get('/ingredients/', { params: search ? { search } : {} }).then(res => setItems(res.data)); };
  useEffect(load, [search]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', unit: '', current_stock: '', reorder_threshold: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      unit: item.unit,
      current_stock: item.current_stock,
      reorder_threshold: item.reorder_threshold,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      current_stock: parseFloat(form.current_stock) || 0,
      reorder_threshold: parseFloat(form.reorder_threshold) || 0,
    };
    if (editingId) {
      await client.put(`/ingredients/${editingId}`, payload);
    } else {
      await client.post('/ingredients/', payload);
    }
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', unit: '', current_stock: '', reorder_threshold: '' });
    load();
  };

  const handleDelete = async (id) => {
    await client.delete(`/ingredients/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Ingredients</h1>
          <p className="text-cream/50">Track stock levels for every ingredient</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium px-4 py-2.5 rounded-lg transition-colors">
            <Plus size={18} /> Add Ingredient
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
        <input
          type="text"
          placeholder="Search ingredients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm bg-charcoal-900 border border-charcoal-700 rounded-lg pl-10 pr-3 py-2.5 text-cream placeholder-cream/30 focus:outline-none focus:border-terracotta-500 transition-colors"
        />
      </div>

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-700 text-cream/50 text-left">
              <th className="px-5 py-3 font-normal">Name</th>
              <th className="px-5 py-3 font-normal">Current Stock</th>
              <th className="px-5 py-3 font-normal">Reorder Threshold</th>
              <th className="px-5 py-3 font-normal"></th>
              {canManage && <th className="px-5 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const low = item.current_stock <= item.reorder_threshold;
              return (
                <tr key={item.id} className="border-b border-charcoal-800 last:border-0">
                  <td className="px-5 py-3 text-cream">{item.name}</td>
                  <td className="px-5 py-3 text-cream/80 font-mono">{item.current_stock} {item.unit}</td>
                  <td className="px-5 py-3 text-cream/60 font-mono">{item.reorder_threshold} {item.unit}</td>
                  <td className="px-5 py-3">
                    {low && <span className="flex items-center gap-1 text-amber-400 text-xs"><AlertTriangle size={14} /> Low stock</span>}
                  </td>
                  {canManage && (
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(item)} className="text-cream/30 hover:text-terracotta-400 transition-colors"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-cream/30 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && <div className="text-center py-16 text-cream/40">No ingredients found</div>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Ingredient' : 'Add Ingredient'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <FormField label="Unit (kg, litre, piece...)" required value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
          <FormField label="Current Stock" type="number" step="0.01" value={form.current_stock} onChange={e => setForm({ ...form, current_stock: e.target.value })} />
          <FormField label="Reorder Threshold" type="number" step="0.01" value={form.reorder_threshold} onChange={e => setForm({ ...form, reorder_threshold: e.target.value })} />
          <button type="submit" className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors">
            {editingId ? 'Save Changes' : 'Add Ingredient'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
