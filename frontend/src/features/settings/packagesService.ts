import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'

// Packages service — GET /packages is readable by both roles; mutations are
// manager-only and stay in the settings UI. Rows mirror the backend
// driving_packages columns (numeric fee comes over the wire as a string, so the
// mapper coerces it — see packageMappers).
export interface ApiPackage {
  id:             string
  package_name:   string
  duration_weeks: number
  lesson_count:   number
  total_fee:      number | string
  is_active:      boolean
}

// GET /packages — the catalogue. `activeOnly` drops retired packages so the
// register wizard only offers ones a student can still be enrolled on.
export async function listPackages(activeOnly = false): Promise<ApiPackage[]> {
  try {
    const { data } = await api.get<ApiPackage[]>('/packages', {
      params: activeOnly ? { activeOnly: 'true' } : undefined,
    })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export interface SavePackageInput {
  packageName:    string
  totalFee:       number
  lessonCount:    number
  durationWeeks?: number | null
  isActive?:      boolean
}

export async function createPackage(input: SavePackageInput): Promise<ApiPackage> {
  try {
    const { data } = await api.post<ApiPackage>('/packages', input)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function updatePackage(id: string, input: Partial<SavePackageInput>): Promise<ApiPackage> {
  try {
    const { data } = await api.patch<ApiPackage>(`/packages/${id}`, input)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// DELETE /packages/:id — manager-only. The backend refuses (409 CONFLICT) when
// students are enrolled on the package, suggesting deactivation instead; the
// caller surfaces that message.
export async function deletePackage(id: string): Promise<void> {
  try {
    await api.delete(`/packages/${id}`)
  } catch (err) {
    throw toApiError(err)
  }
}
