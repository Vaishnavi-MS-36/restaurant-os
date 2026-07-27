import { useEffect, useState, useRef } from 'react';
import client from '../api/client';
import { Upload, FileText, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Expenses() {
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const load = () => {
    client.get('/invoices/').then(res => setInvoices(res.data));
    client.get('/expenses/').then(res => setExpenses(res.data));
  };
  useEffect(load, []);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-cream mb-1">Expenses & Invoices</h1>
          <p className="text-cream/50">Upload supplier invoices for AI-powered extraction</p>
        </div>
        <button
          onClick={downloadRegister}
          className="flex items-center gap-2 bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-cream px-4 py-2.5 rounded-lg transition-colors"
        >
          <Download size={18} /> Export Register
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

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
    </div>
  );
}
