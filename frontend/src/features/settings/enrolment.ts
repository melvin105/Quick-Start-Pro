import type { EnrolmentType } from '../students/shared/types'

const KNOWN_ENROLMENTS: EnrolmentType[] = ['Driving Only', 'Licence Only', 'Driving + Licence']

// Packages are just free-form name + price now (see PackageModal) — the rest
// of the app still needs a Driving Only / Licence Only / Driving + Licence
// bucket (licence-progress eligibility, student filters), so it's derived
// from the package name rather than picked separately. Exact matches cover
// the default packages; anything else falls back to a best-effort keyword
// match, defaulting to the safest option (includes licence tracking).
export function deriveEnrolment(packageName: string): EnrolmentType {
  const exact = KNOWN_ENROLMENTS.find((e) => e === packageName)
  if (exact) return exact

  const hasDriving = /driving/i.test(packageName)
  const hasLicence = /licen[cs]e/i.test(packageName)
  if (hasDriving && !hasLicence) return 'Driving Only'
  if (hasLicence && !hasDriving) return 'Licence Only'
  return 'Driving + Licence'
}
