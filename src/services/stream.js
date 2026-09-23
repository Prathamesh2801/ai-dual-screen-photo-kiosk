import { MOCK, SSE_FRESH_MS, SSE_RETRY_MS, SSE_URL } from '../config'
import { MOCK_CHANNEL } from '../utils/constants'
import { toReachableUrl } from './apiOrigin'

function toResult(frame) {
  if (!frame?.image_url) return null
  return {
    id: String(frame.id ?? frame.image_url),
    imageUrl: toReachableUrl(frame.image_url),
    downloadUrl: toReachableUrl(frame.view_url ?? frame.download_url ?? frame.image_url),
  }
}

// ponytail: freshness trusts the TV and server clocks to agree within SSE_FRESH_MS.
function isFresh(frame) {
  const at = Date.parse(frame.uploaded_at)
  return Number.isNaN(at) || Date.now() - at < SSE_FRESH_MS
}

function parse(raw) {
  try {
    const frame = JSON.parse(raw)
    return isFresh(frame) ? toResult(frame) : null
  } catch {
    return null
  }
}

export function subscribeResults(onResult, onStatus, onDownloaded) {
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
  let retry

  // The server's ": ping" keep-alives are SSE comments and never reach JS, so
  // liveness comes from open/error alone.
  const open = () => {
    source = new EventSource(SSE_URL)
    source.onopen = () => onStatus(true)
    source.addEventListener('upload', (e) => {
      const result = parse(e.data)
      if (result) onResult(result)
    })
    // Carries the upload's id once the guest downloads it from view_url.
    source.addEventListener('downloaded', (e) => {
      try {
        onDownloaded(String(JSON.parse(e.data).id))
      } catch {
        // Malformed frame: nothing to clear.
      }
    })
    source.onerror = () => {
      onStatus(false)
      // EventSource retries on its own unless the response was not a stream.
      if (source.readyState === EventSource.CLOSED) retry = setTimeout(open, SSE_RETRY_MS)
    }
  }

  open()
  return () => {
    clearTimeout(retry)
    source.close()
  }
}
