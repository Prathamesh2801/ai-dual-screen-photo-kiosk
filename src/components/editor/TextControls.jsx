import RangeControl from './RangeControl'
import { TEXT_COLORS } from '../../utils/constants'
import {
  COVER_FONT_OPTIONS,
  TEXT_CASE_OPTIONS,
  applyTextCase,
  coverFontStack,
} from '../../utils/coverFont'

export default function TextControls({ layout, name, onChange }) {
  const text = layout.text

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Font</p>
        <div className="grid grid-cols-2 gap-2">
          {COVER_FONT_OPTIONS.map((font) => (
            <button
              key={font.key}
              type="button"
              onClick={() => onChange({ fontKey: font.key })}
              className={`rounded-xl border px-3 py-2.5 transition-colors ${
                text.fontKey === font.key
                  ? 'border-clay bg-clay/10 text-ink'
                  : 'border-line bg-paper text-ink-soft hover:bg-paper-200'
              }`}
            >
              <span
                className="block truncate text-lg leading-tight"
                style={{
                  fontFamily: coverFontStack(font.key),
                  fontWeight: font.weight,
                }}
              >
                {applyTextCase(name || 'Aa Bb Cc', text.textCase)}
              </span>
              <span className="mt-0.5 block text-[11px] text-ink-muted">
                {font.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Letter case</p>
        <div className="grid grid-cols-3 gap-2">
          {TEXT_CASE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              title={option.hint}
              onClick={() => onChange({ textCase: option.key })}
              className={`rounded-xl border px-2 py-2 text-sm font-semibold
                transition-colors ${
                  text.textCase === option.key
                    ? 'border-clay bg-clay text-white'
                    : 'border-line bg-paper text-ink-soft hover:bg-paper-200'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <RangeControl
        label="Text size"
        value={text.fontScale}
        min={0.03}
        max={0.2}
        step={0.005}
        onChange={(v) => onChange({ fontScale: v })}
      />

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Text color</p>
        <div className="flex flex-wrap gap-2">
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Use color ${c}`}
              onClick={() => onChange({ color: c })}
              className={`h-8 w-8 rounded-full border-2 transition ${
                text.color === c
                  ? 'border-clay ring-2 ring-clay/40'
                  : 'border-white shadow-soft'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {!name && (
        <p className="text-xs text-ink-muted">
          Tip: add a name on the previous step to show a headline.
        </p>
      )}
    </div>
  )
}
