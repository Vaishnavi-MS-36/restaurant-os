import { useEffect, useState } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { Plus, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = ['owner', 'manager', 'chef', 'waiter', 'cashier', 'store_manager'];

export default function Staff() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'waiter', phone: '' });

  const load = () => { client.get('/staff/').then(res => setStaff(res.data)); };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await client.post('/staff/', form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'waiter', phone: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add staff member');
    }
  };

  const deactivate = async (id) => {
    await client.delete(`/staff/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Staff</h1>
          <p className="text-cream/50">Manage team members and roles</p>
        </div>
        {isOwner && (
          <button
            onClick={() => { setShowModal(true); setError(''); }}
            className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={18} /> Add Staff
          </button>
        )}
      </div>

      <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-700 text-cream/50 text-left">
              <th className="px-5 py-3 font-normal">Name</th>
              <th className="px-5 py-3 font-normal">Email</th>
              <th className="px-5 py-3 font-normal">Role</th>
              <th className="px-5 py-3 font-normal">Phone</th>
              <th className="px-5 py-3 font-normal">Status</th>
              {isOwner && <th className="px-5 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} className="border-b border-charcoal-800 last:border-0">
                <td className="px-5 py-3 text-cream">{s.name}</td>
                <td className="px-5 py-3 text-cream/60">{s.email}</td>
                <td className="px-5 py-3 text-cream/60 capitalize">{s.role.replace('_', ' ')}</td>
                <td className="px-5 py-3 text-cream/60">{s.phone || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${s.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {s.is_active ? 'active' : 'deactivated'}
                  </span>
                </td>
                {isOwner && (
                  <td className="px-5 py-3 text-right">
                    {s.is_active && (
                      <button onClick={() => deactivate(s.id)} className="text-cream/30 hover:text-red-400 transition-colors" title="Deactivate">
                        <UserX size={16} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && <div className="text-center py-16 text-cream/40">No staff members yet</div>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Staff Member">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <FormField label="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <FormField label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <FormField label="Password" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <div className="mb-4">
            <label className="block text-sm text-cream/70 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream focus:outline-none focus:border-terracotta-500"
            >
              {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <FormField label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <button type="submit" className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors">
            Add Staff Member
          </button>
        </form>
      </Modal>
    </div>
  );
}
