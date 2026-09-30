const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let scriptPromise = null

/** Tải thư viện Google Identity Services (chỉ tải 1 lần cho cả app). */
export const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve(window.google)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google)
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Cannot load Google Identity Services'))
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}
