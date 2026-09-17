export default function LayerTab({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5
        text-sm font-semibold transition-colors ${
          active
            ? 'border-clay bg-clay text-white'
            : 'border-line bg-paper text-ink-soft hover:bg-paper-200'
        }`}
    >
      {icon}
      {label}
    </button>
  )
}
