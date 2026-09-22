import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowRight, FiCheck, FiMonitor, FiRefreshCw, FiSmartphone } from 'react-icons/fi'
import Button from '../components/ui/Button'
import Heading from '../components/ui/Heading'
import { SENT_RESET_MS } from '../config'
import { ROUTES } from '../utils/constants'
import { clearSession } from '../utils/session'

export default function SentPage() {
  const navigate = useNavigate()

  useEffect(() => {
    clearSession()
    const timer = setTimeout(() => navigate(ROUTES.form, { replace: true }), SENT_RESET_MS)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex flex-col items-center text-center">
      <span className="reveal-tick flex h-20 w-20 items-center justify-center rounded-full bg-white text-brand shadow-lift sm:h-32 sm:w-32">
        <FiCheck className="h-10 w-10 sm:h-16 sm:w-16" strokeWidth={3} />
      </span>
      <div className="mt-8 sm:mt-10">
        <Heading title="You're on the big screen!">
          Look up at the display and scan the QR code to download your photo.
        </Heading>
      </div>
      <p className="reveal-actions mt-6 flex items-center gap-2 text-white/70 sm:mt-8 sm:text-lg">
        <FiMonitor /> <FiArrowRight className="opacity-60" /> <FiSmartphone />
        <span className="ml-1">Scan · Download · Share</span>
      </p>
      <Button size="xl" className="reveal-actions mt-8 w-full sm:mt-12 sm:w-auto sm:min-w-60" onClick={() => navigate(ROUTES.form, { replace: true })}>
        <FiRefreshCw /> Start over
      </Button>
    </div>
  )
}
