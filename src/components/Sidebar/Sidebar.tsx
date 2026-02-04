import { useState } from "react"
import Logo from "../../assets/react.svg"
import SidebarItem from "./SidebarItem"

import {
  dashboardMenuItems,
  dashboardGeneralItems,
} from "./menuItems"


function Sidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard')
  const [expanded, setExpanded] = useState(true)

  return (
    <aside className="hidden md:block h-screen p-2">
      <nav className={`h-full bg-[#f7f7f7] border rounded-lg ${expanded ? "w-64" : "w-16"}`}>
        <div
          className="p-4 flex justify-center items-center"
          onClick={() => setExpanded((curr) => !curr)}
        >
          <img src={Logo} alt="Logo" className="h-8 w-8" />
          <h1 className={`ps-4 font-semibold text-black ${expanded ? "visible" : "hidden"}`}>
            DatabaseDump
          </h1>
        </div>

        <div className="p-4 mt-6">
          <h2
            className={`text-[#8e9c97] text-sm mb-2 uppercase transition-opacity
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
              activeItem={activeItem}
              setActiveItem={setActiveItem}
            />
          ))}
        </div>

        <div className="p-4">
          <h2
            className={`text-[#8e9c97] text-sm mb-2 uppercase transition-opacity
              h-6 flex items-center
              ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            General
          </h2>

          {dashboardGeneralItems.map((item) => (
            <SidebarItem
              key={item.name}
              item={item}
              expanded={expanded}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
            />
          ))}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
