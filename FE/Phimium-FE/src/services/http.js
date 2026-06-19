import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Thêm interceptor để đính kèm token vào mỗi request nếu có
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // Hoặc lấy token từ context/store
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default http
