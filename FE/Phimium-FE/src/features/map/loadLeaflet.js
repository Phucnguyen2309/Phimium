import { LEAFLET_CDN } from '@/constants/map.js'

let leafletPromise = null

const appendOnce = (selector, create) => {
  const existing = document.querySelector(selector)
  if (existing) return existing

  const element = create()
  document.head.appendChild(element)

  return element
}

/**
 * Nạp Leaflet (CSS + JS) từ CDN đúng 1 lần, trả về window.L.
 * Lỗi mạng thì cho phép thử lại ở lần gọi sau.
 */
export const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise

  appendOnce('link[data-leaflet]', () => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = LEAFLET_CDN.style
    link.integrity = LEAFLET_CDN.styleIntegrity
    link.crossOrigin = ''
    link.dataset.leaflet = 'true'
    return link
  })

  leafletPromise = new Promise((resolve, reject) => {
    const script = appendOnce('script[data-leaflet]', () => {
      const element = document.createElement('script')
      element.src = LEAFLET_CDN.script
      element.integrity = LEAFLET_CDN.scriptIntegrity
      element.crossOrigin = ''
      element.async = true
      element.dataset.leaflet = 'true'
      return element
    })

    script.addEventListener('load', () => {
      if (window.L) resolve(window.L)
      else reject(new Error('Leaflet not available'))
    })
    script.addEventListener('error', () => {
      script.remove()
      reject(new Error('Leaflet failed to load'))
    })
  }).catch((error) => {
    leafletPromise = null
    throw error
  })

  return leafletPromise
}
