export default function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-3 py-1.5">
      <span className="text-[12.5px] text-gray-500">{label}</span>
      <span className="text-[13px] text-gray-900 text-right">{value && value.trim() !== '' ? value : '—'}</span>
    </div>
  )
}
