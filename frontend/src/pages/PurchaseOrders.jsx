import { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import { Plus, Minus, PackageCheck } from 'lucide-react';

export default function PurchaseOrders() {
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([]); // [{ingredient_id, name, unit, quantity, unit_price}]

  const load = () => {
    client.get('/purchase-orders/').then(res => setPos(res.data.reverse()));
    client.get('/suppliers/').then(res => setSuppliers(res.data));
    client.get('/ingredients/').then(res => setIngredients(res.data));
  };
  useEffect(load, []);

  const supplierName = (id) => suppliers.find(s => s.id === id)?.name || '—';

  const addItem = (ingredient) => {
    if (items.find(i => i.ingredient_id === ingredient.id)) return;
    setItems(prev => [...prev, { ingredient_id: ingredient.id, name: ingredient.name, unit: ingredient.unit, quantity: 1, unit_price: 0 }]);
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(i => i.ingredient_id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.ingredient_id !== id));

  const handleSubmit = async () => {
    setError('');
    if (!supplierId || items.length === 0) {
      setError('Select a supplier and at least one ingredient');
      return;
    }
    try {
      await client.post('/purchase-orders/', {
        supplier_id: parseInt(supplierId),
        items: items.map(i => ({
          ingredient_id: i.ingredient_id,
          quantity: parseFloat(i.quantity),
          unit_price: parseFloat(i.unit_price),
        })),
      });
      setShowModal(false);
      setItems([]);
      setSupplierId('');
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create purchase order');
    }
  };

  const receiveOrder = async (id) => {
    await client.put(`/purchase-orders/${id}/receive`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Purchase Orders</h1>
          <p className="text-cream/50">Order ingredients from suppliers</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} /> New Purchase Order
        </button>
      </div>

      <div className="space-y-3">
        {pos.map(po => (
          <div key={po.id} className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-display text-lg text-cream">PO #{po.id}</span>
                <span className="text-cream/50 text-sm ml-3">{supplierName(po.supplier_id)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${po.status === 'received' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {po.status}
                </span>
                {po.status === 'pending' && (
                  <button onClick={() => receiveOrder(po.id)} className="text-cream/50 hover:text-terracotta-400 transition-colors" title="Mark received">
                    <PackageCheck size={20} />
                  </button>
                )}
              </div>
            </div>
            <div className="text-sm text-cream/70 space-y-1">
              {po.items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>Ingredient #{item.ingredient_id} — {item.quantity} units</span>
                  <span className="font-mono">₹{(item.quantity * item.unit_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {pos.length === 0 && (
          <div className="text-center py-16 text-cream/40">No purchase orders yet</div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Purchase Order">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-cream/70 mb-1.5">Supplier</label>
          <select
            value={supplierId}
            onChange={e => setSupplierId(e.target.value)}
            className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream focus:outline-none focus:border-terracotta-500"
          >
            <option value="">Select supplier...</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-cream/70 mb-2">Add Ingredients</label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {ingredients.map(ing => (
              <button
                key={ing.id}
                onClick={() => addItem(ing)}
                className="bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 rounded-lg px-3 py-2 text-left text-sm text-cream transition-colors"
              >
                {ing.name} ({ing.unit})
              </button>
            ))}
          </div>
        </div>

        {items.length > 0 && (
          <div className="mb-4 space-y-3">
            {items.map(item => (
              <div key={item.ingredient_id} className="bg-charcoal-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cream text-sm">{item.name}</span>
                  <button onClick={() => removeItem(item.ingredient_id)} className="text-cream/40 hover:text-red-400">
                    <Minus size={14} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number" step="0.01" placeholder="Qty"
                    value={item.quantity}
                    onChange={e => updateItem(item.ingredient_id, 'quantity', e.target.value)}
                    className="w-1/2 bg-charcoal-900 border border-charcoal-700 rounded-lg px-2 py-1.5 text-cream text-sm focus:outline-none focus:border-terracotta-500"
                  />
                  <input
                    type="number" step="0.01" placeholder="Unit Price"
                    value={item.unit_price}
                    onChange={e => updateItem(item.ingredient_id, 'unit_price', e.target.value)}
                    className="w-1/2 bg-charcoal-900 border border-charcoal-700 rounded-lg px-2 py-1.5 text-cream text-sm focus:outline-none focus:border-terracotta-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors"
        >
          Create Purchase Order
        </button>
      </Modal>
    </div>
  );
}
