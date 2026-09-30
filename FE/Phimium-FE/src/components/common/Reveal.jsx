import { useInView } from '@/hooks/useInView.js'

/** Bọc nội dung để hiện dần (fade + trượt lên) khi cuộn tới. delay tính bằng ms. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
  const [ref, inView] = useInView()

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  )
}
