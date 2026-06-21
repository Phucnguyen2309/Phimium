import { HomeView } from './Home/HomeView.jsx'
import { useHome } from './Home/useHome.js'

const HomePage = () => {
  const home = useHome()

  return <HomeView {...home} />
}

export default HomePage
