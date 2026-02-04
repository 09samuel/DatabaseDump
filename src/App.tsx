import "./App.css"
import { Navigate, Route, Routes } from "react-router-dom"
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout"
import DatabasesPage from "./pages/Databases/DatabasesPage"
import DatabaseDetailsPage from "./pages/DatabaseDetails/DatabaseDetailsPage"
import DatabaseOverviewTab from "./pages/DatabaseDetails/tabs/DatabaseOverviewTab"
import DatabaseBackupsTab from "./pages/DatabaseDetails/tabs/DatabaseBackupsTab"
import DatabaseBackupSettingsTab from "./pages/DatabaseDetails/tabs/DatabaseBackupSettingsTab"

function App() {
  return (
    <Routes>
      {/* App shell */}
      <Route element={<DashboardLayout/>}>

        {/* Redirect to /databases */}
        <Route index element={<Navigate to="/databases" replace />} />

        {/* Database list */}
        <Route path="databases" element={<DatabasesPage />} />

        {/* Database details + tabs */}
        <Route path="databases/:id" element={<DatabaseDetailsPage />}>
          <Route index element={<DatabaseOverviewTab />} />
          <Route path="backups" element={<DatabaseBackupsTab />} />
          <Route path="settings/backups" element={<DatabaseBackupSettingsTab />}/>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
