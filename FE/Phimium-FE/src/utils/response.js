/**
 * Helpers đọc dữ liệu trả về từ API (axios response).
 * BE có thể trả { data: [...] }, { data: { data: [...] } } hoặc { data: { content: [...] } }.
 */
export const safeList = (value) => (Array.isArray(value) ? value : [])

export const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null

export const getResponseList = (response) =>
  safeList(
    response?.data?.data ??
      response?.data?.content ??
      response?.data ??
      response,
  )
