import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoleGuard, PublicRoute } from './routes/RoleGuard';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import AccountantLayout from './layouts/AccountantLayout';
import InventoryLayout from './layouts/InventoryLayout';

// Shared Pages
import Login from './pages/Login';
import EmployeeLogin from './pages/EmployeeLogin';
import SettingsPage from './pages/Settings';

// Lazy Loaded Dashboards
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));
const AccountantDashboard = lazy(() => import('./pages/accountant/AccountantDashboard'));
const InventoryDashboard = lazy(() => import('./pages/inventory/InventoryDashboard'));

// Other Pages
const Employees = lazy(() => import('./pages/Employees'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Tasks = lazy(() => import('./pages/Tasks'));
const FraudDetection = lazy(() => import('./pages/FraudDetection'));
const Benchmarking = lazy(() => import('./pages/Benchmarking'));

const App = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="shimmer" style={{ height: '100vh' }}></div>}>
        <Routes>
          {/* Login Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/admin-login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/employee-login" element={<PublicRoute><EmployeeLogin /></PublicRoute>} />

          {/* Admin Domain */}
          <Route path="/admin/*" element={
            <RoleGuard allowedRoles={['admin']}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="fraud" element={<FraudDetection />} />
                  <Route path="performance" element={<Benchmarking />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Routes>
              </AdminLayout>
            </RoleGuard>
          } />

          {/* Employee Domain */}
          <Route path="/employee/*" element={
            <RoleGuard allowedRoles={['employee']}>
              <EmployeeLayout>
                <Routes>
                  <Route path="dashboard" element={<EmployeeDashboard />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Routes>
              </EmployeeLayout>
            </RoleGuard>
          } />

          {/* Accountant Domain */}
          <Route path="/accountant/*" element={
            <RoleGuard allowedRoles={['accountant']}>
              <AccountantLayout>
                <Routes>
                  <Route path="dashboard" element={<AccountantDashboard />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="fraud" element={<FraudDetection />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Routes>
              </AccountantLayout>
            </RoleGuard>
          } />

          {/* Inventory Domain */}
          <Route path="/inventory/*" element={
            <RoleGuard allowedRoles={['inventory']}>
              <InventoryLayout>
                <Routes>
                  <Route path="dashboard" element={<InventoryDashboard />} />
                  <Route path="products" element={<Inventory />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Routes>
              </InventoryLayout>
            </RoleGuard>
          } />

          {/* Root Redirect Logic */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
};

// Helper component to redirect user to their dashboard based on user type
const HomeRedirect = () => {
  const userType = localStorage.getItem('role') === 'employee' ? 'employee' : 'admin';
  return <Navigate to={`/${userType}/dashboard`} replace />;
};

export default App;
