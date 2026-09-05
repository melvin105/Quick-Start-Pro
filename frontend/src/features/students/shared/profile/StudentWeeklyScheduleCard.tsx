import { useMemo, useState } from 'react'
import { AlertCircle, CalendarDays, Check, Loader2 } from 'lucide-react'
import { useApiResource } from '../../../../lib/useApiResource'
import type { ApiError } from '../../../../lib/apiError'
import {
  assignStudent,
  listSlots,
  unassignStudent,
  type ApiScheduleSlot,
} from '../../../scheduling/shared/schedulingService'
import type { Day } from '../../../scheduling/shared/types'
import {
  DAYS,
  DAY_ABBR,
  DAY_FULL,
  formatRangeShort,
  formatSlotLabel,
} from '../../../scheduling/shared/utils'

interface StudentWeeklyScheduleCardProps {
  studentId: string
}

function isAssigned(slot: ApiScheduleSlot, studentId: string) {
  return slot.assignments.some((assignment) => assignment.studentId === studentId)
}

export default function StudentWeeklyScheduleCard({ studentId }: StudentWeeklyScheduleCardProps) {
  const { data, loading, error, refetch } = useApiResource(listSlots, [studentId])
  const [activeDay, setActiveDay] = useState<Day>('MON')
  const [busySlotId, setBusySlotId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const activeSlots = useMemo(
    () => (data?.slots ?? []).filter((slot) => slot.isActive && slot.day !== null),
    [data],
  )
  const selectedSlots = useMemo(
    () => activeSlots.filter((slot) => isAssigned(slot, studentId)),
    [activeSlots, studentId],
  )
  const visibleSlots = useMemo(
    () => activeSlots.filter((slot) => slot.day === activeDay),
    [activeDay, activeSlots],
  )

  const handleToggle = async (slot: ApiScheduleSlot) => {
    const assigned = isAssigned(slot, studentId)
    const full = slot.assignments.length >= slot.capacity
    if ((!assigned && full) || busySlotId) return

    setBusySlotId(slot.id)
    setActionError(null)
    setSuccessMessage(null)

    try {
      if (assigned) {
        await unassignStudent(slot.id, studentId)
        setSuccessMessage(`Removed ${formatSlotLabel(slot.day as Day, slot.startHour)}.`)
      } else {
        await assignStudent(slot.id, studentId)
        setSuccessMessage(`Assigned ${formatSlotLabel(slot.day as Day, slot.startHour)}.`)
      }
      await refetch()
    } catch (err) {
      setActionError((err as ApiError)?.message ?? 'The schedule could not be updated. Please try again.')
      await refetch()
    } finally {
      setBusySlotId(null)
    }
  }

  if (!data && loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5 min-h-48 flex items-center justify-center">
        <div className="flex items-center gap-2 text-[13px] text-gray-500" role="status">
          <Loader2 size={17} className="animate-spin text-brand-600" />
          Loading weekly schedule…
        </div>
      </div>
    )
  }

  if (!data && error) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-start gap-3" role="alert">
          <AlertCircle size={18} className="text-danger mt-0.5 shrink-0" />
          <div>
            <p className="text-[13.5px] font-semibold text-gray-900">Couldn’t load the weekly schedule</p>
            <p className="text-[12.5px] text-gray-500 mt-1">{error.message}</p>
            <button type="button" onClick={refetch} className="text-[12.5px] font-medium text-brand-600 mt-2">
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <CalendarDays size={18} />
          </span>
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900">Weekly Schedule</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Select recurring lesson times. Changes appear immediately on the Schedule page.
            </p>
          </div>
        </div>
        <span className="text-[12px] font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full">
          {selectedSlots.length} {selectedSlots.length === 1 ? 'slot' : 'slots'} assigned
        </span>
      </div>

      {selectedSlots.length > 0 && (
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Current slots</p>
          <div className="flex flex-wrap gap-2">
            {selectedSlots.map((slot) => (
              <span key={slot.id} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-[12px] font-medium">
                <Check size={12} />
                {formatSlotLabel(slot.day as Day, slot.startHour, true)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1" role="tablist" aria-label="Schedule day">
          {DAYS.map((day) => {
            const selectedCount = selectedSlots.filter((slot) => slot.day === day).length
            return (
              <button
                key={day}
                type="button"
                role="tab"
                aria-selected={activeDay === day}
                onClick={() => setActiveDay(day)}
                className={`min-w-14 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors ${
                  activeDay === day
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {DAY_ABBR[day]}
                {selectedCount > 0 && (
                  <span className={`ml-1.5 text-[10px] ${activeDay === day ? 'text-white/80' : 'text-brand-600'}`}>
                    {selectedCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <p className="text-[12px] font-medium text-gray-700 mt-4 mb-2">{DAY_FULL[activeDay]}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2">
          {visibleSlots.map((slot) => {
            const assigned = isAssigned(slot, studentId)
            const full = slot.assignments.length >= slot.capacity
            const busy = busySlotId === slot.id
            const disabled = Boolean(busySlotId) || (!assigned && full)

            return (
              <button
                key={slot.id}
                type="button"
                disabled={disabled}
                onClick={() => void handleToggle(slot)}
                aria-pressed={assigned}
                aria-label={`${assigned ? 'Remove' : 'Assign'} ${formatSlotLabel(activeDay, slot.startHour)}`}
                className={`min-h-16 rounded-xl border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed ${
                  assigned
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : full
                      ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-70'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50/40'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[12.5px] font-semibold">{formatRangeShort(slot.startHour)}</span>
                  {busy ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : assigned ? (
                    <Check size={13} />
                  ) : null}
                </span>
                <span className="block text-[10.5px] mt-1 opacity-75">
                  {full && !assigned ? 'Full' : `${slot.assignments.length}/${slot.capacity} booked`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {(actionError || successMessage) && (
        <div
          role={actionError ? 'alert' : 'status'}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] ${
            actionError ? 'bg-danger/10 text-danger' : 'bg-green-50 text-green-700'
          }`}
        >
          {actionError ? <AlertCircle size={14} /> : <Check size={14} />}
          {actionError ?? successMessage}
        </div>
      )}
    </section>
  )
}
