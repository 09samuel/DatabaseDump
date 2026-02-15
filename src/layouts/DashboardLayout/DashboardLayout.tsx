import { useState } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Topbar from '../../components/Topbar/Topbar'
import UserActions from '../../components/Topbar/UserActions'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from '../../components/Sidebar/BottomNav'


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
  <div className="flex h-screen w-full p-4 gap-4">
      
      <aside className="hidden md:flex shrink-0">
        <Sidebar />
      </aside>

      <div className="flex flex-col flex-1 min-w-0 min-h-0 gap-4">
        <Topbar {...topbarProps} />

        <main className="flex flex-col flex-1 min-h-0">
          <Outlet context={{ dbSearch }} />
        </main>
      </div>

      <BottomNav />
    </div>
  )

}

export default DashboardLayout
