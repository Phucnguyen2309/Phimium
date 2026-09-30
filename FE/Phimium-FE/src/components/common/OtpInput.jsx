import { useEffect, useRef } from 'react'

import { useLanguage } from '@/context/languageContext.js'

const onlyDigits = (value) => value.replace(/\D/g, '')

// Ô trống được giữ chỗ bằng dấu cách để các số không bị dồn vị trí
const toValue = (digits) => digits.map((digit) => digit || ' ').join('').trimEnd()

/**
 * Ô nhập mã OTP gồm nhiều ô số. Hỗ trợ tự nhảy ô, Backspace lùi ô, mũi tên, dán cả mã.
 * value: chuỗi hiện tại (ô trống là dấu cách), onChange(nextValue).
 * Đủ mã khi value khớp /^\d{length}$/
 * shakeKey: đổi giá trị để ô rung lên (VD khi nhập sai)
 */
export function OtpInput({
  value = '',
  onChange,
  length = 6,
  disabled = false,
  hasError = false,
  shakeKey = 0,
  autoFocus = false,
}) {
  const { t } = useLanguage()
  const inputsRef = useRef([])
  const digits = Array.from({ length }, (_, index) => (value[index] ?? '').trim())

  const focusAt = (index) => {
    const target = inputsRef.current[Math.max(0, Math.min(index, length - 1))]

    target?.focus()
    target?.select()
  }

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus()
  }, [autoFocus])

  // Sau khi bị xoá mã (nhập sai / hết hạn) thì đưa con trỏ về ô đầu
  useEffect(() => {
    if (shakeKey > 0) inputsRef.current[0]?.focus()
  }, [shakeKey])

  const setDigits = (startIndex, text) => {
    const next = digits.slice()
    const chars = onlyDigits(text).slice(0, length - startIndex).split('')

    chars.forEach((char, offset) => {
      next[startIndex + offset] = char
    })

    onChange(toValue(next))

    return chars.length
  }

  const handleChange = (index, event) => {
    let text = event.target.value

    // Ô đã có số mà con trỏ không bôi đen -> chỉ lấy số vừa gõ thêm
    if (digits[index] && text.length === 2) {
      text = text.startsWith(digits[index]) ? text.slice(1) : text.slice(0, 1)
    }

    const written = setDigits(index, text)

    if (written > 0) focusAt(index + written)
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault()

      const next = digits.slice()

      if (next[index]) {
        next[index] = ''
        onChange(toValue(next))
      } else if (index > 0) {
        next[index - 1] = ''
        onChange(toValue(next))
        focusAt(index - 1)
      }
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAt(index - 1)
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  const handlePaste = (index, event) => {
    event.preventDefault()

    const written = setDigits(index, event.clipboardData.getData('text'))

    focusAt(index + written)
  }

  return (
    <div
      key={shakeKey}
      role="group"
      aria-label={t('otp.groupLabel')}
      className={`flex justify-center gap-2 sm:gap-3 ${shakeKey > 0 ? 'animate-shake' : ''}`}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={digit}
          disabled={disabled}
          aria-label={t('otp.digitLabel', { index: index + 1, total: length })}
          aria-invalid={hasError}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={`h-14 w-11 rounded-xl border-2 bg-white text-center font-display text-2xl font-bold text-blue-950 caret-yellow-500 outline-none transition duration-200 focus:-translate-y-0.5 focus:border-yellow-400 focus:shadow-[0_10px_24px_-12px_rgba(253,199,0,0.9)] focus:ring-4 focus:ring-yellow-400/25 disabled:cursor-not-allowed disabled:opacity-60 sm:h-16 sm:w-13 ${
            hasError
              ? 'border-red-300 bg-red-50/60'
              : digit
                ? 'border-blue-950'
                : 'border-slate-200 hover:border-slate-300'
          }`}
        />
      ))}
    </div>
  )
}
