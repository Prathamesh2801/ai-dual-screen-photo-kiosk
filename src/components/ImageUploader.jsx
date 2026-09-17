import { useRef } from 'react'
import toast from 'react-hot-toast'
import { FiCamera, FiUploadCloud } from 'react-icons/fi'
import { CAMERA_ENABLED, FILE_UPLOAD_ENABLED } from '../config'

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']


export default function ImageUploader({ onSelect, onUseCamera }) {
  const uploadRef = useRef(null)

  const showCamera = CAMERA_ENABLED
  const showFile = FILE_UPLOAD_ENABLED || !CAMERA_ENABLED

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!ACCEPTED.includes(file.type)) {
      toast.error('Please choose a PNG, JPG or WebP image.')
      return
    }
    onSelect(file)
  }

  return (
    <div
      className={`grid grid-cols-1 gap-3 ${
        showCamera && showFile ? 'sm:grid-cols-2' : ''
      }`}
    >
      <input
        ref={uploadRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={handleFile}
      />

      {showCamera && (
        <button
          type="button"
          onClick={onUseCamera}
          className="group flex flex-col items-center gap-2 rounded-2xl border-2
            border-dashed border-line bg-paper-100 px-4 py-8 text-ink-soft
            transition-colors hover:border-clay hover:bg-paper-200"
        >
          <FiCamera size={30} className="text-clay" />
          <span className="font-semibold text-ink">Take a photo</span>
          <span className="text-xs text-ink-muted">Use the camera</span>
        </button>
      )}

      {showFile && (
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className="group flex flex-col items-center gap-2 rounded-2xl border-2
            border-dashed border-line bg-paper-100 px-4 py-8 text-ink-soft
            transition-colors hover:border-clay hover:bg-paper-200"
        >
          <FiUploadCloud size={30} className="text-clay" />
          <span className="font-semibold text-ink">Upload image</span>
          <span className="text-xs text-ink-muted">PNG, JPG or WebP · full resolution</span>
        </button>
      )}
    </div>
  )
}
