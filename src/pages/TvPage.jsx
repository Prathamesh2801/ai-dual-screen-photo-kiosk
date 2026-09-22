import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { RESULT_HOLD_MS } from '../config'
import { subscribeResults } from '../services/stream'
import idle from '../assets/tv-idle.jpg'
import logo from '../assets/logo.svg'

export default function TvPage() {
  const [result, setResult] = useState(null)
  const [online, setOnline] = useState(true)
  const lastId = useRef(null)

  useEffect(
    () =>
      subscribeResults((r) => {
        if (r.id === lastId.current) return
        lastId.current = r.id
        setResult(r)
      }, setOnline),
    [],
  )

  useEffect(() => {
    if (!result) return
    const timer = setTimeout(() => setResult(null), RESULT_HOLD_MS)
    return () => clearTimeout(timer)
  }, [result])

  return (
    <div className="fixed inset-0 overflow-hidden bg-navy-deep text-white select-none">
      <img
        src={idle}
        alt=""
        className={`absolute inset-0 h-full w-full scale-110 object-cover blur-2xl transition duration-1000
          ${result ? 'opacity-40' : 'opacity-60'}`}
      />
      <img
        src={idle}
        alt=""
        className={`absolute inset-0 h-full w-full object-contain transition duration-1000
          ${result ? 'opacity-0' : ''}`}
      />

      {result && (
        <div
          key={result.id}
          className="absolute inset-0 flex flex-col items-center justify-center gap-[5vmin] px-[6vmin] pt-[16vmin] pb-[6vmin]"
        >
          <img src={logo} alt="Capgemini" className="fade-in absolute top-[4vmin] right-[5vmin] h-[7vmin] w-auto" />

          <h1 className="reveal-head text-center text-[7vmin] leading-tight font-bold">
            Your AI Moment
          </h1>

          <img
            src={result.imageUrl}
            alt="Guest photo"
            onError={() => setResult(null)}
            className="reveal-cover max-h-[50vh] max-w-full rounded-[2vmin] object-contain shadow-lift ring-[0.4vmin] ring-white/70"
          />

          <div className="reveal-actions flex items-center gap-[4vmin] rounded-[3vmin] bg-white/10 p-[3vmin] ring-1 ring-white/25 backdrop-blur-md">
            <div className="rounded-[2vmin] bg-white p-[2vmin]">
              <QRCodeSVG
                value={result.downloadUrl}
                size={512}
                marginSize={0}
                fgColor="#0b1530"
                style={{ width: '28vmin', height: '28vmin' }}
              />
            </div>
            <p className="max-w-[42vmin] text-[5vmin] leading-snug font-medium">
              Scan to download your photo
            </p>
          </div>
        </div>
      )}

      {!online && (
        <span className="absolute bottom-[2vmin] left-[2vmin] h-[1.5vmin] w-[1.5vmin] rounded-full bg-danger" title="Reconnecting…" />
      )}
    </div>
  )
}
