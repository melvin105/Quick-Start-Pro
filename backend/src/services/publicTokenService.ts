import jwt, { JwtPayload } from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';

type PublicPurpose = 'registration';

interface PublicTokenPayload extends JwtPayload {
  purpose: PublicPurpose;
  phone?: string;
}

function secret(): string {
  const value = process.env.PUBLIC_FLOW_SECRET ?? process.env.JWT_SECRET;
  if (!value) throw new Error('PUBLIC_FLOW_SECRET or JWT_SECRET must be configured.');
  return value;
}

function normalizedPhone(value?: string): string | undefined {
  const digits = value?.replace(/\D/g, '');
  return digits || undefined;
}

function verify(token: unknown, purpose: PublicPurpose): PublicTokenPayload {
  if (typeof token !== 'string' || !token) {
    throw new ApiError(403, 'INVALID_PUBLIC_TOKEN', 'This link is missing or invalid.');
  }
  try {
    const payload = jwt.verify(token, secret()) as PublicTokenPayload;
    if (payload.purpose !== purpose) throw new Error('Wrong token purpose');
    return payload;
  } catch {
    throw new ApiError(403, 'INVALID_PUBLIC_TOKEN', 'This link is invalid or has expired.');
  }
}

export function createRegistrationToken(phone?: string) {
  const expiresInSeconds = 24 * 60 * 60;
  const token = jwt.sign(
    { purpose: 'registration', phone: normalizedPhone(phone) },
    secret(),
    { expiresIn: expiresInSeconds },
  );
  return { token, expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString() };
}

export function assertRegistrationToken(token: unknown, submittedPhone: string): void {
  const payload = verify(token, 'registration');
  const expectedPhone = normalizedPhone(payload.phone);
  if (expectedPhone && expectedPhone !== normalizedPhone(submittedPhone)) {
    throw new ApiError(400, 'PHONE_MISMATCH', 'Use the phone number this registration link was created for.');
  }
}
