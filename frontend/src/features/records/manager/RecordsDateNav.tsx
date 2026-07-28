import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { formatDateWithWeekday } from '../shared/utils'

function shiftDay(iso: string, delta: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

interface RecordsDateNavProps {
  date:        string
  onChange:    (date: string) => void
  submittedBy?: string
  submittedAt?: string
}

export default function RecordsDateNav({ date, onChange, submittedBy, submittedAt }: RecordsDateNavProps) {
  const pickerRef = useRef<HTMLInputElement>(null)
  const isToday = date === todayIso()

  const submittedLabel = submittedBy && submittedAt
    ? `Submitted by: ${submittedBy} at ${new Date(submittedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', '')}`
    : 'Submitted by: —'

  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onChange(shiftDay(date, -1))}
          className="p-1.5 rounded-lg text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-[13.5px] font-medium text-gray-900 whitespace-nowrap">
          {formatDateWithWeekday(date)}
        </span>
        <button
          type="button"
          onClick={() => onChange(shiftDay(date, 1))}
          disabled={isToday}
          className="p-1.5 rounded-lg text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next day"
        >
          <ChevronRight size={16} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => pickerRef.current?.showPicker?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar size={14} /> Pick Date
          </button>
          <input
            ref={pickerRef}
            type="date"
            value={date}
            max={todayIso()}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {!isToday && (
          <button
            type="button"
            onClick={() => onChange(todayIso())}
            className="px-3 py-1.5 text-[12.5px] font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-full transition-colors"
          >
            Today
          </button>
        )}
      </div>

      <p className="text-[12px] text-gray-500 whitespace-nowrap">{submittedLabel}</p>
    </div>
  )
}
