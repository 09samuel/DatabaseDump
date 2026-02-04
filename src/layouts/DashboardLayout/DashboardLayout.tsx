import { useState } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar/Topbar'
import UserActions from '../../components/Topbar/UserActions'
import { Outlet, useLocation } from 'react-router-dom'


function DashboardLayout() {
  const location = useLocation()
  const [dbSearch, setDbSearch] = useState("")

  const isDatabasesPage = location.pathname === "/databases"

  const topbarProps: React.ComponentProps<typeof Topbar> =
    isDatabasesPage
      ? {
          showSearch: true,
          searchPlaceholder: "Search databases...",
          searchValue: dbSearch,
          onSearchChange: setDbSearch,
          rightActions: <UserActions />,
        }
      : {
          showSearch: false,
          rightActions: <UserActions />,
        }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar {...topbarProps} />

        <main className="flex-1 overflow-hidden mb-2 mr-2">
          <Outlet context={{ dbSearch }} />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
