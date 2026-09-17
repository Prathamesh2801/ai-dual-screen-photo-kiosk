import { useEffect, useRef } from 'react'
import MovableLayer from './MovableLayer'
import {
  applyTextCase,
  coverFont,
  coverFontStack,
  ensureCoverFont,
} from '../utils/coverFont'
import { COVER_RATIO } from '../utils/constants'
import { TEXT_ENABLED } from '../config'


export default function MagazineCanvas({
  bgSrc,
  overlaySrc,
  personSrc,
  layout,
  interactive = false,
  selected,
  onSelect,
  onChangePerson,
  onChangeText,
  className = '',
}) {
  const containerRef = useRef(null)
  const fontKey = layout.text?.fontKey
  const text = TEXT_ENABLED
    ? applyTextCase(layout.text?.content?.trim(), layout.text?.textCase)
    : null

  useEffect(() => {
    if (TEXT_ENABLED) ensureCoverFont(fontKey)
  }, [fontKey])

  const textStyle = {
    fontFamily: coverFontStack(fontKey),
    fontWeight: coverFont(fontKey).weight,
    fontSize: `${layout.text.fontScale * 100}cqw`,
    color: layout.text.color,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    textShadow: '0 2px 6px rgba(0,0,0,0.45)',
    WebkitTextStroke: '0.5px rgba(0,0,0,0.25)',
  }

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto w-full overflow-hidden rounded-lg bg-paper-200
        shadow-lift ${className}`}
      style={{ aspectRatio: COVER_RATIO, containerType: 'inline-size' }}
      onPointerDown={interactive ? () => onSelect?.(null) : undefined}
    >
      <img
        src={bgSrc}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {personSrc &&
        (interactive ? (
          <MovableLayer
            containerRef={containerRef}
            x={layout.person.x}
            y={layout.person.y}
            size={layout.person.width}
            minSize={0.1}
            maxSize={1.6}
            selected={selected === 'person'}
            onSelect={() => onSelect?.('person')}
            onChange={(patch) =>
              onChangePerson(mapSize(patch, 'width'))
            }
            style={{ width: `${layout.person.width * 100}%` }}
          >
            <img
              src={personSrc}
              alt="Cover subject"
              draggable={false}
              className="pointer-events-none w-full select-none"
            />
          </MovableLayer>
        ) : (
          <img
            src={personSrc}
            alt="Cover subject"
            draggable={false}
            className="pointer-events-none absolute select-none"
            style={{
              left: `${layout.person.x * 100}%`,
              top: `${layout.person.y * 100}%`,
              width: `${layout.person.width * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

      {text &&
        (interactive ? (
          <MovableLayer
            containerRef={containerRef}
            x={layout.text.x}
            y={layout.text.y}
            size={layout.text.fontScale}
            minSize={0.02}
            maxSize={0.3}
            selected={selected === 'text'}
            onSelect={() => onSelect?.('text')}
            onChange={(patch) => onChangeText(mapSize(patch, 'fontScale'))}
          >
            <span style={textStyle}>{text}</span>
          </MovableLayer>
        ) : (
          <span
            className="pointer-events-none absolute"
            style={{
              ...textStyle,
              left: `${layout.text.x * 100}%`,
              top: `${layout.text.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {text}
          </span>
        ))}

      <img
        src={overlaySrc}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
    </div>
  )
}

function mapSize(patch, sizeKey) {
  if ('size' in patch) {
    const { size, ...rest } = patch
    return { ...rest, [sizeKey]: size }
  }
  return patch
}
