import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import useStudentsStore from '../students/store'
import usePaymentsStore from './store'
import { formatGHS, todayIso } from './utils'
import type { PaymentMethod, PaymentRecord } from './types'

interface RecordPaymentModalProps {
  onClose: () => void
  onRecorded: (record: PaymentRecord) => void
}

export default function RecordPaymentModal({ onClose, onRecorded }: RecordPaymentModalProps) {
  const students = useStudentsStore((s) => s.students)
  const recordPayment = usePaymentsStore((s) => s.recordPayment)
  const nextReceiptNo = usePaymentsStore((s) => s.nextReceiptNo)

  const [query, setQuery] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('Cash')
  const [date, setDate] = useState(todayIso())
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return []
    return students.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)).slice(0, 6)
  }, [students, query])

  const selectedStudent = selectedStudentId ? students.find((s) => s.id === selectedStudentId) : undefined
  const packageFee = selectedStudent?.packageFee ?? 0
  const currentBalance = selectedStudent?.balance ?? 0
  const totalPaidSoFar = packageFee - currentBalance
  const amountNumber = Number(amount) || 0
  const remainingAfter = Math.max(currentBalance - amountNumber, 0)
  const receiptPreview = nextReceiptNo()

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id)
    setQuery('')
    setAmount('')
    setError('')
  }

  const handleSubmit = () => {
    if (!selectedStudent) return
    if (amountNumber <= 0) { setError('Enter an amount greater than zero'); return }
    if (amountNumber > currentBalance) { setError('Amount cannot exceed the outstanding balance'); return }

    const record = recordPayment({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      programme: selectedStudent.programme,
      amount: amountNumber,
      method,
      date,
      notes: notes || undefined,
      recordedBy: 'Mercy Osei',
      packageFee,
      currentBalance,
    })
    onRecorded(record)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full max-h-[90vh] overflow-y-auto scrollbar-hide p-5">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Record Payment</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
              Student <span className="text-danger">*</span>
            </label>
            {selectedStudent ? (
              <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                <span className="text-[13.5px] font-medium text-gray-900">{selectedStudent.name}</span>
                <button type="button" onClick={() => setSelectedStudentId(null)} className="text-[12px] text-brand-600 hover:text-brand-700">
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search student name..."
                  className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                />
                {results.length > 0 && (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {results.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectStudent(s.id)}
                        className="w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <p className="text-[11px] text-gray-500">{s.id}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedStudent && (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Balance</p>
                <div className="flex flex-col gap-1 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Package</span>
                    <span className="text-gray-900">{selectedStudent.programme ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Package Fee</span>
                    <span className="text-gray-900">{formatGHS(packageFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Paid</span>
                    <span className="text-success">{formatGHS(totalPaidSoFar)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-warning">Outstanding</span>
                    <span className="text-warning">{formatGHS(currentBalance)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
                  Amount <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError('') }}
                  placeholder="GHS 0"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                    error ? 'border-danger focus:ring-danger/20' : 'border-gray-200 focus:ring-brand-600/20 focus:border-brand-600'
                  }`}
                />
                {error ? (
                  <p className="text-[12px] text-danger mt-1">{error}</p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">Cannot exceed outstanding balance</p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
                  Payment Method <span className="text-danger">*</span>
                </label>
                <div className="flex gap-4">
                  {(['Cash', 'MoMo'] as const).map((m) => (
                    <label key={m} className="flex items-center gap-1.5 text-[13.5px] text-gray-800 cursor-pointer">
                      <input type="radio" checked={method === m} onChange={() => setMethod(m)} className="accent-brand-600" />
                      {m}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
                  Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                />
              </div>

              <div className="bg-brand-50 border border-brand-100 rounded-lg p-3.5">
                <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide mb-2">After This Payment</p>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-600">New Balance</span>
                  <span className="font-semibold text-gray-900">{formatGHS(remainingAfter)}</span>
                </div>
                <div className="flex justify-between text-[13px] mt-1">
                  <span className="text-gray-600">Receipt No.</span>
                  <span className="font-semibold text-gray-900">{receiptPreview}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedStudent}
            onClick={handleSubmit}
            className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Record Payment
          </button>
        </div>
      </div>
    </div>
  )
}
