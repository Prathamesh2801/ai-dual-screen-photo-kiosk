import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { FOOTER_TEXT } from '../../config'


export default function AppLayout() {
  return (
    <div className="flex min-h-full flex-col">
      <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
          duration: 3200,
          style: {
            background: 'var(--color-ink)',
            color: 'var(--color-paper)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            padding: '10px 14px',
            maxWidth: '420px',
            boxShadow: 'var(--shadow-lift)',
          },
          loading: {
            iconTheme: {
              primary: 'var(--color-clay)',
              secondary: 'var(--color-paper-200)',
            },
          },
          success: {
            iconTheme: {
              primary: 'var(--color-sage)',
              secondary: 'var(--color-paper)',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: 'var(--color-danger)',
              secondary: 'var(--color-paper)',
            },
          },
        }}
      />


      <main
        className="mx-auto flex w-full max-w-5xl min-h-0 flex-1 flex-col
          justify-center px-5 py-6 sm:py-8"
      >
        <Outlet />
      </main>

      {FOOTER_TEXT && (
        <footer className="shrink-0 border-t border-line py-3 text-center text-xs text-ink-muted">
          {FOOTER_TEXT}
        </footer>
      )}
    </div>
  )
}
