import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { USER_ROLES } from '@/constants/app.js'
import { MainLayout } from '@/layouts/MainLayout.jsx'
import ActivitiesPage from '@/pages/Activities/ActivitiesPage.jsx'
import ActivityDetailPage from '@/pages/ActivityDetail/ActivityDetailPage.jsx'
import ActivityGuidelinePage from '@/pages/ActivityGuideline/ActivityGuidelinePage.jsx'
import AdminPage from '@/pages/Admin/AdminPage.jsx'
import BuddyPage from '@/pages/Buddy/BuddyPage.jsx'
import ForbiddenPage from '@/pages/Forbidden/ForbiddenPage.jsx'
import GroupDetailPage from '@/pages/GroupDetail/GroupDetailPage.jsx'
import HomePage from '@/pages/Home/HomePage.jsx'
import LoginPage from '@/pages/Login/LoginPage.jsx'
import NotFoundPage from '@/pages/NotFound/NotFoundPage.jsx'
import RegisterPage from '@/pages/Register/RegisterPage.jsx'
import UserDashboardPage from '@/pages/UserDashboard/UserDashboardPage.jsx'
import { ProtectedRoute } from '@/routes/ProtectedRoute.jsx'
import { ROUTES } from '@/routes/paths.js'

const withMainLayout = (page) => <MainLayout>{page}</MainLayout>

const withRoles = (roles, page, useMainLayout = true) => (
  <ProtectedRoute allowedRoles={roles}>
    {useMainLayout ? withMainLayout(page) : page}
  </ProtectedRoute>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />

        {/* Public */}
        <Route path={ROUTES.home} element={withMainLayout(<HomePage />)} />
        <Route
          path={ROUTES.activities}
          element={withMainLayout(<ActivitiesPage />)}
        />
        <Route
          path={ROUTES.activityDetail}
          element={withMainLayout(<ActivityDetailPage />)}
        />
        <Route
          path={ROUTES.activityGuidelines}
          element={withMainLayout(<ActivityGuidelinePage />)}
        />

        {/* User */}
        <Route
          path={ROUTES.userDashboard}
          element={withRoles([USER_ROLES.user], <UserDashboardPage />)}
        />
        <Route
          path={ROUTES.groupDetail}
          element={withRoles([USER_ROLES.user], <GroupDetailPage />)}
        />

        {/* Buddy */}
        <Route
          path={ROUTES.buddy}
          element={withRoles([USER_ROLES.buddy], <BuddyPage />)}
        />

        {/* Admin */}
        <Route
          path={ROUTES.admin}
          element={withRoles([USER_ROLES.admin], <AdminPage />, false)}
        />

        {/* Errors */}
        <Route
          path={ROUTES.forbidden}
          element={withMainLayout(<ForbiddenPage />)}
        />
        <Route
          path={ROUTES.notFound}
          element={withMainLayout(<NotFoundPage />)}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
