import { Check, Circle } from 'lucide-react'
import { passwordRequirements } from '../../lib/passwordPolicy'

interface PasswordHintsProps {
  /** The current password value being typed. */
  value: string
  className?: string
}

// A live "password requirements" checklist. Drop it under a password field and
// pass the field's current value — each rule turns from a grey dot to a green
// check as it's satisfied. Rules and wording come from lib/passwordPolicy, which
// mirrors the backend, so what the user ticks off is exactly what the API
// accepts.
//
// Requirements start grey (neutral), not red — we're guiding, not scolding a
// half-typed password. The consuming form still shows the real backend error on
// submit if something slips through.
export default function PasswordHints({ value, className = '' }: PasswordHintsProps) {
  const requirements = passwordRequirements(value)

  return (
    <ul className={`flex flex-col gap-1 ${className}`}>
      {requirements.map((req) => (
        <li key={req.key} className="flex items-center gap-1.5 text-[12px]">
          {req.met ? (
            <Check size={13} className="text-success shrink-0" aria-hidden />
          ) : (
            <Circle size={13} className="text-gray-300 shrink-0" aria-hidden />
          )}
          <span className={req.met ? 'text-success' : 'text-gray-500'}>{req.label}</span>
        </li>
      ))}
    </ul>
  )
}
