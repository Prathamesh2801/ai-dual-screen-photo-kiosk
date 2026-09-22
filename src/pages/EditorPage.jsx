import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiMaximize2, FiMove, FiRotateCcw, FiCamera, FiSend } from 'react-icons/fi'
import Button from '../components/ui/Button'
import Heading from '../components/ui/Heading'
import Spinner from '../components/ui/Spinner'
import { EDITOR_MAX_SCALE, EDITOR_MIN_SCALE, FINAL_JPEG_QUALITY } from '../config'
import { submitFinal } from '../services/api'
import { ROUTES } from '../utils/constants'
import { composeFinal, coverPlacement, loadImage } from '../utils/image'
import { loadSession, saveSession, templateById } from '../utils/session'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// Keeps at least a fifth of the cutout inside the window so it can't be lost.
function bounded(p, win, aspect) {
  const w = clamp(p.w, win.w * EDITOR_MIN_SCALE, win.w * EDITOR_MAX_SCALE)
  const h = w / aspect
  return {
    w,
    x: clamp(p.x, win.x - w + win.w * 0.2, win.x + win.w * 0.8),
    y: clamp(p.y, win.y - h + win.h * 0.2, win.y + win.h * 0.8),
  }
}

export default function EditorPage() {
  const navigate = useNavigate()
  const [session] = useState(loadSession)
  const template = templateById(session.templateId)
  const win = template?.window
  const [aspect, setAspect] = useState(null)
  const [placement, setPlacement] = useState(session.placement ?? null)
  const [sending, setSending] = useState(false)

  const stageRef = useRef(null)
  const pointers = useRef(new Map())
  const gesture = useRef(null)

  useEffect(() => {
    if (!session.cutout) return
    loadImage(session.cutout)
      .then((img) => {
        const a = img.naturalWidth / img.naturalHeight
        setAspect(a)
        setPlacement((p) => p ?? coverPlacement(win, a))
      })
      .catch(() => toast.error('Your portrait could not be loaded. Please retake the photo.'))
  }, [session.cutout, win])

  if (!template) return <Navigate to={ROUTES.template} replace />
  if (!session.cutout) return <Navigate to={ROUTES.capture} replace />

  const snapshot = () => {
    const rect = stageRef.current.getBoundingClientRect()
    const pts = [...pointers.current.values()]
    const k = rect.width / template.width
    const mid = pts.length > 1
      ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
      : pts[0]
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1 : 0
    gesture.current = { rect, k, mid, dist, start: placement }
  }

  const onPointerDown = (e) => {
    if (!aspect || sending) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    snapshot()
  }

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const { rect, k, mid, dist, start } = gesture.current
    const pts = [...pointers.current.values()]

    if (pts.length === 1) {
      setPlacement(bounded({
        w: start.w,
        x: start.x + (pts[0].x - mid.x) / k,
        y: start.y + (pts[0].y - mid.y) / k,
      }, win, aspect))
      return
    }

    const now = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
    const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
    const w = clamp(start.w * (d / dist), win.w * EDITOR_MIN_SCALE, win.w * EDITOR_MAX_SCALE)
    const s = w / start.w
    const ax = (mid.x - rect.left) / k
    const ay = (mid.y - rect.top) / k
    setPlacement(bounded({
      w,
      x: ax - (ax - start.x) * s + (now.x - mid.x) / k,
      y: ay - (ay - start.y) * s + (now.y - mid.y) / k,
    }, win, aspect))
  }

  const onPointerUp = (e) => {
    if (!pointers.current.delete(e.pointerId)) return
    if (pointers.current.size) snapshot()
    else saveSession({ placement })
  }

  const reset = () => {
    const p = coverPlacement(win, aspect)
    setPlacement(p)
    saveSession({ placement: p })
  }

  const retake = () => {
    saveSession({ photo: null, cutout: null, placement: null })
    navigate(ROUTES.capture)
  }

  const send = async () => {
    setSending(true)
    try {
      const image = await composeFinal(template, session.cutout, placement, FINAL_JPEG_QUALITY)
      await submitFinal({ form: session.form, templateId: template.id, image })
      navigate(ROUTES.sent)
    } catch (err) {
      setSending(false)
      toast.error(err?.message || 'Could not send your photo. Please try again.')
    }
  }

  const ratio = template.width / template.height
  const pct = (v, of) => `${(v / of) * 100}%`

  return (
    <div className="flex flex-col items-center">
      <Heading title="Perfect your shot">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5"><FiMove /> Drag to move</span>
          <span className="inline-flex items-center gap-1.5"><FiMaximize2 /> Pinch to resize</span>
        </span>
      </Heading>

      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="reveal-cover relative mt-6 touch-none overflow-hidden rounded-xl shadow-lift ring-1 ring-white/30 select-none sm:mt-8 sm:rounded-2xl"
        style={{ aspectRatio: ratio, width: `min(100%, calc((100dvh - var(--chrome)) * ${ratio}))` }}
      >
        <img src={template.src} alt="" draggable={false} className="pointer-events-none h-full w-full" />

        <div
          className="pointer-events-none absolute overflow-hidden"
          style={{
            left: pct(win.x, template.width),
            top: pct(win.y, template.height),
            width: pct(win.w, template.width),
            height: pct(win.h, template.height),
          }}
        >
          {placement && aspect ? (
            <img
              src={session.cutout}
              alt="Your portrait"
              draggable={false}
              className="absolute max-w-none"
              style={{
                left: pct(placement.x - win.x, win.w),
                top: pct(placement.y - win.y, win.h),
                width: pct(placement.w, win.w),
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Spinner size={32} />
            </div>
          )}
        </div>

        {sending && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-navy-deep/70 backdrop-blur-sm">
            <Spinner size={40} />
            <p className="px-4 text-center text-lg font-medium sm:text-xl">Sending to the big screen…</p>
          </div>
        )}
      </div>

      <div className="reveal-actions mt-6 flex w-full justify-center gap-3 sm:mt-8 sm:w-auto sm:gap-4">
        <Button variant="ghost" size="xl" onClick={retake} disabled={sending} aria-label="Retake">
          <FiCamera /> <span className="hidden sm:inline">Retake</span>
        </Button>
        <Button variant="ghost" size="xl" onClick={reset} disabled={!aspect || sending} aria-label="Reset">
          <FiRotateCcw /> <span className="hidden sm:inline">Reset</span>
        </Button>
        <Button size="xl" className="flex-1 sm:flex-none" onClick={send} disabled={!placement || !aspect || sending}>
          <FiSend /> Submit
        </Button>
      </div>
    </div>
  )
}
