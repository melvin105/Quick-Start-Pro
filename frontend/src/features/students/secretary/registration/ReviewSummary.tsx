import type { DetailsFormValues } from './schema'

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <p className="text-[13.5px]">
      <span className="text-gray-500">{label}:</span>{' '}
      <span className="text-gray-900">{value && value.trim() !== '' ? value : '—'}</span>
    </p>
  )
}

export default function ReviewSummary({ values }: { values: DetailsFormValues }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-5">
      <div>
        <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Personal &amp; Identity</h2>
        {values.passportPhoto && (
          <img
            src={values.passportPhoto}
            alt="Passport preview"
            className="w-16 h-16 rounded-full object-cover border border-gray-200 mb-3"
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
          <Row label="Name" value={`${values.firstName} ${values.lastName}`} />
          <Row label="Gender" value={values.gender} />
          <Row label="Date of Birth" value={values.dob} />
          <Row label="Phone" value={values.phone} />
          <Row label="Email" value={values.email} />
          <Row label="Address" value={values.address} />
          <Row label="ID Type" value={values.idCardType} />
          <Row label="Identity Number" value={values.idCardNumber} />
        </div>
      </div>

      <div>
        <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Next of Kin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
          <Row label="Name" value={values.nokName} />
          <Row label="Relationship" value={values.nokRelationship} />
          <Row label="Phone" value={values.nokPhone} />
          <Row label="Email" value={values.nokEmail} />
        </div>
      </div>

      <div>
        <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Emergency Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
          <Row label="Name" value={values.ecName} />
          <Row label="Relationship" value={values.ecRelationship} />
          <Row label="Phone" value={values.ecPhone} />
        </div>
      </div>

      <div>
        <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Enrolment</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
          <Row label="Package" value={values.programme} />
        </div>
        {values.notes && (
          <p className="text-[13px] text-gray-600 mt-2">
            <span className="text-gray-500">Notes:</span> {values.notes}
          </p>
        )}
      </div>
    </div>
  )
}
