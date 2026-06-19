import http from '@/services/http.js'

export async function loginUser(email, password) {
  try {
    const response = await http.post('/auth/login', {
      email,
      password,
    })

    return response.data
  } catch (error) {
    throw error.response?.data || 'Đăng nhập thất bại. Kiểm tra lại thông tin.'
  }
}

export async function registerUser(userData) {
  try {
    const response = await http.post('/auth/register', userData)

    return response.data
  } catch (error) {
    throw error.response?.data || 'Đăng ký thất bại. Vui lòng thử lại.'
  }
}
