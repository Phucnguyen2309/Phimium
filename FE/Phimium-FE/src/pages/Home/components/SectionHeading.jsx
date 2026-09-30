/**
 * Tiêu đề section trang chủ: nhãn nhỏ có gạch vàng + tiêu đề serif + mô tả.
 * align: 'center' | 'left' ; tone: 'dark' (nền sáng) | 'light' (nền navy)
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  tone = 'dark',
  className = '',
}) {
  const isCenter = align === 'center'
  const isLight = tone === 'light'

  return (
    <div className={`${isCenter ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      {eyebrow && (
        <p
          className={`inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] ${
            isLight ? 'text-yellow-400' : 'text-blue-700'
          }`}
        >
          <span className="line-grow h-px w-8 origin-right bg-yellow-400" />
          {eyebrow}
          {isCenter && <span className="line-grow h-px w-8 origin-left bg-yellow-400" />}
        </p>
      )}

      <h2
        className={`mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-[2.6rem] ${
          isLight ? 'text-white' : 'text-blue-950'
        }`}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-4 text-[15px] leading-7 ${
            isLight ? 'text-blue-100/90' : 'text-slate-600'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
