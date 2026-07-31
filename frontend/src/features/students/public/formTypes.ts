import type { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import type { PublicRegistrationValues } from './registrationSchema'

export interface PublicFormSectionProps {
  register:  UseFormRegister<PublicRegistrationValues>
  control:   Control<PublicRegistrationValues>
  errors:    FieldErrors<PublicRegistrationValues>
  watch:     UseFormWatch<PublicRegistrationValues>
  setValue:  UseFormSetValue<PublicRegistrationValues>
}
