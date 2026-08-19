import { format, isValid, parseISO } from 'date-fns'
import type { Registration } from './registrationService'

// The full submitted form, mapped to display-ready values, for the secretary to
// review in the Complete Registration modal before finalising.
export interface RegistrationDetails {
  dobLabel:     string
  genderLabel:  string
  email:        string | null
  address:      string | null
  photoUrl:     string | null
  idCardType:   string | null
  idCardNumber: string | null
  nextOfKin:    { name: string | null; relationship: string | null; phone: string | null; email: string | null }
  emergency:    { name: string | null; phone: string | null; relationship: string | null }
}

// UI shape for one row of the Pending queue. The list cards show name / phone /
// submitted; the modal reads `details` to render the full review.
export interface PendingItem {
  id:             string
  name:           string
  phone:          string
  submittedLabel: string
  details:        RegistrationDetails
}

// 'YYYY-MM-DDTHH:mm:ssZ' -> 'd MMM yyyy' (e.g. '3 Aug 2026'); '' for a missing
// or unparseable timestamp so the cell degrades quietly instead of showing NaN.
export function formatSubmitted(iso: string | null): string {
  if (!iso) return ''
  const date = parseISO(iso)
  return isValid(date) ? format(date, 'd MMM yyyy') : ''
}

function titleCase(value: string | null): string {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function toPendingItem(reg: Registration): PendingItem {
  return {
    id:             reg.id,
    name:           `${reg.first_name} ${reg.last_name}`,
    phone:          reg.phone,
    submittedLabel: formatSubmitted(reg.submitted_at),
    details: {
      dobLabel:     formatSubmitted(reg.dob),
      genderLabel:  titleCase(reg.gender),
      email:        reg.email,
      address:      reg.address,
      photoUrl:     reg.photo_url,
      idCardType:   reg.id_card_type,
      idCardNumber: reg.id_card_number,
      nextOfKin: {
        name:         reg.nok_name,
        relationship: reg.nok_relationship,
        phone:        reg.nok_phone,
        email:        reg.nok_email,
      },
      emergency: {
        name:         reg.ec_name,
        phone:        reg.ec_phone,
        relationship: reg.ec_relationship,
      },
    },
  }
}
