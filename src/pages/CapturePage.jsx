import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiCamera, FiRotateCcw, FiX, FiZap } from 'react-icons/fi'
import Button from '../components/ui/Button'
import ProcessingError from '../components/ProcessingError'
import ProcessingStatus from '../components/ProcessingStatus'
import Heading from '../components/ui/Heading'
import Spinner from '../components/ui/Spinner'
import { CAMERA_FACING, PHOTO_JPEG_QUALITY, PHOTO_MAX_EDGE, PROCESS_TYPICAL_S } from '../config'
import { processPhoto } from '../services/processApi'
import { ROUTES } from '../utils/constants'
import { shrinkPhoto } from '../utils/image'
import { loadSession, saveSession, templateById } from '../utils/session'

export default function CapturePage() {
  const navigate = useNavigate()
  const [session] = useState(loadSession)
  const [photo, setPhoto] = useState(session.photo ?? null)
  const [reading, setReading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const requestRef = useRef(null)
  const template = templateById(session.templateId)

  // Leaving mid-generation (Home, back) must not navigate the next guest.
  useEffect(() => () => requestRef.current?.abort(), [])

  if (!template) return <Navigate to={ROUTES.template} replace />

  const openCamera = () => {
    setError(null)
    inputRef.current?.click()
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    // Cleared so picking the same shot again still fires a change.
    e.target.value = ''
    if (!file) return
    setReading(true)
    try {
      const dataUrl = await shrinkPhoto(file, PHOTO_MAX_EDGE, PHOTO_JPEG_QUALITY)
      saveSession({ photo: dataUrl, cutout: null, placement: null })
      setPhoto(dataUrl)
    } catch {
      toast.error('That photo could not be read. Please take another.')
    } finally {
      setReading(false)
    }
  }

  const onUse = async () => {
    const request = new AbortController()
    requestRef.current = request
    setError(null)
    setProcessing(true)
    try {
      const { id, cutout } = await processPhoto({ photo, signal: request.signal })
      if (request.signal.aborted) return
      saveSession({ cutout, processId: id, placement: null })
      navigate(ROUTES.editor)
    } catch (err) {
      if (request.signal.aborted || err.kind === 'canceled') return
      setProcessing(false)
      setError(err)
    }
  }

  const cancel = () => {
    requestRef.current?.abort()
    setProcessing(false)
  }

  const ratio = template.width / template.height
  const win = template.window

  return (
    <div className="flex flex-col items-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={CAMERA_FACING}
        onChange={onFile}
        className="hidden"
      />

      <Heading
        title={processing ? 'Creating your portrait' : error ? 'Let’s try that again' : photo ? 'Looking good?' : 'Strike a pose'}
      >
        {processing
          ? `This usually takes ${PROCESS_TYPICAL_S[0]}–${PROCESS_TYPICAL_S[1]} seconds.`
          : error
            ? 'Your photo is safe — nothing was lost.'
            : photo
              ? 'Use this photo, or take another.'
              : 'Tap below to open the camera and take your photo.'}
      </Heading>

      {photo ? (
        <div className="mt-6 flex w-full flex-col items-center gap-6 sm:mt-8">
          <div className="reveal-cover relative overflow-hidden rounded-xl shadow-lift ring-1 ring-white/30 sm:rounded-2xl">
            <img src={photo} alt="Your photo" className="block max-h-[calc(100dvh-var(--chrome))] w-auto max-w-full" />
            {processing && (
              <div className="absolute inset-0 overflow-hidden bg-navy-deep/40">
                <div className="scan absolute inset-x-0 h-full bg-linear-to-b from-transparent via-aqua/45 to-transparent" />
              </div>
            )}
          </div>

          {processing ? (
            <div className="reveal-actions flex w-full flex-col items-center gap-5">
              <ProcessingStatus expectedMs={PROCESS_TYPICAL_S[1] * 1000} />
              <Button variant="ghost" onClick={cancel}>
                <FiX /> Cancel
              </Button>
            </div>
          ) : error ? (
            <ProcessingError error={error} onRetry={onUse} onRetake={openCamera} />
          ) : (
            <div className="reveal-actions flex w-full justify-center gap-3 sm:w-auto sm:gap-4">
              <Button variant="ghost" size="xl" className="flex-1 sm:flex-none" onClick={openCamera} disabled={reading}>
                <FiRotateCcw /> Retake
              </Button>
              <Button size="xl" className="flex-1 sm:flex-none" onClick={onUse} disabled={reading}>
                <FiZap /> Use photo
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 flex w-full flex-col items-center gap-6 sm:mt-8">
          <button
            type="button"
            onClick={openCamera}
            disabled={reading}
            aria-label="Open camera"
            className="reveal-cover relative overflow-hidden rounded-xl shadow-lift ring-1 ring-white/30 active:scale-[0.99] sm:rounded-2xl"
            style={{ aspectRatio: ratio, width: `min(100%, calc((100dvh - var(--chrome)) * ${ratio}))` }}
          >
            <img src={template.src} alt="" draggable={false} className="h-full w-full" />
            <span
              className="absolute flex items-center justify-center border-2 border-dashed border-white/70 bg-navy-deep/40 backdrop-blur-[2px]"
              style={{
                left: `${(win.x / template.width) * 100}%`,
                top: `${(win.y / template.height) * 100}%`,
                width: `${(win.w / template.width) * 100}%`,
                height: `${(win.h / template.height) * 100}%`,
              }}
            >
              {reading ? (
                <Spinner size={32} />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand shadow-soft sm:h-20 sm:w-20">
                  <FiCamera className="h-6 w-6 sm:h-10 sm:w-10" />
                </span>
              )}
            </span>
          </button>

          <div className="reveal-actions flex w-full justify-center gap-3 sm:w-auto sm:gap-4">
            <Button variant="ghost" size="xl" onClick={() => navigate(ROUTES.template)} aria-label="Change frame">
              <FiArrowLeft />
            </Button>
            <Button size="xl" className="flex-1 sm:min-w-60 sm:flex-none" onClick={openCamera} disabled={reading}>
              <FiCamera /> Open camera
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
