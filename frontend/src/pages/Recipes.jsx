import { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Recipes() {
  const { user } = useAuth();
  const canManage = ['owner', 'manager'].includes(user?.role);
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ menu_item_id: '', ingredient_id: '', quantity_required: '' });

  const load = () => {
    client.get('/recipes/').then(res => setRecipes(res.data));
    client.get('/menu/items').then(res => setMenuItems(res.data));
    client.get('/ingredients/').then(res => setIngredients(res.data));
  };
  useEffect(load, []);

  const menuItemName = (id) => menuItems.find(m => m.id === id)?.name || '—';
  const ingredientInfo = (id) => ingredients.find(i => i.id === id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await client.post('/recipes/', {
      menu_item_id: parseInt(form.menu_item_id),
      ingredient_id: parseInt(form.ingredient_id),
      quantity_required: parseFloat(form.quantity_required),
    });
    setShowModal(false);
    setForm({ menu_item_id: '', ingredient_id: '', quantity_required: '' });
    load();
  };

  const handleDelete = async (id) => {
    await client.delete(`/recipes/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Recipes</h1>
          <p className="text-cream/50">Link menu items to the ingredients they consume</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={18} /> Add Recipe Entry
          </button>
        )}
      </div>

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-700 text-cream/50 text-left">
              <th className="px-5 py-3 font-normal">Menu Item</th>
              <th className="px-5 py-3 font-normal">Ingredient</th>
              <th className="px-5 py-3 font-normal">Quantity Required</th>
              {canManage && <th className="px-5 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {recipes.map(r => {
              const ing = ingredientInfo(r.ingredient_id);
              return (
                <tr key={r.id} className="border-b border-charcoal-800 last:border-0">
                  <td className="px-5 py-3 text-cream">{menuItemName(r.menu_item_id)}</td>
                  <td className="px-5 py-3 text-cream/80">{ing?.name || '—'}</td>
                  <td className="px-5 py-3 text-cream/60 font-mono">{r.quantity_required} {ing?.unit}</td>
                  {canManage && (
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete(r.id)} className="text-cream/30 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {recipes.length === 0 && (
          <div className="text-center py-16 text-cream/40">No recipe entries yet</div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Recipe Entry">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-cream/70 mb-1.5">Menu Item</label>
            <select
              required
              value={form.menu_item_id}
              onChange={e => setForm({ ...form, menu_item_id: e.target.value })}
              className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream focus:outline-none focus:border-terracotta-500"
            >
              <option value="">Select...</option>
              {menuItems.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-cream/70 mb-1.5">Ingredient</label>
            <select
              required
              value={form.ingredient_id}
              onChange={e => setForm({ ...form, ingredient_id: e.target.value })}
              className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream focus:outline-none focus:border-terracotta-500"
            >
              <option value="">Select...</option>
              {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-cream/70 mb-1.5">Quantity Required (per 1 order)</label>
            <input
              type="number" step="0.01" required
              value={form.quantity_required}
              onChange={e => setForm({ ...form, quantity_required: e.target.value })}
              className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream focus:outline-none focus:border-terracotta-500"
            />
          </div>
          <button type="submit" className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors">
            Add Recipe Entry
          </button>
        </form>
      </Modal>
    </div>
  );
}
