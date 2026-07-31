import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StaffMember, StaffRole } from './types'
import { STAFF } from './mockData'

interface AddStaffInput {
  name:  string
  role:  StaffRole
  phone: string
  email?: string
}

interface StaffState {
  staff: StaffMember[]
  addStaff: (input: AddStaffInput) => StaffMember
  removeStaff: (id: string) => void
  updateStaff: (id: string, patch: Partial<Pick<StaffMember, 'name' | 'phone'>>) => void
}

const useStaffStore = create<StaffState>()(
  persist(
    (set) => ({
      staff: STAFF,

      addStaff: (input) => {
        const member: StaffMember = {
          id: `staff-${Date.now()}`,
          name: input.name,
          role: input.role,
          phone: input.phone,
          email: input.email,
          addedDate: new Date().toISOString().slice(0, 10),
        }
        set((state) => ({ staff: [...state.staff, member] }))
        return member
      },

      removeStaff: (id) => set((state) => ({
        staff: state.staff.filter((m) => m.id !== id),
      })),

      updateStaff: (id, patch) => set((state) => ({
        staff: state.staff.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      })),
    }),
    { name: 'qsp-staff' },
  ),
)

export default useStaffStore
