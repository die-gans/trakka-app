export function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-border-default bg-bg-base px-3 py-2 text-[12px] text-text-primary outline-none focus:border-info"
    />
  )
}
