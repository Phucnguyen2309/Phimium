/**
 * Helpers đọc dữ liệu trả về từ API (axios response).
 * BE có thể trả { data: [...] }, { data: { data: [...] } } hoặc Spring Data Page { data: { data: { content: [...] } } }.
 */
export const safeList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.content)) return value.content
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.data)) return value.data
  return []
}

export const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null

export const getResponseList = (response) => {
  const root = response?.data?.data ?? response?.data ?? response
  return safeList(root)
}

/**
 * Trích xuất lỗi chi tiết từ response Backend:
 * - MethodArgumentNotValidException: data = { [field]: "Thông báo lỗi" }
 * - AppException: message = "Mã giảm giá đã tồn tại", v.v.
 */
export const getErrorMessage = (error, fallbackMessage = 'Có lỗi xảy ra. Vui lòng thử lại.') => {
  if (!error) return fallbackMessage

  const resData = error?.response?.data

  // 1. Map lỗi validation từng trường từ BE (MethodArgumentNotValidException)
  if (resData?.data && typeof resData.data === 'object' && !Array.isArray(resData.data)) {
    const errorEntries = Object.entries(resData.data)
    if (errorEntries.length > 0) {
      return errorEntries.map(([, msg]) => msg).filter(Boolean).join('. ')
    }
  }

  // 2. Thông báo nghiệp vụ từ BE (AppException)
  if (resData?.message && resData.message !== 'Validation failed') {
    return resData.message
  }

  if (resData?.message === 'Validation failed') {
    return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường thông tin.'
  }

  return error?.message || fallbackMessage
}

/**
 * Trích xuất object chứa lỗi của từng trường: { [fieldName]: "Lỗi cụ thể" }
 */
export const getFieldErrors = (error) => {
  const resData = error?.response?.data
  if (resData?.data && typeof resData.data === 'object' && !Array.isArray(resData.data)) {
    return resData.data
  }
  return {}
}

