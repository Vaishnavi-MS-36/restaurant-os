import { useEffect, useState, useRef } from 'react';
import client from '../api/client';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { Upload, FileText, Download, Loader2, CheckCircle2, AlertCircle, Plus, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Expenses() {
  const { user } = useAuth();
  const canManage = ['owner', 'manager'].includes(user?.role);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category_id: '', supplier_name: '', description: '', amount: '', expense_date: '' });
  const [categoryName, setCategoryName] = useState('');
  const fileInputRef = useRef(null);

  const load = () => {
    client.get('/invoices/').then(res => setInvoices(res.data));
    client.get('/expenses/').then(res => setExpenses(res.data));
    client.get('/expenses/categories').then(res => setCategories(res.data));
  };
  useEffect(load, []);

  const categoryLabel = (id) => categories.find(c => c.id === id)?.name || 'Uncategorized';

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await client.post('/invoices/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process invoice');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const downloadRegister = async () => {
    const res = await client.get('/invoices/export/expense-register', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'expense_register.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    await client.post('/expenses/', {
      ...expenseForm,
      category_id: expenseForm.category_id ? parseInt(expenseForm.category_id) : null,
      amount: parseFloat(expenseForm.amount),
    });
    setShowExpenseModal(false);
    setExpenseForm({ category_id: '', supplier_name: '', description: '', amount: '', expense_date: '' });
    load();
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    await client.post('/expenses/categories', { name: categoryName });
    setShowCategoryModal(false);
    setCategoryName('');
    load();
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Expenses & Invoices</h1>
          <p className="text-cream/50">Track manual expenses and AI-extracted invoices</p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-cream px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={18} /> Category
            </button>
          )}
          {canManage && (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={18} /> Add Expense
            </button>
          )}
          <button
            onClick={downloadRegister}
            className="flex items-center gap-2 bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-cream px-4 py-2.5 rounded-lg transition-colors"
          >
            <Download size={18} /> Export Register
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <h2 className="font-display text-xl text-cream mb-3 flex items-center gap-2">
        <Receipt size={20} className="text-terracotta-400" /> Manual Expense Records
      </h2>
      <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-700 text-cream/50 text-left">
              <th className="px-5 py-3 font-normal">Description</th>
              <th className="px-5 py-3 font-normal">Category</th>
              <th className="px-5 py-3 font-normal">Supplier</th>
              <th className="px-5 py-3 font-normal">Date</th>
              <th className="px-5 py-3 font-normal text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id} className="border-b border-charcoal-800 last:border-0">
                <td className="px-5 py-3 text-cream">{e.description || '—'}</td>
                <td className="px-5 py-3 text-cream/60">{categoryLabel(e.category_id)}</td>
                <td className="px-5 py-3 text-cream/60">{e.supplier_name || '—'}</td>
                <td className="px-5 py-3 text-cream/60">{e.expense_date || '—'}</td>
                <td className="px-5 py-3 text-terracotta-400 font-mono text-right">₹{e.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          {expenses.length > 0 && (
            <tfoot>
              <tr className="border-t border-charcoal-700">
                <td colSpan="4" className="px-5 py-3 text-cream/50 text-right">Total</td>
                <td className="px-5 py-3 text-terracotta-400 font-mono text-right font-semibold">₹{totalExpenses.toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
        {expenses.length === 0 && (
          <div className="text-center py-10 text-cream/40">No manual expense records yet</div>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-charcoal-700 hover:border-terracotta-500/50 rounded-2xl p-10 text-center cursor-pointer transition-colors mb-8"
      >
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-cream/60">
            <Loader2 size={32} className="animate-spin text-terracotta-400" />
            <span>Extracting invoice data with AI...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-cream/60">
            <Upload size={32} className="text-terracotta-400" />
            <span>Click to upload a supplier invoice</span>
            <span className="text-xs text-cream/40">Supports printed and handwritten invoices — JPG, PNG, PDF</span>
          </div>
        )}
      </div>

      <h2 className="font-display text-xl text-cream mb-3">Processed Invoices</h2>
      <div className="space-y-3 mb-8">
        {invoices.map(inv => {
          const data = inv.extracted_data;
          return (
            <div key={inv.id} className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-terracotta-400" />
                  <span className="text-cream font-medium">{inv.file_name}</span>
                </div>
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  inv.status === 'extracted' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                }`}>
                  {inv.status === 'extracted' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {inv.status}
                </span>
              </div>

              {data && (
                <div className="text-sm text-cream/70 space-y-2">
                  <div className="flex gap-4 flex-wrap">
                    {data.supplier_name && <span><span className="text-cream/40">Supplier:</span> {data.supplier_name}</span>}
                    {data.invoice_number && <span><span className="text-cream/40">Invoice #:</span> {data.invoice_number}</span>}
                    {data.invoice_date && <span><span className="text-cream/40">Date:</span> {data.invoice_date}</span>}
                  </div>

                  {data.line_items?.length > 0 && (
                    <div className="bg-charcoal-800 rounded-lg p-3 mt-2">
                      {data.line_items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs py-1">
                          <span className="text-cream/70">{item.description} × {item.quantity}</span>
                          <span className="font-mono text-cream/80">₹{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between font-mono text-terracotta-400 pt-2">
                    <span>Total</span>
                    <span>₹{data.total_amount ?? '—'}</span>
                  </div>

                  {data.confidence_note && (
                    <div className="text-amber-400/80 text-xs italic flex items-start gap-1 mt-2">
                      <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                      {data.confidence_note}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {invoices.length === 0 && (
          <div className="text-center py-10 text-cream/40">No invoices uploaded yet</div>
        )}
      </div>

      <Modal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Add Expense">
        <form onSubmit={handleAddExpense}>
          <div className="mb-4">
            <label className="block text-sm text-cream/70 mb-1.5">Category</label>
            <select
              value={expenseForm.category_id}
              onChange={e => setExpenseForm({ ...expenseForm, category_id: e.target.value })}
              className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream focus:outline-none focus:border-terracotta-500"
            >
              <option value="">None</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <FormField label="Description" required value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
          <FormField label="Supplier Name" value={expenseForm.supplier_name} onChange={e => setExpenseForm({ ...expenseForm, supplier_name: e.target.value })} />
          <FormField label="Amount" type="number" step="0.01" required value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
          <FormField label="Date" type="date" value={expenseForm.expense_date} onChange={e => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} />
          <button type="submit" className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors">
            Add Expense
          </button>
        </form>
      </Modal>

      <Modal open={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Add Expense Category">
        <form onSubmit={handleAddCategory}>
          <FormField label="Category Name" required value={categoryName} onChange={e => setCategoryName(e.target.value)} />
          <button type="submit" className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-charcoal-950 font-medium rounded-lg py-2.5 transition-colors">
            Add Category
          </button>
        </form>
      </Modal>
    </div>
  );
}
