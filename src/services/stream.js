import { MOCK, SSE_STALE_MS, SSE_URL } from '../config'
import { MOCK_CHANNEL } from '../utils/constants'
import { toReachableUrl } from './apiOrigin'

// Frame shape is unconfirmed — see "Open questions" in CLAUDE.md.
function toResult(frame) {
  if (!frame?.image_url) return null
  return {
    id: String(frame.id ?? frame.image_url),
    imageUrl: toReachableUrl(frame.image_url),
    downloadUrl: toReachableUrl(frame.download_url ?? frame.image_url),
  }
}

function parse(raw) {
  try {
    return toResult(JSON.parse(raw))
  } catch {
    return null
  }
}

export function subscribeResults(onResult, onStatus) {
  if (MOCK.stream) {
    const channel = new BroadcastChannel(MOCK_CHANNEL)
    channel.onmessage = (e) => {
      const result = toResult(e.data)
      if (result) onResult(result)
    }
    onStatus(true)
    return () => channel.close()
  }

  let source
  let watchdog

  // Heartbeats sent as SSE ":" comments never reach JS, so this watchdog
  // would kill a healthy stream. Set SSE_STALE_MS to 0 in that case.
  const arm = () => {
    if (!SSE_STALE_MS) return
    clearTimeout(watchdog)
    watchdog = setTimeout(() => {
      source.close()
      onStatus(false)
      open()
    }, SSE_STALE_MS)
  }

  const open = () => {
    source = new EventSource(SSE_URL)
    source.onopen = () => {
      onStatus(true)
      arm()
    }
    source.onmessage = (e) => {
      arm()
      const result = parse(e.data)
      if (result) onResult(result)
    }
    source.addEventListener('heartbeat', arm)
    source.onerror = () => onStatus(false)
    arm()
  }

  open()
  return () => {
    clearTimeout(watchdog)
    source.close()
  }
}
