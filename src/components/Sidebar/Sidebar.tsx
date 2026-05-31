import { useState } from "react"
import Logo from "../../assets/react.svg"
import SidebarItem from "./SidebarItem"
import { dashboardMenuItems, dashboardGeneralItems } from "./menuItems"
import LogoutModal from "../Logout/LogoutModal"

function Sidebar() {
  const [expanded, setExpanded] = useState(true)
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <aside className="hidden md:block h-full">
      <nav className={`h-full bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg ${expanded ? "w-64" : "w-16"}`}>
        <div
          className="p-4 flex justify-center items-center"
          onClick={() => setExpanded((curr) => !curr)}
        >
          {/* <img src={Logo} alt="Logo" className="h-8 w-8" /> */}
          <h1 className={`ps-4 font-semibold text-gray-900 dark:text-gray-100 ${expanded ? "visible" : "hidden"}`}>
            DatabaseDump
          </h1>
        </div>

        <div className="p-4 mt-6">
          <h2
            className={`text-gray-500 dark:text-gray-400 text-sm mb-2 uppercase transition-opacity
              h-6 flex items-center
              ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            Menu
          </h2>

          {dashboardMenuItems.map((item) => (
            <SidebarItem
              key={item.name}
              item={item}
              expanded={expanded}
            />
          ))}
        </div>

        <div className="p-4">
          <h2
            className={`text-gray-500 dark:text-gray-400 text-sm mb-2 uppercase transition-opacity
              h-6 flex items-center
              ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            General
          </h2>

          {dashboardGeneralItems.map((item) => (
            <SidebarItem
              key={item.name}
              item={
                item.name === "Logout"
                  ? {
                      ...item,
                      onClick: () => setLogoutOpen(true)
                    }
                  : item
              }
              expanded={expanded}
            />
          ))}
        </div>
      </nav>

      <LogoutModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
      />

    </aside>
  )
}

export default Sidebar
