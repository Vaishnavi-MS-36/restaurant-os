import { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { Plus, Trash2, Pencil, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Menu() {
  const { user } = useAuth();
  const canManage = ['owner', 'manager'].includes(user?.role);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '' });

  const load = () => {
    client.get('/menu/items', { params: search ? { search } : {} }).then(res => setItems(res.data));
    client.get('/menu/categories').then(res => setCategories(res.data));
  };
  useEffect(load, [search]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '', price: '', category_id: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category_id: item.category_id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      category_id: form.category_id ? parseInt(form.category_id) : null,
    };
    if (editingId) {
      await client.put(`/menu/items/${editingId}`, payload);
    } else {
      await client.post('/menu/items', payload);
    }
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', description: '', price: '', category_id: '' });
    load();
  };

  const handleDelete = async (id) => {
    await client.delete(`/menu/items/${id}`);
    load();
  };

  const categoryName = (id) => categories.find(c => c.id === id)?.name || '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Menu</h1>
          <p className="text-cream/50">Manage your restaurant's menu items</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium px-4 py-2.5 rounded-lg transition-colors">
            <Plus size={18} /> Add Item
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm bg-charcoal-900 border border-charcoal-700 rounded-lg pl-10 pr-3 py-2.5 text-cream placeholder-cream/30 focus:outline-none focus:border-terracotta-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-display text-lg text-cream">{item.name}</h3>
              {canManage && (
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="text-cream/30 hover:text-terracotta-400 transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-cream/30 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
            <p className="text-cream/50 text-sm mb-3">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-terracotta-400 font-mono text-lg">₹{item.price}</span>
              <span className="text-xs text-cream/40 bg-charcoal-800 px-2 py-1 rounded-full">{categoryName(item.category_id)}</span>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && <div className="text-center py-16 text-cream/40">No menu items found</div>}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Menu Item' : 'Add Menu Item'}>
        <form onSubmit={handleSubmit}>
          <FormField label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <FormField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <FormField label="Price" type="number" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <div className="mb-4">
            <label className="block text-sm text-cream/70 mb-1.5">Category</label>
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream focus:outline-none focus:border-terracotta-500">
              <option value="">None</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors">
            {editingId ? 'Save Changes' : 'Add Item'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
