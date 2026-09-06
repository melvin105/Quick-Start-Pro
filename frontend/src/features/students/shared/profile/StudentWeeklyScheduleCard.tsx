import { useMemo, useState } from 'react'
import { AlertCircle, CalendarDays, Check, Copy, Loader2, X } from 'lucide-react'
import { useApiResource } from '../../../../lib/useApiResource'
import type { ApiError } from '../../../../lib/apiError'
import {
  assignStudent,
  applySlotToDays,
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
  const [copySource, setCopySource] = useState<ApiScheduleSlot | null>(null)
  const [copyDays, setCopyDays] = useState<Set<number>>(new Set())
  const [copying, setCopying] = useState(false)

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

  const openCopyDialog = (source: ApiScheduleSlot) => {
    const availableDays = activeSlots
      .filter((slot) => slot.startHour === source.startHour && slot.id !== source.id)
      .filter((slot) => !isAssigned(slot, studentId) && slot.assignments.length < slot.capacity)
      .map((slot) => slot.dayOfWeek)
    setCopySource(source)
    setCopyDays(new Set(availableDays))
    setActionError(null)
    setSuccessMessage(null)
  }

  const toggleCopyDay = (day: number) => {
    setCopyDays((current) => {
      const next = new Set(current)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  const handleApplyToDays = async () => {
    if (!copySource || copyDays.size === 0 || copying) return
    setCopying(true)
    setActionError(null)
    try {
      const result = await applySlotToDays(copySource.id, studentId, [...copyDays])
      const total = result.assignedDays.length
      setSuccessMessage(`Applied ${formatRangeShort(result.startHour)} to ${total} ${total === 1 ? 'day' : 'days'}.`)
      setCopySource(null)
      setCopyDays(new Set())
      await refetch()
    } catch (err) {
      setActionError((err as ApiError)?.message ?? 'The time could not be applied. Please try again.')
      await refetch()
    } finally {
      setCopying(false)
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
              <span key={slot.id} className="inline-flex items-center rounded-lg bg-brand-50 text-brand-700 text-[12px] font-medium overflow-hidden">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5">
                  <Check size={12} />
                  {formatSlotLabel(slot.day as Day, slot.startHour, true)}
                </span>
                <button
                  type="button"
                  onClick={() => openCopyDialog(slot)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border-l border-brand-200 hover:bg-brand-100 transition-colors"
                  aria-label={`Apply ${formatSlotLabel(slot.day as Day, slot.startHour)} to other days`}
                >
                  <Copy size={11} />
                  Apply to days
                </button>
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

      {copySource && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => !copying && setCopySource(null)}
            aria-label="Close apply-to-days dialog"
          />
          <div className="relative bg-white rounded-2xl shadow-modal max-w-md w-full p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">Apply time to other days</h3>
                <p className="text-[12.5px] text-gray-500 mt-1">
                  Copy {formatRangeShort(copySource.startHour)} from {DAY_FULL[copySource.day as Day]}.
                </p>
              </div>
              <button
                type="button"
                disabled={copying}
                onClick={() => setCopySource(null)}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DAYS.filter((day) => day !== copySource.day).map((day) => {
                const slot = activeSlots.find(
                  (candidate) => candidate.day === day && candidate.startHour === copySource.startHour,
                )
                const assigned = slot ? isAssigned(slot, studentId) : false
                const full = slot ? slot.assignments.length >= slot.capacity : true
                const unavailable = !slot || assigned || full
                return (
                  <label
                    key={day}
                    className={`rounded-xl border px-3 py-2.5 text-[12.5px] ${
                      unavailable
                        ? 'border-gray-200 bg-gray-50 text-gray-400'
                        : slot && copyDays.has(slot.dayOfWeek)
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-gray-200 text-gray-700 cursor-pointer hover:border-brand-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={unavailable || copying}
                        checked={assigned || (slot ? copyDays.has(slot.dayOfWeek) : false)}
                        onChange={() => slot && toggleCopyDay(slot.dayOfWeek)}
                        className="accent-brand-600"
                      />
                      <span className="font-medium">{DAY_FULL[day]}</span>
                    </span>
                    <span className="block text-[10.5px] mt-1 ml-5">
                      {assigned ? 'Already assigned' : full ? 'Full' : `${slot?.assignments.length ?? 0}/${slot?.capacity ?? 0} booked`}
                    </span>
                  </label>
                )
              })}
            </div>

            <p className="text-[11.5px] text-gray-500">
              Available days are selected automatically. Deselect any day you do not want to include.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={copying}
                onClick={() => setCopySource(null)}
                className="px-4 py-2 text-[13px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={copyDays.size === 0 || copying}
                onClick={() => void handleApplyToDays()}
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copying && <Loader2 size={14} className="animate-spin" />}
                Apply to {copyDays.size} {copyDays.size === 1 ? 'day' : 'days'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
