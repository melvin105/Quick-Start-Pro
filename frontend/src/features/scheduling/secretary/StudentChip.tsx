import { useDraggable } from '@dnd-kit/core'
import type { SlotAssignment, Day } from '../shared/types'

interface StudentChipProps {
  name: string
  assignment: SlotAssignment
  day?: Day
  hour?: number
  draggable?: boolean
}

export default function StudentChip({ name, assignment, day, hour, draggable = false }: StudentChipProps) {
  const canDrag = draggable && day !== undefined && hour !== undefined

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `chip::${assignment.studentId}::${day}::${hour}`,
    data: { studentId: assignment.studentId, day, hour },
    disabled: !canDrag,
  })

  const style = canDrag && transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 40, position: 'relative' as const }
    : undefined

  return (
    <div
      ref={canDrag ? setNodeRef : undefined}
      style={style}
      {...(canDrag ? attributes : {})}
      {...(canDrag ? listeners : {})}
      className={`border-l-2 border-l-success bg-success-bg/60 rounded-r-md px-1.5 py-1 text-left w-full ${
        canDrag ? 'cursor-grab active:cursor-grabbing touch-none' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <p className="text-[11px] font-medium text-gray-900 truncate">{name}</p>
    </div>
  )
}
