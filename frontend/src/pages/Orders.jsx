import { useEffect, useState, useRef } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import { Plus, Minus, Trash2, CheckCircle2, Radio } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [tableId, setTableId] = useState('');
  const [cart, setCart] = useState([]); // [{menu_item_id, name, price, quantity}]
  const [liveConnected, setLiveConnected] = useState(false);
  const wsRef = useRef(null);

  const load = () => {
    client.get('/orders/').then(res => setOrders(res.data.reverse()));
    client.get('/tables/').then(res => setTables(res.data));
    client.get('/menu/items').then(res => setMenuItems(res.data));
  };
  useEffect(load, []);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/orders');
    wsRef.current = ws;
    ws.onopen = () => setLiveConnected(true);
    ws.onclose = () => setLiveConnected(false);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'new_order') {
        load();
      }
    };
    return () => ws.close();
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.menu_item_id === item.id);
      if (existing) {
        return prev.map(c => c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev
      .map(c => c.menu_item_id === id ? { ...c, quantity: c.quantity + delta } : c)
      .filter(c => c.quantity > 0)
    );
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const openCreate = () => {
    setError('');
    setCart([]);
    setTableId('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!tableId || cart.length === 0) {
      setError('Select a table and at least one item');
      return;
    }
    try {
      await client.post('/orders/', {
        table_id: parseInt(tableId),
        items: cart.map(c => ({ menu_item_id: c.menu_item_id, quantity: c.quantity })),
      });
      setShowModal(false);
      setCart([]);
      setTableId('');
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create order');
    }
  };

  const completeOrder = async (id) => {
    await client.put(`/orders/${id}/complete`);
    load();
  };

  const tableNumber = (id) => tables.find(t => t.id === id)?.number ?? id;
  const orderTotal = (order) => order.items.reduce((sum, i) => sum + i.price_at_order * i.quantity, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1 flex items-center gap-3">
            Orders
            <span className={`flex items-center gap-1 text-xs font-normal px-2 py-1 rounded-full ${liveConnected ? 'bg-green-500/15 text-green-400' : 'bg-charcoal-800 text-cream/40'}`}>
              <Radio size={12} /> {liveConnected ? 'Live' : 'Offline'}
            </span>
          </h1>
          <p className="text-cream/50">Create and track orders — updates in real time</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} /> New Order
        </button>
      </div>

      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-display text-lg text-cream">Order #{order.id}</span>
                <span className="text-cream/50 text-sm ml-3">Table #{tableNumber(order.table_id)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {order.status}
                </span>
                {order.status === 'active' && (
                  <button onClick={() => completeOrder(order.id)} className="text-cream/50 hover:text-terracotta-400 transition-colors" title="Mark completed">
                    <CheckCircle2 size={20} />
                  </button>
                )}
              </div>
            </div>
            <div className="text-sm text-cream/70 space-y-1">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x menu item #{item.menu_item_id}</span>
                  <span className="font-mono">₹{(item.price_at_order * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-charcoal-700 mt-3 pt-3 flex justify-between font-mono text-terracotta-400">
              <span>Total</span>
              <span>₹{orderTotal(order).toFixed(2)}</span>
            </div>
          </div>
        ))}
        {orders.length === 0 && <div className="text-center py-16 text-cream/40">No orders yet</div>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Order">
        <form onSubmit={handleSubmit}>
          {error && <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}

          <div className="mb-4">
            <label className="block text-cream/60 text-sm mb-1.5">Table</label>
            <select
              value={tableId}
              onChange={e => setTableId(e.target.value)}
              className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream focus:outline-none focus:border-terracotta-500 transition-colors"
            >
              <option value="">Select a table…</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>Table #{t.number} ({t.status})</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-cream/60 text-sm mb-1.5">Menu items</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  className="flex items-center justify-between bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-left transition-colors"
                >
                  <span className="text-cream">{item.name}</span>
                  <span className="font-mono text-terracotta-400">₹{item.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="mb-4 bg-charcoal-800 rounded-lg p-3 space-y-2">
              {cart.map(c => (
                <div key={c.menu_item_id} className="flex items-center justify-between text-sm">
                  <span className="text-cream/80">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQty(c.menu_item_id, -1)} className="text-cream/40 hover:text-terracotta-400"><Minus size={14} /></button>
                    <span className="font-mono w-6 text-center">{c.quantity}</span>
                    <button type="button" onClick={() => updateQty(c.menu_item_id, 1)} className="text-cream/40 hover:text-terracotta-400"><Plus size={14} /></button>
                    <button type="button" onClick={() => updateQty(c.menu_item_id, -c.quantity)} className="text-cream/30 hover:text-red-400 ml-1"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              <div className="border-t border-charcoal-700 pt-2 flex justify-between font-mono text-terracotta-400">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors"
          >
            Place Order
          </button>
        </form>
      </Modal>
    </div>
  );
}