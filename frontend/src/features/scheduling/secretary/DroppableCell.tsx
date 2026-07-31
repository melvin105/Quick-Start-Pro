import { useDroppable } from '@dnd-kit/core'
import type { Day } from '../shared/types'

interface DroppableCellProps {
  day: Day
  hour: number
  onClick: (el: HTMLElement) => void
}

export default function DroppableCell({ day, hour, onClick }: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot::${day}::${hour}`, data: { day, hour } })
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={(e) => onClick(e.currentTarget)}
      className={`min-h-[72px] p-1.5 m-0.5 rounded-md border border-dashed transition-colors ${
        isOver ? 'border-brand-600 bg-brand-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
      }`}
    />
  )
}
