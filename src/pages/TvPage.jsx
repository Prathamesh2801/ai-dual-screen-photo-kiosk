import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { RESULT_HOLD_MS } from '../config'
import { subscribeResults } from '../services/stream'
import idle from '../assets/tv-idle.jpg'
import logo from '../assets/logo.svg'

export default function TvPage() {
  const [result, setResult] = useState(null)
  const [online, setOnline] = useState(false)
  const [left, setLeft] = useState(0)
  const lastId = useRef(null)

  useEffect(
    () =>
      subscribeResults((r) => {
        if (r.id === lastId.current) return
        lastId.current = r.id
        setLeft(RESULT_HOLD_MS)
        setResult(r)
      }, setOnline, (id) => setResult((cur) => (cur?.id === id ? null : cur))),
    [],
  )

  useEffect(() => {
    if (!result) return
    const end = Date.now() + RESULT_HOLD_MS
    const tick = setInterval(() => {
      const ms = end - Date.now()
      if (ms <= 0) setResult(null)
      else setLeft(ms)
    }, 1000)
    return () => clearInterval(tick)
  }, [result])

  const secs = Math.ceil(left / 1000)

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
          className="absolute inset-0 flex flex-col items-center gap-[5vmin] px-[6vmin] pt-[5vmin] pb-[6vmin]"
        >
          <img src={logo} alt="Capgemini" className="fade-in h-[6vmin] w-auto self-end opacity-90" />

          <div className="flex min-h-0 w-full flex-1 items-center justify-center">
            <img
              src={result.imageUrl}
              alt="Guest photo"
              onError={() => setResult(null)}
              className="reveal-cover max-h-full max-w-full rounded-[3vmin] bg-white/10 object-contain p-[1.5vmin] shadow-lift ring-1 ring-white/30 backdrop-blur-xl"
            />
          </div>

          <div className="reveal-actions flex w-full max-w-[80vmin] items-center gap-[4vmin] rounded-[4vmin] bg-white/10 p-[3vmin] shadow-lift ring-1 ring-white/25 backdrop-blur-xl">
            <div className="shrink-0 rounded-[2vmin] bg-white p-[1.5vmin]">
              <QRCodeSVG
                value={result.downloadUrl}
                size={512}
                marginSize={0}
                fgColor="#0d1a3d"
                style={{ width: '24vmin', height: '24vmin' }}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-[2.5vmin]">
              <p className="text-[4.5vmin] leading-tight font-medium">Scan to download</p>
              <div className="h-[0.8vmin] overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-aqua transition-[width] duration-1000 ease-linear"
                  style={{ width: `${(left / RESULT_HOLD_MS) * 100}%` }}
                />
              </div>
              <p className="text-[3vmin] text-white/70 tabular-nums">
                Available for {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      )}

      <span
        className={`absolute bottom-[1.5vmin] left-[1.5vmin] h-[1vmin] w-[1vmin] rounded-full
          ${online ? 'animate-pulse bg-green-400 opacity-40' : 'bg-danger opacity-80'}`}
        title={online ? 'Live' : 'Reconnecting…'}
      />
    </div>
  )
}
