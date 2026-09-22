import { useEffect, useState } from 'react'

// Start times as a fraction of the expected duration, so the story still fits
// if the typical time in config changes.
const STAGES = [
  [0, 'Uploading your photo…'],
  [0.12, 'Our AI is painting your portrait…'],
  [0.45, 'Removing the background…'],
  [0.75, 'Adding the finishing touches…'],
  [1, 'Almost there — thanks for your patience…'],
  [1.6, 'Still working — the AI is extra busy right now…'],
]

// The server reports no progress, so the bar eases toward 95% over the
// expected duration and never claims to be done before the response is.
export default function ProcessingStatus({ expectedMs }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => setElapsed(Date.now() - start), 200)
    return () => clearInterval(timer)
  }, [])

  const t = elapsed / expectedMs
  const progress = 0.95 * (1 - Math.exp(-2.2 * t))
  const message = STAGES.findLast(([at]) => t >= at)[1]

  return (
    <div className="w-full max-w-md" role="status" aria-live="polite">
      <div className="flex items-baseline justify-between gap-4 text-sm sm:text-base">
        <p key={message} className="fade-in font-medium text-white/90">{message}</p>
        <span className="shrink-0 text-white/55 tabular-nums">{Math.floor(elapsed / 1000)}s</span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-linear-to-r from-azure to-aqua transition-[width] duration-200 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}
