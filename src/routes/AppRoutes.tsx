import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// pages
import LoginPage from "../pages/Authentication/Login";
import RegisterPage from "../pages/Authentication/Register";
import ResetPasswordPage from "../pages/Authentication/ResetPassword";
import VerifyEmailPage from "../pages/Authentication/VerifyEmail";

// dashboard
import DashboardLayout from "../layouts/DashboardLayout/DashboardLayout";
import DatabasesPage from "../pages/Databases/DatabasesPage";
import BackupsPage from "../pages/Backups/BackupsPage";
import DatabaseDetailsPage from "../pages/DatabaseDetails/DatabaseDetailsPage";
import DatabaseOverviewTab from "../pages/DatabaseDetails/tabs/DatabaseOverviewTab";
import DatabaseBackupsTab from "../pages/DatabaseDetails/tabs/DatabaseBackupsTab";
import DatabaseBackupSettingsTab from "../pages/DatabaseDetails/tabs/DatabaseBackupSettingsTab";
import DatabaseAuditLogsTab from "../pages/DatabaseDetails/tabs/DatabaseAuditLogsTab";
import AuditLogs from "../pages/AuditLogs/AuditLogs";
import SettingsPage from "../pages/Settings/SettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Root */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="databases" replace />} />
          <Route path="databases" element={<DatabasesPage />} />
          <Route path="backups" element={<BackupsPage />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<SettingsPage />} />

          <Route path="databases/:id" element={<DatabaseDetailsPage />}>
            <Route index element={<DatabaseOverviewTab />} />
            <Route path="backups" element={<DatabaseBackupsTab />} />
            <Route path="audit-logs" element={<DatabaseAuditLogsTab />} />
            <Route path="settings/backups" element={<DatabaseBackupSettingsTab />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;