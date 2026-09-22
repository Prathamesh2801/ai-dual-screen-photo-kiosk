export default function Heading({ title, children }) {
  return (
    <div className="reveal-head text-center">
      <h1 className="text-[clamp(1.5rem,6.5vw,3rem)] leading-tight font-bold tracking-wide text-balance uppercase">
        {title}
      </h1>
      {children && (
        <p className="mx-auto mt-2 max-w-xl text-[clamp(0.95rem,3.8vw,1.25rem)] text-balance text-white/75 sm:mt-3">
          {children}
        </p>
      )}
    </div>
  )
}
