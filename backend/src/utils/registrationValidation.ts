import { ApiError } from './ApiError';

const ID_CARD_TYPES = ['Ghana Card', 'Voter ID', 'Passport', "Driver's Licence", 'Other'] as const;
const RELATIONSHIPS = [
  'Mother', 'Father', 'Spouse', 'Sister', 'Brother', 'Daughter', 'Son',
  'Guardian', 'Relative', 'Friend', 'Employer', 'Other',
] as const;

export function normalizeGhanaPhone(value: string, field = 'phone'): string {
  if (!/^[\d ]+$/.test(value)) throw new ApiError(400, 'INVALID_INPUT', `${field} must contain numbers only.`);
  const digits = value.replace(/\D/g, '');
  if (!/^0\d{9}$/.test(digits)) {
    throw new ApiError(400, 'INVALID_INPUT', `${field} must be a 10-digit Ghana phone number beginning with 0.`);
  }
  return digits;
}

export function assertRelationship(value: string, field: string): void {
  if (!(RELATIONSHIPS as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `${field} must be one of: ${RELATIONSHIPS.join(', ')}.`);
  }
}

export function assertIdentity(type?: string, number?: string): void {
  if (!type && !number) return;
  if (!type || !(ID_CARD_TYPES as readonly string[]).includes(type)) {
    throw new ApiError(400, 'INVALID_INPUT', `idCardType must be one of: ${ID_CARD_TYPES.join(', ')}.`);
  }
  if (!number) throw new ApiError(400, 'INVALID_INPUT', 'idCardNumber is required when idCardType is selected.');
  const valid = type === 'Ghana Card' ? /^GHA-\d{9}-\d$/.test(number)
    : type === 'Voter ID' ? /^\d{10}$/.test(number)
      : type === 'Passport' ? /^[A-Z0-9]{8,9}$/.test(number)
        : type === "Driver's Licence" ? /^[A-Z0-9-]{5,20}$/.test(number)
          : number.trim().length >= 3;
  if (!valid) throw new ApiError(400, 'INVALID_INPUT', `idCardNumber is not valid for ${type}.`);
}
