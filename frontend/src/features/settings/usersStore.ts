import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '../../lib/constants'
import type { UserAccount } from './types'
import { USER_ACCOUNTS } from './mockData'

interface InviteInput {
  name:  string
  email: string
  role:  Role
}

interface UsersState {
  users: UserAccount[]
  inviteUser:  (input: InviteInput) => void
  updateRole:  (id: string, role: Role) => void
  unlockUser:  (id: string) => void
}

const useUsersStore = create<UsersState>()(
  persist(
    (set) => ({
      users: USER_ACCOUNTS,

      inviteUser: (input) => set((state) => ({
        users: [...state.users, { id: `user-${Date.now()}`, ...input, status: 'active' }],
      })),

      updateRole: (id, role) => set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
      })),

      unlockUser: (id) => set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, status: 'active' } : u)),
      })),
    }),
    { name: 'qsp-users' },
  ),
)

export default useUsersStore
