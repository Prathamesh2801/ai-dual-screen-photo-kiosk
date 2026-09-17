import { createHashRouter } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import FormPage from './pages/FormPage'
import TemplatePage from './pages/TemplatePage'
import CapturePage from './pages/CapturePage'
import SentPage from './pages/SentPage'
import TvPage from './pages/TvPage'
import { ROUTES } from './utils/constants'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <FormPage /> },
      { path: ROUTES.template.slice(1), element: <TemplatePage /> },
      { path: ROUTES.capture.slice(1), element: <CapturePage /> },
      { path: ROUTES.sent.slice(1), element: <SentPage /> },
    ],
  },
  // The TV runs on its own screen, without the tablet's chrome.
  { path: ROUTES.tv, element: <TvPage /> },
])
