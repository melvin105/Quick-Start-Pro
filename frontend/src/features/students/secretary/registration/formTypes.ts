import type { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import type { DetailsFormValues } from './schema'

export interface FormSectionProps {
  register:  UseFormRegister<DetailsFormValues>
  control:   Control<DetailsFormValues>
  errors:    FieldErrors<DetailsFormValues>
  watch:     UseFormWatch<DetailsFormValues>
  setValue:  UseFormSetValue<DetailsFormValues>
}
