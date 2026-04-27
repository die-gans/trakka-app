export function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-text-secondary">
        {label}
      </label>
      {children}
    </div>
  )
}
