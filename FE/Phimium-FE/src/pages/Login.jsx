import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { getDefaultRouteByRole, ROUTES } from '@/routes/paths.js'
import { loginUser } from '@/services/authService.js'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const fromPath = location.state?.from || ROUTES.home

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const responseData = await loginUser(email, password)
      login(responseData)
      const payload = responseData?.data ?? responseData
      const defaultPath = getDefaultRouteByRole(
        payload?.role ?? payload?.authorities?.[0],
      )
      navigate(fromPath === ROUTES.home ? defaultPath : fromPath, {
        replace: true,
      })
    } catch (err) {
      setError(
        err.message ||
          err.data?.message ||
          'Sai email hoặc mật khẩu. Vui lòng thử lại.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600">Phimium</h1>
        <p className="mt-2 text-sm text-slate-500">
          Connecting people through real-world discovery.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="mt-1 text-sm text-slate-500">
            Please enter your details to sign in
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="alex@example.com"
                className="w-full rounded-lg border border-slate-200 py-2.5 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <a
                href="#"
                className="text-xs font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 py-2.5 pr-10 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none disabled:opacity-70"
          >
            {isLoading ? 'Processing...' : 'Login'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link
            to={ROUTES.register}
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
