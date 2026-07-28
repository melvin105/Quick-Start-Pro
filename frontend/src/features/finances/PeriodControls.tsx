import { useState } from 'react'
import { ChevronDown, Calendar, Download } from 'lucide-react'
import type { PeriodKey, PeriodRange } from './period'

const PRESET_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: 'this-month',    label: 'This Month' },
  { value: 'last-month',    label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
]

interface PeriodControlsProps {
  period:              PeriodKey
  onPeriodChange:      (period: PeriodKey) => void
  customRange:         PeriodRange
  onApplyCustomRange:  (range: PeriodRange) => void
  onExport:            () => void
}

export default function PeriodControls({ period, onPeriodChange, customRange, onApplyCustomRange, onExport }: PeriodControlsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(customRange.from)
  const [draftTo, setDraftTo] = useState(customRange.to)

  const presetLabel = PRESET_OPTIONS.find((o) => o.value === period)?.label ?? 'Custom Range'

  const handleApply = () => {
    if (!draftFrom || !draftTo) return
    onApplyCustomRange({ from: draftFrom, to: draftTo })
    setCustomOpen(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen((p) => !p)}
          className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {presetLabel}
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <ul className="absolute right-0 z-20 mt-1 min-w-[160px] bg-white border border-gray-200 rounded-lg shadow-card overflow-hidden">
              {PRESET_OPTIONS.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => { onPeriodChange(opt.value); setDropdownOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-[13px] whitespace-nowrap hover:bg-brand-50 transition-colors ${
                      period === opt.value ? 'text-brand-600 font-medium bg-brand-50' : 'text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setCustomOpen((p) => !p)}
          className={`flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium rounded-lg border transition-colors ${
            period === 'custom' ? 'text-brand-600 bg-brand-50 border-brand-200' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Calendar size={14} /> Custom Range
        </button>
        {customOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setCustomOpen(false)} />
            <div className="absolute right-0 z-20 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-card p-3 flex flex-col gap-2.5">
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={draftFrom}
                  max={draftTo || undefined}
                  onChange={(e) => setDraftFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={draftTo}
                  min={draftFrom || undefined}
                  onChange={(e) => setDraftTo(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                />
              </div>
              <button
                type="button"
                onClick={handleApply}
                disabled={!draftFrom || !draftTo}
                className="mt-1 px-3 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onExport}
        className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors"
      >
        <Download size={15} /> Export
      </button>
    </div>
  )
}
