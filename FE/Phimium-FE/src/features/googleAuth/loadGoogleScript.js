const SCRIPT_ID = 'google-identity-services'

let currentLang = null
let scriptPromise = null

/**
 * Tải thư viện Google Identity Services theo ngôn ngữ (vi, en).
 * Nếu ngôn ngữ thay đổi, tải lại script với ?hl=${lang} để nút Google cập nhật đúng ngôn ngữ.
 */
export const loadGoogleScript = (lang = 'vi') => {
  if (currentLang === lang && window.google?.accounts?.id) {
    return Promise.resolve(window.google)
  }

  if (currentLang === lang && scriptPromise) {
    return scriptPromise
  }

  currentLang = lang

  // Dọn dẹp script và phiên Google cũ nếu có
  try {
    window.google?.accounts?.id?.cancel?.()
  } catch {
    // Bỏ qua lỗi nếu Google chưa khởi tạo
  }

  const existingScript = document.getElementById(SCRIPT_ID)
  if (existingScript) {
    existingScript.remove()
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://accounts.google.com/gsi/client?hl=${lang}`
    script.async = true
    script.defer = true
    script.onload = () => {
      resolve(window.google)
    }
    script.onerror = () => {
      scriptPromise = null
      currentLang = null
      reject(new Error('Cannot load Google Identity Services'))
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}
