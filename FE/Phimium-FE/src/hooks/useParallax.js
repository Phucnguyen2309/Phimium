import { useEffect, useRef } from 'react'

/**
 * Dịch chuyển phần tử theo tốc độ cuộn (hiệu ứng parallax).
 * speed: 0.2 = phần tử trôi chậm hơn trang 20%. Tự tắt khi người dùng bật "reduce motion".
 */
export function useParallax(speed = 0.2) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let frame = 0

    const update = () => {
      frame = 0
      node.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`
    }

    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [speed])

  return ref
}
