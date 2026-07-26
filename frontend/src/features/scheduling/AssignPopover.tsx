import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import AssignForm from './AssignForm'
import { formatSlotLabel } from './utils'
import type { Day } from './types'

interface AssignPopoverProps {
  day: Day
  hour: number
  anchorRect?: DOMRect
  excludeIds: string[]
  onAssign: (studentId: string) => void
  onClose: () => void
}

const POPOVER_WIDTH = 288
const MARGIN = 16

export default function AssignPopover({ day, hour, anchorRect, excludeIds, onAssign, onClose }: AssignPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [style, setStyle] = useState<React.CSSProperties>(() =>
    anchorRect
      ? { position: 'fixed', top: anchorRect.bottom + 8, left: anchorRect.left, width: POPOVER_WIDTH }
      : { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: POPOVER_WIDTH },
  )

  // Re-measure after the form renders (result count varies) and flip above the
  // cell — or clamp — whenever it would otherwise run off the bottom of the screen.
  useLayoutEffect(() => {
    if (!anchorRect || !ref.current) return
    const popoverHeight = ref.current.offsetHeight
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let left = anchorRect.left
    if (left + POPOVER_WIDTH > viewportWidth - MARGIN) left = viewportWidth - POPOVER_WIDTH - MARGIN
    if (left < MARGIN) left = MARGIN

    let top = anchorRect.bottom + 8
    const fitsBelow = top + popoverHeight <= viewportHeight - MARGIN
    if (!fitsBelow) {
      const topAbove = anchorRect.top - popoverHeight - 8
      top = topAbove >= MARGIN ? topAbove : MARGIN
    }

    setStyle({
      position: 'fixed',
      top,
      left,
      width: POPOVER_WIDTH,
      maxHeight: viewportHeight - MARGIN * 2,
      overflowY: 'auto',
    })
    // Re-run whenever the target slot changes (result list height can differ) or on resize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorRect, day, hour])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div ref={ref} style={style} className="z-50 bg-white border border-gray-200 rounded-2xl shadow-modal p-4">
      <p className="text-[13px] font-semibold text-gray-900 mb-3">{formatSlotLabel(day, hour, true)}</p>
      <AssignForm day={day} hour={hour} excludeIds={excludeIds} onAssign={onAssign} onCancel={onClose} />
    </div>
  )
}
