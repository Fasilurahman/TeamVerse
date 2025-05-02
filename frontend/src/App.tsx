import React, { Profiler } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import TeamLeadProjectPage from "./pages/TeamLeadProjectPage";
import AdminRoute from "./components/Routes/AdminRoute";
import RequestResetLink from "./pages/RequestResetLink";
import EmployeeTasks from "./pages/EmployeeTasks";
import KanbanBoard from "./pages/KanbanBoard";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
import OtpPage from "./pages/OtpPage";
import Users from "./pages/AdminUsersPage";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import AdminSubscriptionPage from "./pages/AdminSubscriptionsPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import AllTasks from "./pages/AllTasks";
import Meetings from "./pages/Meeting";
import TeamMembers from './pages/TeamMembers';
import Dashboard from "./pages/Dashboard";
import { Toaster } from "sonner";
import Messages from "./pages/Messages";
import SprintManagement from "./pages/SprintManagement";

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <TeamLeadProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <TeamLeadProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-members"
          element={
            <ProtectedRoute>
              <TeamMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sprints"
          element={
            <ProtectedRoute>
              <SprintManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:projectId"
          element={
            <ProtectedRoute>
              <AllTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/meetings"
          element={
            <ProtectedRoute>
              <Meetings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <AdminSubscriptionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kanban-board/:taskId"
          element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee-task"
          element={
            <ProtectedRoute>
              <EmployeeTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />


        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<Login />} />
        <Route path="/request-reset" element={<RequestResetLink />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
