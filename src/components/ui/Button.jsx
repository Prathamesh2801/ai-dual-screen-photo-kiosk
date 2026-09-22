const VARIANTS = {
  primary:
    'bg-white text-ink shadow-soft hover:bg-white/90 active:bg-white/80 disabled:bg-white/50',
  ghost:
    'border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 active:bg-white/25 disabled:opacity-50',
}

const SIZES = {
  md: 'min-h-11 px-5 text-sm gap-2 sm:min-h-12 sm:px-6 sm:text-base',
  lg: 'min-h-12 px-5 text-base gap-2 sm:min-h-14 sm:px-9 sm:text-lg sm:gap-2.5',
  xl: 'min-h-13 px-6 text-lg gap-2 sm:min-h-16 sm:px-12 sm:text-2xl sm:gap-3',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center rounded-xl font-bold whitespace-nowrap
        uppercase tracking-wider transition-colors duration-150 select-none
        focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50
        disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
