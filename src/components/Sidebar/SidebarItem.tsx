import type { LucideIcon } from "lucide-react"
import { NavLink } from "react-router-dom"

type Props = {
  item: {
    name: string
    icon: LucideIcon
    path: string
  }
  expanded: boolean
}

function SidebarItem({ item, expanded }: Props) {
  const IconComponent = item.icon

  return (

    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center p-2 mb-2 rounded cursor-pointer transition-all
        ${expanded ? "justify-start pl-3" : "justify-center"}
        ${expanded && isActive ? "border-l-4 border-green-600" : ""}
        ${!expanded && isActive ? "" : "hover:bg-green-100"}`
      }
    >
      {({ isActive }) => (
        <>
          <IconComponent
            className={`w-5 h-5 shrink-0 transition-colors
              ${expanded ? "me-3" : "me-0"}
              ${isActive ? "text-green-600" : "text-gray-400 opacity-60"}`}
          />
          <span
            className={`whitespace-nowrap transition-all duration-200
              ${expanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
              ${isActive ? "text-black font-medium" : "text-[#8e9c97]"}`}
          >
            {item.name}
          </span>
        </>
      )}
      
    </NavLink>
  )
}

export default SidebarItem
