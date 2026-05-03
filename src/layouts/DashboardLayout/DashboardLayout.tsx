import { useState } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar/Topbar'
import UserActions from '../../components/Topbar/UserActions'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from '../../components/Sidebar/BottomNav'


function DashboardLayout() {
  const location = useLocation()
  const [dbSearch, setDbSearch] = useState("")
  const [backupSearch, setBackupSearch] = useState("")
  const [auditSearch, setAuditSearch] = useState("")

  const isDatabasesPage = location.pathname === "/dashboard/databases"
  const isBackupsPage = location.pathname === "/dashboard/backups"
  const isAuditLogsPage = location.pathname === "/dashboard/audit-logs"

  const topbarProps: React.ComponentProps<typeof Topbar> =
    isDatabasesPage || isBackupsPage || isAuditLogsPage
      ? {
          showSearch: true,
          searchPlaceholder: isBackupsPage
            ? "Search backups..."
            : isAuditLogsPage
              ? "Search audit logs..."
              : "Search databases...",
          searchValue: isBackupsPage
            ? backupSearch
            : isAuditLogsPage
              ? auditSearch
              : dbSearch,
          onSearchChange: isBackupsPage
            ? setBackupSearch
            : isAuditLogsPage
              ? setAuditSearch
              : setDbSearch,
          rightActions: <UserActions />,
        }
      : {
          showSearch: false,
          rightActions: <UserActions />,
        }

  return (
  <div className="flex h-screen w-full p-4 gap-4 bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      
      <aside className="hidden md:flex shrink-0">
        <Sidebar />
      </aside>

      <div className="flex flex-col flex-1 min-w-0 min-h-0 gap-4">
        <Topbar {...topbarProps} />

        <main className="flex flex-col flex-1 min-h-0">
          <Outlet context={{ dbSearch, backupSearch, auditSearch }} />
        </main>
      </div>

      <BottomNav />
    </div>
  )

}

export default DashboardLayout
