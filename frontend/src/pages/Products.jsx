import { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Products() {
  const { user } = useAuth();
  const canManage = ['owner', 'manager', 'store_manager'].includes(user?.role);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category_id: '', price: '', stock_quantity: '', warehouse_id: '' });

  const load = () => {
    client.get('/products/').then(res => setProducts(res.data));
    client.get('/products/categories').then(res => setCategories(res.data));
    client.get('/warehouses/').then(res => setWarehouses(res.data));
  };
  useEffect(load, []);

  const categoryName = (id) => categories.find(c => c.id === id)?.name || '—';
  const warehouseName = (id) => warehouses.find(w => w.id === id)?.name || '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    await client.post('/products/', {
      ...form,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      warehouse_id: form.warehouse_id ? parseInt(form.warehouse_id) : null,
      price: parseFloat(form.price),
      stock_quantity: parseFloat(form.stock_quantity) || 0,
    });
    setShowModal(false);
    setForm({ name: '', sku: '', category_id: '', price: '', stock_quantity: '', warehouse_id: '' });
    load();
  };

  const handleDelete = async (id) => {
    await client.delete(`/products/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Products</h1>
          <p className="text-cream/50">Retail items sold as-is (drinks, packaged snacks)</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-700 text-cream/50 text-left">
              <th className="px-5 py-3 font-normal">Name</th>
              <th className="px-5 py-3 font-normal">SKU</th>
              <th className="px-5 py-3 font-normal">Category</th>
              <th className="px-5 py-3 font-normal">Warehouse</th>
              <th className="px-5 py-3 font-normal">Stock</th>
              <th className="px-5 py-3 font-normal">Price</th>
              {canManage && <th className="px-5 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-charcoal-800 last:border-0">
                <td className="px-5 py-3 text-cream">{p.name}</td>
                <td className="px-5 py-3 text-cream/60 font-mono">{p.sku || '—'}</td>
                <td className="px-5 py-3 text-cream/60">{categoryName(p.category_id)}</td>
                <td className="px-5 py-3 text-cream/60">{warehouseName(p.warehouse_id)}</td>
                <td className="px-5 py-3 text-cream/60 font-mono">{p.stock_quantity}</td>
                <td className="px-5 py-3 text-terracotta-400 font-mono">₹{p.price}</td>
                {canManage && (
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-cream/30 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <div className="text-center py-16 text-cream/40">No products yet</div>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Product">
        <form onSubmit={handleSubmit}>
          <FormField label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <FormField label="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          <FormField label="Price" type="number" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <FormField label="Stock Quantity" type="number" step="0.01" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} />
          <div className="mb-4">
            <label className="block text-sm text-cream/70 mb-1.5">Category</label>
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream focus:outline-none focus:border-terracotta-500">
              <option value="">None</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-cream/70 mb-1.5">Warehouse</label>
            <select value={form.warehouse_id} onChange={e => setForm({ ...form, warehouse_id: e.target.value })} className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream focus:outline-none focus:border-terracotta-500">
              <option value="">None</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors">
            Add Product
          </button>
        </form>
      </Modal>
    </div>
  );
}
