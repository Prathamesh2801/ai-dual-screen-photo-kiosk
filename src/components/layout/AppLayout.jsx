import { Link, Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { FiCamera, FiCheck, FiHome, FiImage, FiMove, FiUser } from 'react-icons/fi'
import logo from '../../assets/logo.svg'
import { ROUTES } from '../../utils/constants'

const STEPS = [
  { path: ROUTES.form, label: 'Details', Icon: FiUser },
  { path: ROUTES.template, label: 'Frame', Icon: FiImage },
  { path: ROUTES.capture, label: 'Photo', Icon: FiCamera },
  { path: ROUTES.editor, label: 'Adjust', Icon: FiMove },
]

function Steps({ current }) {
  return (
    <ol className="flex items-start justify-center">
      {STEPS.map(({ path, label, Icon }, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={path} className="flex items-start">
            {i > 0 && (
              <span className={`mt-[1.1rem] h-0.5 w-6 sm:mt-6 sm:w-14 ${done || active ? 'bg-white/70' : 'bg-white/20'}`} />
            )}
            <div className="flex w-14 flex-col items-center gap-1.5 sm:w-20">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full transition sm:h-12 sm:w-12
                  ${active ? 'bg-white text-brand shadow-soft' : done ? 'bg-white/25 text-white' : 'text-white/45 ring-1 ring-white/25'}`}
              >
                {done ? <FiCheck className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} /> : <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </span>
              <span className={`text-[0.7rem] font-medium tracking-wide uppercase sm:text-xs ${active ? 'text-white' : 'text-white/55'}`}>
                {label}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const step = STEPS.findIndex((s) => s.path === pathname)

  return (
    <div className="flex min-h-dvh flex-col px-[max(1rem,env(safe-area-inset-left))] pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-10 sm:pt-6 sm:pb-8">
      <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
          duration: 3200,
          style: {
            background: 'var(--color-navy-deep)',
            color: '#fff',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: 500,
            padding: '12px 16px',
            maxWidth: '460px',
            boxShadow: 'var(--shadow-lift)',
            border: '1px solid rgb(255 255 255 / 0.15)',
          },
          success: {
            iconTheme: { primary: 'var(--color-aqua)', secondary: 'var(--color-navy-deep)' },
          },
          error: {
            duration: 5000,
            iconTheme: { primary: 'var(--color-danger)', secondary: '#fff' },
          },
        }}
      />

      <header className="flex shrink-0 items-center justify-between">
        <Link
          to={ROUTES.form}
          aria-label="Home"
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/10 backdrop-blur-sm transition hover:bg-white/20 active:scale-95 sm:h-12 sm:w-12
            ${pathname === ROUTES.form ? 'invisible' : ''}`}
        >
          <FiHome className="h-5 w-5 sm:h-6 sm:w-6" />
        </Link>
        <img src={logo} alt="Capgemini" className="h-7 w-auto sm:h-12" />
      </header>

      {step >= 0 && (
        <nav aria-label="Progress" className="mt-6 shrink-0 sm:mt-10">
          <Steps current={step} />
        </nav>
      )}

      <main className="mx-auto flex w-full max-w-4xl min-h-0 flex-1 flex-col justify-center py-5 [--chrome:23rem] sm:py-8 sm:[--chrome:32.5rem]">
        <Outlet />
      </main>
    </div>
  )
}
