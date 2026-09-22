import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi'
import Button from '../components/ui/Button'
import Heading from '../components/ui/Heading'
import { TEMPLATES } from '../config'
import { ROUTES } from '../utils/constants'
import { loadSession, saveSession } from '../utils/session'

export default function TemplatePage() {
  const navigate = useNavigate()
  const [session] = useState(loadSession)
  const [selected, setSelected] = useState(session.templateId ?? null)

  if (!session.form?.name) return <Navigate to={ROUTES.form} replace />

  const onNext = () => {
    // A different frame has a different photo shape — the old shot won't fit.
    if (selected !== session.templateId) {
      saveSession({ templateId: selected, photo: null, cutout: null, placement: null })
    }
    navigate(ROUTES.capture)
  }

  return (
    <div className="flex flex-col items-center">
      <Heading title="Choose your frame">Tap the look you like best.</Heading>

      <div
        className="reveal-cover mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5"
        style={{ width: 'min(100%, max(15rem, calc((100dvh - var(--chrome)) / 1.45)))' }}
      >
        {TEMPLATES.map((t) => {
          const active = selected === t.id
          const landscape = t.width > t.height
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              aria-pressed={active}
              aria-label={t.name}
              className={`relative overflow-hidden rounded-xl shadow-lift transition duration-200 sm:rounded-2xl
                ${landscape ? 'col-span-2' : ''}
                ${active ? 'ring-4 ring-white' : 'opacity-75 ring-1 ring-white/25 active:scale-[0.98]'}`}
              style={{ aspectRatio: t.width / t.height }}
            >
              <img src={t.src} alt="" className="h-full w-full object-cover" draggable={false} />
              {active && (
                <span className="reveal-tick absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand shadow-soft sm:top-3 sm:left-3 sm:h-10 sm:w-10">
                  <FiCheck className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="reveal-actions mt-6 flex w-full justify-center gap-3 sm:mt-8 sm:w-auto sm:gap-4">
        <Button variant="ghost" size="xl" onClick={() => navigate(ROUTES.form)} aria-label="Back">
          <FiArrowLeft />
        </Button>
        <Button size="xl" className="flex-1 sm:min-w-60 sm:flex-none" disabled={selected === null} onClick={onNext}>
          Next <FiArrowRight />
        </Button>
      </div>
    </div>
  )
}
