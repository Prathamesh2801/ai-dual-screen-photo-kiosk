import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CAMERA_FACING,
  CAMERA_HEIGHT,
  CAMERA_WIDTH,
  CAPTURE_RATIO,
} from '../config'



function classifyError(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return {
        kind: 'denied',
        message:
          'Camera access was blocked. Allow the camera in your browser’s site settings, then try again.',
      }
    case 'NotFoundError':
    case 'OverconstrainedError':
      return {
        kind: 'missing',
        message:
          'No camera was found. Check that the webcam is plugged in, then try again.',
      }
    case 'NotReadableError':
      return {
        kind: 'busy',
        message:
          'The camera is already in use by another app. Close it and try again.',
      }
    default:
      return {
        kind: 'unknown',
        message: err?.message || 'The camera could not be started.',
      }
  }
}

export function useCamera() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [devices, setDevices] = useState([])
  const [deviceId, setDeviceId] = useState(null)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const generationRef = useRef(0)

  const stop = useCallback(() => {
    generationRef.current += 1
    const stream = streamRef.current
    if (stream) {
      for (const track of stream.getTracks()) track.stop()
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus('idle')
  }, [])

  const start = useCallback(
    async (requestedDeviceId) => {
      const isSupported =
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices?.getUserMedia

      if (!isSupported) {
        setError({
          kind: 'unsupported',
          message:
            'This browser cannot open a camera here. A secure page (https or localhost) is required.',
        })
        setStatus('error')
        return
      }

      stop()

      const generation = generationRef.current
      setStatus('starting')
      setError(null)


      const video = {
        width: { ideal: CAMERA_WIDTH },
        height: { ideal: CAMERA_HEIGHT },
      }
      if (requestedDeviceId) video.deviceId = { ideal: requestedDeviceId }
      else if (CAMERA_FACING) video.facingMode = { ideal: CAMERA_FACING }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video,
          audio: false,
        })

        if (generation !== generationRef.current) {
          for (const track of stream.getTracks()) track.stop()
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }

        setDeviceId(stream.getVideoTracks()[0]?.getSettings()?.deviceId ?? null)
        setStatus('ready')


        try {
          const all = await navigator.mediaDevices.enumerateDevices()
          setDevices(all.filter((d) => d.kind === 'videoinput'))
        } catch {
          // No device list only costs us the camera switcher.
        }
      } catch (err) {
        if (generation !== generationRef.current) return
        setError(classifyError(err))
        setStatus('error')
      }
    },
    [stop],
  )

  useEffect(() => stop, [stop])


  const capture = useCallback(async () => {
    const video = videoRef.current
    const track = streamRef.current?.getVideoTracks()[0]
    if (!video || !track) throw new Error('The camera is not running.')

    const settings = track.getSettings()
    const sourceW = settings.width || video.videoWidth
    const sourceH = settings.height || video.videoHeight
    if (!sourceW || !sourceH) throw new Error('The camera is not ready yet.')


    let width = sourceW
    let height = Math.round(sourceW / CAPTURE_RATIO)
    if (height > sourceH) {
      height = sourceH
      width = Math.round(sourceH * CAPTURE_RATIO)
    }
    const sx = Math.round((sourceW - width) / 2)
    const sy = Math.round((sourceH - height) / 2)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(video, sx, sy, width, height, 0, 0, width, height)

    const blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Could not capture the photo.'))),
        'image/png',
      ),
    )

    return new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' })
  }, [])

  return {
    videoRef,
    status,
    error,
    devices,
    deviceId,
    start,
    stop,
    capture,
    isReady: status === 'ready',
  }
}
