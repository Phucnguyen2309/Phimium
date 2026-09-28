const INVALID_TEXT = ['', 'string', '.', '-']

/** Trả về text hợp lệ, nếu rỗng / giá trị mẫu thì trả fallback. */
export const getValidText = (value, fallback = '') => {
  const text = String(value ?? '').trim()
  return INVALID_TEXT.includes(text) ? fallback : text
}

/** "Nguyễn Văn An" -> "NA" */
export const getInitials = (name, fallback = 'U') => {
  const cleanName = getValidText(name)

  if (!cleanName) return fallback

  const words = cleanName.split(/\s+/)

  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  }

  return cleanName.charAt(0).toUpperCase()
}
