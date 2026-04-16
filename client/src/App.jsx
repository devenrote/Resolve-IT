import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmployeeDashboardPage from './pages/employee/EmployeeDashboardPage'
import CreateComplaintPage from './pages/employee/CreateComplaintPage'
import ProfilePage from './pages/employee/ProfilePage'
import TrackingPage from './pages/employee/TrackingPage'
import UpdateComplaintPage from './pages/employee/UpdateComplaintPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import ComplaintManagementPage from './pages/admin/ComplaintManagementPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import EmployeeLayout from './layouts/EmployeeLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboardPage />} />
        <Route path="create-complaint" element={<CreateComplaintPage />} />
        <Route path="update-complaint" element={<UpdateComplaintPage />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="my-complaints" element={<Navigate to="/employee" replace />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="complaints" element={<ComplaintManagementPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'employee' ? '/employee' : '/'} replace />}
      />
    </Routes>
  )
}

export default App
