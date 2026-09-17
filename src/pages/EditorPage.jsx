import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiArrowLeft,
  FiImage,
  FiType,
  FiDownload,
  FiRotateCcw,
  FiUploadCloud,
} from 'react-icons/fi'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import MagazineCanvas from '../components/MagazineCanvas'
import CoverFinale from '../components/CoverFinale'
import LayerTab from '../components/editor/LayerTab'
import RangeControl from '../components/editor/RangeControl'
import TextControls from '../components/editor/TextControls'
import { useMagazine } from '../context/MagazineContext'
import { composeCover } from '../utils/compose'
import { uploadCoverImage } from '../services/uploadImage'
import { coverFilename } from '../utils/filename'
import { downloadBlob } from '../utils/download'
import { ROUTES, DEFAULT_PERSON, DEFAULT_TEXT } from '../utils/constants'
import { ensureAllCoverFonts } from '../utils/coverFont'
import { INSTANT_FINISH, TEXT_ENABLED, UPLOAD_ENABLED } from '../config'
import bgSrc from '../assets/bg.jpeg'
import overlaySrc from '../assets/overlay.png'

export default function EditorPage() {
  const navigate = useNavigate()
  const {
    person,
    layout,
    name,
    updatePersonLayer,
    updateTextLayer,
    setFinal,
    setRemote,
    reset,
  } = useMagazine()
  const [selected, setSelected] = useState('person')
  const [phase, setPhase] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [finaleUrl, setFinaleUrl] = useState(null)
  const busy = phase !== 'idle'

  useEffect(() => {
    if (!person?.dataUrl) navigate(ROUTES.upload, { replace: true })
  }, [person, navigate])

  useEffect(() => {
    if (TEXT_ENABLED) ensureAllCoverFonts()
  }, [])

  if (!person?.dataUrl) return null



  const saveCover = (blob) => downloadBlob(blob, coverFilename(name))


  const finishSession = () => {
    setFinaleUrl(null)
    reset()
    navigate(ROUTES.upload, { replace: true })
  }

  const onGenerate = async () => {
    if (busy) return

    setPhase('composing')
    let composed
    try {
      composed = await composeCover({
        bgSrc,
        personSrc: person.dataUrl,
        overlaySrc,
        layout,
      })
      setFinal(composed.url, {
        width: composed.width,
        height: composed.height,
        scale: composed.scale,
      })
    } catch (err) {
      toast.error(err.message || 'Could not generate the cover.')
      setPhase('idle')
      return
    }


    if (INSTANT_FINISH) {
      saveCover(composed.blob)
      setFinaleUrl(composed.url)
      setPhase('idle')
      return
    }

    if (!UPLOAD_ENABLED) {
      setPhase('idle')
      navigate(ROUTES.result)
      return
    }

    setProgress(0)
    setPhase('uploading')
    setRemote({ status: 'uploading', imagePath: null, downloadUrl: null, error: null })

    try {
      const result = await toast.promise(
        uploadCoverImage(composed.blob, {
          filename: coverFilename(name),
          onProgress: setProgress,
        }),
        {
          loading: 'Uploading your cover…',
          success: 'Cover uploaded!',
          error: (err) => err?.message || 'Upload failed — download still works.',
        },
      )
      setRemote({
        status: 'success',
        imagePath: result.imagePath,
        downloadUrl: result.downloadUrl,
        error: null,
      })
    } catch (err) {
      setRemote({
        status: 'error',
        imagePath: null,
        downloadUrl: null,
        error: err?.message || 'Upload failed.',
      })
    } finally {
      setPhase('idle')
      navigate(ROUTES.result)
    }
  }

  const resetLayers = () => {
    updatePersonLayer({ ...DEFAULT_PERSON })
    if (TEXT_ENABLED) {
      updateTextLayer({
        x: DEFAULT_TEXT.x,
        y: DEFAULT_TEXT.y,
        fontScale: DEFAULT_TEXT.fontScale,
      })
    }
    toast('Layout reset', { icon: '↺' })
  }

  if (finaleUrl) {
    return <CoverFinale src={finaleUrl} onDone={finishSession} />
  }

  return (
    <div>
      <div className="mb-5 text-center">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Compose your cover
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {TEXT_ENABLED
            ? 'Drag to move · pull the corner handle to resize. Tap a layer to select it.'
            : 'Drag to move · pull the corner handle to resize.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 landscape:lg:grid-cols-[1fr_340px] landscape:lg:gap-6">
        <div className="mx-auto w-full max-w-[min(72vh,28rem)] landscape:lg:max-w-none">
          <MagazineCanvas
            interactive
            bgSrc={bgSrc}
            overlaySrc={overlaySrc}
            personSrc={person.dataUrl}
            layout={layout}
            selected={selected}
            onSelect={setSelected}
            onChangePerson={updatePersonLayer}
            onChangeText={updateTextLayer}
          />
        </div>

        <Card className="mx-auto h-fit w-full max-w-md p-4 sm:p-5 landscape:lg:max-w-none">
          {TEXT_ENABLED && (
            <div className="mb-5 grid grid-cols-2 gap-2">
              <LayerTab
                active={selected === 'person'}
                icon={<FiImage size={16} />}
                label="Photo"
                onClick={() => setSelected('person')}
              />
              <LayerTab
                active={selected === 'text'}
                icon={<FiType size={16} />}
                label="Name"
                onClick={() => setSelected('text')}
              />
            </div>
          )}

          {!TEXT_ENABLED || selected === 'person' ? (
            <RangeControl
              label="Photo size"
              value={layout.person.width}
              min={0.1}
              max={1.6}
              step={0.01}
              onChange={(v) => updatePersonLayer({ width: v })}
            />
          ) : (
            <TextControls
              layout={layout}
              name={name}
              onChange={updateTextLayer}
            />
          )}

          <hr className="my-5 border-line" />

          <div className="space-y-2.5">
            <Button size="lg" className="w-full" onClick={onGenerate} disabled={busy}>
              {phase === 'composing' && (
                <>
                  <Spinner size={18} /> Generating…
                </>
              )}
              {phase === 'uploading' && (
                <>
                  <Spinner size={18} /> Uploading… {progress}%
                </>
              )}
              {phase === 'idle' && (
                <>
                  <FiDownload size={18} />
                  {INSTANT_FINISH ? 'Generate & download' : 'Generate cover'}
                </>
              )}
            </Button>

            {phase === 'uploading' && (
              <div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-paper-200"
                  role="progressbar"
                  aria-label="Upload progress"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-clay transition-[width] duration-200"
                    style={{ width: `${Math.max(4, progress)}%` }}
                  />
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
                  <FiUploadCloud size={13} /> Saving to the gallery — you can
                  download it either way.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={busy}
                onClick={() => navigate(ROUTES.upload)}
              >
                <FiArrowLeft size={16} /> Back
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                disabled={busy}
                onClick={resetLayers}
              >
                <FiRotateCcw size={16} /> Reset
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
