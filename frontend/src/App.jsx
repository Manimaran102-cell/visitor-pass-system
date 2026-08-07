import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';

import AdminDashboard from './pages/admin/Dashboard';
import Employees from './pages/admin/Employees';
import Users from './pages/admin/Users';
import VisitorReports from './pages/admin/VisitorReports';
import ActivityHistory from './pages/admin/ActivityHistory';
import Reports from './pages/admin/Reports';

import ReceptionistDashboard from './pages/receptionist/Dashboard';
import RegisterVisitor from './pages/receptionist/RegisterVisitor';
import VisitorDesk from './pages/receptionist/VisitorDesk';
import VisitorHistory from './pages/receptionist/VisitorHistory';

import EmployeeDashboard from './pages/employee/Dashboard';
import VisitorRequests from './pages/employee/VisitorRequests';

const RoleHome = () => {
  const { user } = useAuth();
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'receptionist') return <ReceptionistDashboard />;
  return <EmployeeDashboard />;
};

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<RoleHome />} />

      {/* Admin */}
      <Route path="/employees" element={<ProtectedRoute roles={['admin']}><Employees /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute roles={['admin']}><ActivityHistory /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />

      {/* Admin + Receptionist share the visitor records view (admin: read-only reports, receptionist: desk actions) */}
      <Route
        path="/visitors"
        element={
          <ProtectedRoute roles={['admin', 'receptionist']}>
            <RoleScopedVisitors />
          </ProtectedRoute>
        }
      />

      {/* Receptionist */}
      <Route path="/register" element={<ProtectedRoute roles={['receptionist']}><RegisterVisitor /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute roles={['receptionist']}><VisitorHistory /></ProtectedRoute>} />

      {/* Employee */}
      <Route path="/requests" element={<ProtectedRoute roles={['employee']}><VisitorRequests /></ProtectedRoute>} />
    </Route>
  </Routes>
);

// /visitors renders differently depending on role: admin gets a read-only report,
// receptionist gets the actionable front-desk view.
const RoleScopedVisitors = () => {
  const { user } = useAuth();
  return user.role === 'admin' ? <VisitorReports /> : <VisitorDesk />;
};

export default App;
