import { getInitials } from './utils'

interface StudentAvatarProps {
  name: string
  photo?: string
  className?: string
}

// Drop-in replacement for the old initials-only circle — pass the same
// sizing/text classes (w-*, h-*, text-[*]) that were on the div before.
export default function StudentAvatar({ name, photo, className = '' }: StudentAvatarProps) {
  if (photo) {
    return <img src={photo} alt={name} className={`rounded-full object-cover shrink-0 ${className}`} />
  }
  return (
    <div className={`rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-semibold shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  )
}
