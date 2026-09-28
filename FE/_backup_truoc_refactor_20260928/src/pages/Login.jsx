import { LoginView } from './Login/LoginView.jsx'
import { useLogin } from './Login/useLogin.js'

const Login = () => {
  const login = useLogin()

  return <LoginView {...login} />
}

export default Login
