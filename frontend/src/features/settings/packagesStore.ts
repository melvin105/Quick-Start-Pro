import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CoursePackage } from './types'
import { PACKAGES } from './mockData'

interface PackageInput {
  name:    string
  lessons: number
  price:   number
  status:  'active' | 'inactive'
}

interface PackagesState {
  packages: CoursePackage[]
  addPackage:    (input: PackageInput) => void
  updatePackage: (id: string, input: PackageInput) => void
}

const usePackagesStore = create<PackagesState>()(
  persist(
    (set) => ({
      packages: PACKAGES,

      addPackage: (input) => set((state) => ({
        packages: [...state.packages, { id: `pkg-${Date.now()}`, ...input }],
      })),

      updatePackage: (id, input) => set((state) => ({
        packages: state.packages.map((p) => (p.id === id ? { ...p, ...input } : p)),
      })),
    }),
    { name: 'qsp-packages' },
  ),
)

export default usePackagesStore
