import { FiAlertTriangle, FiClock, FiImage, FiRefreshCw, FiRotateCcw, FiWifiOff } from 'react-icons/fi'
import Button from './ui/Button'

const KINDS = {
  network: { Icon: FiWifiOff, title: 'No connection', hint: 'Once the Wi-Fi is back, tap Try again.' },
  timeout: { Icon: FiClock, title: 'Taking too long', hint: 'The AI is busier than usual. Try again in a moment.' },
  image: { Icon: FiImage, title: 'Couldn’t load your portrait', hint: 'Tap Try again to create it once more.' },
  server: { Icon: FiAlertTriangle, title: 'Something went wrong', hint: 'Try again, or retake the photo if it keeps happening.' },
}

export default function ProcessingError({ error, onRetry, onRetake }) {
  const { Icon, title, hint } = KINDS[error.kind] ?? KINDS.server

  return (
    <div role="alert" className="reveal-actions flex w-full max-w-md flex-col items-center gap-5">
      <div className="flex w-full items-start gap-4 rounded-2xl border border-danger/40 bg-danger/10 p-4 backdrop-blur-sm sm:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger/20 text-white">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold">{title}</p>
          <p className="mt-0.5 text-white/85">{error.message}</p>
          <p className="mt-1 text-sm text-white/60">{hint}</p>
        </div>
      </div>
      <div className="flex w-full justify-center gap-3 sm:gap-4">
        <Button variant="ghost" size="xl" className="flex-1" onClick={onRetake}>
          <FiRotateCcw /> Retake
        </Button>
        <Button size="xl" className="flex-1" onClick={onRetry}>
          <FiRefreshCw /> Try again
        </Button>
      </div>
    </div>
  )
}
