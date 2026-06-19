import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/routes/paths.js'
import { registerUser } from '@/services/authService.js'

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    birthdate: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await registerUser(formData)
      alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
      navigate(ROUTES.login)
    } catch (err) {
      setError(
        err.message ||
          err.data?.message ||
          'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <div className="relative hidden flex-col justify-between border-r border-gray-100 bg-blue-50 p-12 lg:flex lg:w-1/2">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Phimium</h1>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="mb-6 text-5xl leading-tight font-bold text-slate-900">
            Discover the world with a Buddy.
          </h2>
          <p className="mb-8 text-lg text-slate-600">
            Join our community of explorers and experience local life like never
            before. Real connections, real adventures.
          </p>

          <div className="space-y-4">
            <div className="flex w-max items-center rounded-xl bg-white p-4 shadow-sm">
              <span className="mr-3 text-blue-500">✓</span>
              <span className="font-medium text-slate-700">
                Verified Safety Protocols
              </span>
            </div>
            <div className="flex w-max items-center rounded-xl bg-white p-4 shadow-sm">
              <span className="mr-3 text-blue-500">12k+</span>
              <span className="font-medium text-slate-700">
                Active Buddies
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          © 2026 Phimium. Connecting people through real-world discovery.
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-10" />
      </div>

      <div className="flex w-full flex-col justify-center px-8 sm:px-16 md:px-24 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900">
              Create your account
            </h2>
            <p className="mt-2 text-slate-500">
              Fill in your basic information to get started.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mật khẩu >= 8 ký tự, gồm số và ký tự đặc biệt"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Birth Date
                </label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-600 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to={ROUTES.login}
              className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
