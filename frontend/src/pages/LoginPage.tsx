import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ChevronDown, Loader2, Car } from 'lucide-react'
import { useLogin } from '../features/auth/useLogin'
import { ROLE_OPTIONS } from '../lib/constants'
import type { Role } from '../lib/constants'

const LOGIN_ROLE_OPTIONS = ROLE_OPTIONS.filter(
  (opt) => opt.value === 'admin' || opt.value === 'secretary',
)

// ─── Schema ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  role:     z.enum(['admin', 'secretary'], {
    error: 'Please select a role',
  }),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

// ─── Role Select ──────────────────────────────────────────────────────────────
interface RoleSelectProps {
  value:    Role | ''
  onChange: (v: Role) => void
  disabled: boolean
  error?:   string
}

function RoleSelect({ value, onChange, disabled, error }: RoleSelectProps) {
  const [open, setOpen] = useState(false)
  const selected = LOGIN_ROLE_OPTIONS.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-lg bg-white text-sm transition-colors disabled:opacity-50
          focus:outline-none focus:ring-2 focus:ring-brand-600/20
          ${error ? 'border-danger focus:border-danger' : 'border-gray-200 hover:border-brand-600 focus:border-brand-600'}`}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
          {selected ? selected.label : 'Select your role'}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-card overflow-hidden">
            {LOGIN_ROLE_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-brand-50 transition-colors
                    ${opt.value === value ? 'text-brand-600 font-medium bg-brand-50' : 'text-gray-800'}`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ─── Password Input ───────────────────────────────────────────────────────────
interface PasswordInputProps {
  value:    string
  onChange: (v: string) => void
  disabled: boolean
  error?:   string
}

function PasswordInput({ value, onChange, disabled, error }: PasswordInputProps) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter your password"
        className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 transition-colors disabled:opacity-50
          focus:outline-none focus:ring-2 focus:ring-brand-600/20
          ${error ? 'border-danger focus:border-danger' : 'border-gray-200 focus:border-brand-600'}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((p) => !p)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

// ─── Field Error ──────────────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-[12px] text-danger mt-1">{message}</p>
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ compact = false }: { compact?: boolean }) {
  const { handleLogin, isLoading, error: serverError } = useLogin()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: undefined, password: '' },
  })

  const onSubmit = (values: LoginFormValues) => {
    void handleLogin({
      role:     values.role,
      password: values.password,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {/* Header */}
      <div className={compact ? 'mb-1' : 'mb-2'}>
        <h1 className={`font-semibold text-gray-900 ${compact ? 'text-xl' : 'text-2xl'}`}>
          Sign in
        </h1>
        <p className={`text-gray-600 mt-1 ${compact ? 'text-[13px]' : 'text-sm'}`}>
          {compact
            ? 'Welcome back to Quick Start Pro.'
            : 'Welcome back — enter your details to continue.'}
        </p>
      </div>

      {/* Server error banner */}
      {serverError && (
        <div className="px-3 py-2.5 bg-danger-bg border border-danger/20 rounded-lg text-danger text-sm">
          {serverError}
        </div>
      )}

      {/* Role */}
      <div>
        <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Role</label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <RoleSelect
              value={field.value ?? ''}
              onChange={field.onChange}
              disabled={isLoading}
              error={errors.role?.message}
            />
          )}
        />
        <FieldError message={errors.role?.message} />
      </div>

      {/* Password */}
      <div>
        <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Password</label>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordInput
              value={field.value}
              onChange={field.onChange}
              disabled={isLoading}
              error={errors.password?.message}
            />
          )}
        />
        <FieldError message={errors.password?.message} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[14.5px] rounded-lg transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <p className="text-center text-[11.5px] text-gray-500 mt-1">
        Trouble signing in? Contact your administrator.
      </p>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">

      {/* Desktop (md+) */}
      <div className="hidden md:grid grid-cols-2 w-full max-w-[960px] min-h-[600px] bg-white rounded-2xl shadow-modal overflow-hidden">
        <div
          className="flex flex-col justify-between p-11 text-white"
          style={{ background: 'linear-gradient(155deg, #12294F 0%, #1B3A6B 55%, #1B3A6B 100%)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Car size={20} className="text-white" />
            </div>
            <span className="text-base font-semibold text-white">Quick Start Pro</span>
          </div>

          <p className="text-[14.5px] leading-relaxed text-white/80 max-w-[280px]">
            Everything your driving school needs — students, scheduling,
            payments and reports — in one place.
          </p>

          <p className="text-xs text-white/45">© 2026 Quick Start Driving School</p>
        </div>

        <div className="flex flex-col justify-center px-14 py-12">
          <LoginForm />
        </div>
      </div>

      {/* Mobile (< md) */}
      <div className="md:hidden w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-card">
        <div
          className="flex flex-col items-center gap-2.5 px-6 pt-10 pb-7"
          style={{ background: 'linear-gradient(155deg, #12294F, #1B3A6B)' }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
            <Car size={24} className="text-white" />
          </div>
          <span className="text-[17px] font-semibold text-white">Quick Start Pro</span>
        </div>

        <div className="px-6 py-7">
          <LoginForm compact />
        </div>
      </div>

    </div>
  )
}