import type { PublicInstructor } from './checkinService'

interface InstructorScreenProps {
  instructors: PublicInstructor[]
  onSelect: (instructor: PublicInstructor) => void
  onSkip: () => void
}

export default function InstructorScreen({ instructors, onSelect, onSkip }: InstructorScreenProps) {
  return (
    <>
      <h1 className="text-[18px] font-semibold text-gray-900">Who was your instructor today?</h1>
      <div className="w-full flex flex-col gap-2.5">
        {instructors.map((ins) => (
          <button
            key={ins.id}
            type="button"
            onClick={() => onSelect(ins)}
            className="w-full h-14 flex items-center justify-center bg-white border-2 border-gray-200 hover:border-brand-600 hover:bg-brand-50 hover:text-brand-600 text-gray-800 font-medium text-[15px] rounded-xl transition-colors"
          >
            {ins.name}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="text-[13px] text-gray-400 hover:text-gray-600 underline underline-offset-2 mt-1"
      >
        Skip — I'm not sure
      </button>
    </>
  )
}
