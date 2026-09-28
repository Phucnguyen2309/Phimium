import { useId, useState } from 'react'

import { useLanguage } from '@/context/languageContext.js'

const ICON_PATHS = {
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0',
  mail: 'M3 7l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  lock: 'M8 11V7a4 4 0 118 0v4M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z',
  phone: 'M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2',
  calendar: 'M8 3v4m8-4v4M4 10h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z',
  eyeOff: 'M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.2M6.6 6.6C3.9 8.3 2 12 2 12s3.5 7 10 7a9.7 9.7 0 004.3-1',
}

function FieldIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  )
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 pl-11 pr-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-900/10'

/**
 * Ô nhập liệu có label + icon. Các props còn lại (name, value, onChange, required…)
 * được truyền thẳng xuống <input>.
 * icon: 'user' | 'mail' | 'lock' | 'phone' | 'calendar'
 */
export function FormField({ label, icon, hint, labelAction, className = '', ...inputProps }) {
  const id = useId()

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <FieldIcon name={icon} />
          </span>
        )}
        <input id={id} className={inputClass} {...inputProps} />
      </div>

      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

/** Ô mật khẩu có nút hiện / ẩn (tự giữ trạng thái hiển thị). */
export function PasswordField({ label, hint, labelAction, className = '', ...inputProps }) {
  const id = useId()
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          <FieldIcon name="lock" />
        </span>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`${inputClass} pr-11`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition hover:text-blue-900"
        >
          <FieldIcon name={visible ? 'eyeOff' : 'eye'} />
        </button>
      </div>

      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
