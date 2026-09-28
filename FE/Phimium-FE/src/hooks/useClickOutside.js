import { useEffect, useRef } from 'react'

/** Gọi onOutside khi click ra ngoài phần tử gắn ref (dùng cho dropdown, menu). */
export function useClickOutside(onOutside) {
  const ref = useRef(null)

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutside()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [onOutside])

  return ref
}
