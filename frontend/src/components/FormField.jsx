export default function FormField({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm text-cream/70 mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-3 py-2.5 text-cream placeholder-cream/30 focus:outline-none focus:border-terracotta-500 transition-colors"
      />
    </div>
  );
}
