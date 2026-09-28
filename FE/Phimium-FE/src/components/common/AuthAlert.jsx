/** Hộp thông báo trong form đăng nhập / đăng ký. tone: 'error' | 'success' */
export function AuthAlert({ tone = 'error', children }) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-red-200 bg-red-50 text-red-600'

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${toneClass}`}
    >
      <span aria-hidden="true">{tone === 'success' ? '✓' : '!'}</span>
      <span>{children}</span>
    </div>
  )
}
