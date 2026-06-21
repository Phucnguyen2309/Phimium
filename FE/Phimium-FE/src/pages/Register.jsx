import { RegisterView } from './Register/RegisterView.jsx'
import { useRegister } from './Register/useRegister.js'

const Register = () => {
  const register = useRegister()

  return <RegisterView {...register} />
}

export default Register
