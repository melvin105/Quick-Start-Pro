import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import usePaymentsStore from '../../payments/store'
import type { DayRecord, ExpenseCategory, ExpenseEntry } from './types'
import { INITIAL_DAYS, INITIAL_EXPENSES } from './mockData'
import { computeDay, nowTime } from './utils'

interface AddExpenseInput {
  date:        string
  description: string
  category:    ExpenseCategory
  amount:      number
  notes?:      string
}

interface RecordsState {
  expenses: ExpenseEntry[]
  days:     DayRecord[]
  nextExpenseId: () => string
  getDay:        (date: string) => DayRecord
  addExpense:    (input: AddExpenseInput) => ExpenseEntry
  updateExpense: (id: string, patch: Partial<Pick<ExpenseEntry, 'description' | 'category' | 'amount' | 'notes'>>) => void
  deleteExpense: (id: string) => void
  submitDay:  (date: string, submittedBy: string) => void
  approveDay: (date: string, reviewedBy: string) => void
  flagDay:    (date: string, reviewedBy: string, note: string) => void
}

// Persisted so a submitted day is still visible to the manager if /records
// is reopened in a new tab or reloaded.
const useRecordsStore = create<RecordsState>()(
  persist(
    (set, get) => ({
      expenses: INITIAL_EXPENSES,
      days: INITIAL_DAYS,

      nextExpenseId: () => {
        const numbers = get()
          .expenses.map((e) => parseInt(e.id.replace('EX-', ''), 10))
          .filter((n) => !Number.isNaN(n))
        const next = (numbers.length ? Math.max(...numbers) : 0) + 1
        return `EX-${String(next).padStart(4, '0')}`
      },

      getDay: (date) => computeDay(date, get().days, get().expenses, usePaymentsStore.getState().records),

      addExpense: (input) => {
        const entry: ExpenseEntry = { id: get().nextExpenseId(), time: nowTime(), ...input }
        set((state) => {
          const dayExists = state.days.some((d) => d.date === input.date)
          const days = dayExists ? state.days : [...state.days, get().getDay(input.date)]
          return { expenses: [entry, ...state.expenses], days }
        })
        return entry
      },

      updateExpense: (id, patch) => set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      })),

      deleteExpense: (id) => set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

      submitDay: (date, submittedBy) => set((state) => {
        const day = get().getDay(date)
        const updated: DayRecord = {
          ...day, status: 'submitted', submittedBy, submittedAt: new Date().toISOString(), flagNote: undefined,
        }
        const exists = state.days.some((d) => d.date === date)
        return { days: exists ? state.days.map((d) => (d.date === date ? updated : d)) : [...state.days, updated] }
      }),

      approveDay: (date, reviewedBy) => set((state) => ({
        days: state.days.map((d) => (
          d.date === date ? { ...d, status: 'approved', reviewedBy, reviewedAt: new Date().toISOString() } : d
        )),
      })),

      flagDay: (date, reviewedBy, note) => set((state) => ({
        days: state.days.map((d) => (
          d.date === date ? { ...d, status: 'flagged', reviewedBy, reviewedAt: new Date().toISOString(), flagNote: note } : d
        )),
      })),
    }),
    { name: 'qsp-records' },
  ),
)

export default useRecordsStore
