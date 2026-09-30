/**
 * Đọc phần payload (claims) của JWT ở phía client để lấy thông tin hiển thị
 * (userId, username, role, buddyId). KHÔNG dùng để xác thực: việc kiểm tra
 * chữ ký luôn do Backend làm.
 */
export const decodeJwtPayload = (token) => {
  try {
    const payload = String(token ?? '').split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))

    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}
