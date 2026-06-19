import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { USER_ROLES } from '@/constants/app.js'
import { MainLayout } from '@/layouts/MainLayout.jsx'
import ActivityDetailPage from '@/pages/ActivityDetailPage.jsx'
import ActivityGuidelinePage from '@/pages/ActivityGuidelinePage.jsx'
import AdminPage from '@/pages/AdminPage.jsx'
import BuddyPage from '@/pages/BuddyPage.jsx'
import ForbiddenPage from '@/pages/ForbiddenPage.jsx'
import HomePage from '@/pages/HomePage.jsx'
import Login from '@/pages/Login.jsx'
import MyActivitiesPage from '@/pages/MyActivitiesPage.jsx'
import Register from '@/pages/Register.jsx'
import { ProtectedRoute } from '@/routes/ProtectedRoute.jsx'
import { ROUTES } from '@/routes/paths.js'

const withMainLayout = (page) => <MainLayout>{page}</MainLayout>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.register} element={<Register />} />
        <Route path={ROUTES.home} element={withMainLayout(<HomePage />)} />
        <Route
          path={ROUTES.activityDetail}
          element={withMainLayout(<ActivityDetailPage />)}
        />
        <Route
          path={ROUTES.activityGuidelines}
          element={withMainLayout(<ActivityGuidelinePage />)}
        />
        <Route
          path={ROUTES.myActivities}
          element={
            <ProtectedRoute>
              {withMainLayout(<MyActivitiesPage />)}
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.buddy}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.buddy]}>
              {withMainLayout(<BuddyPage />)}
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.admin}
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.admin]}>
              {withMainLayout(<AdminPage />)}
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.forbidden}
          element={withMainLayout(<ForbiddenPage />)}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
