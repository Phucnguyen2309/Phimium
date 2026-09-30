/** Hộp thông báo trong form đăng nhập / đăng ký. tone: 'error' | 'success' | 'info' */
export function AuthAlert({ tone = 'error', children }) {
  const TONE_CLASSES = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    error: 'border-red-200 bg-red-50 text-red-600',
  }
  const toneClass = TONE_CLASSES[tone] ?? TONE_CLASSES.error

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex animate-fade-up items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${toneClass}`}
    >
      <span aria-hidden="true">{tone === 'success' ? '✓' : tone === 'info' ? 'i' : '!'}</span>
      <span>{children}</span>
    </div>
  )
}
