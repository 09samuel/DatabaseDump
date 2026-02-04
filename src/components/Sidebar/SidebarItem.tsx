import type { LucideIcon } from "lucide-react"

type Props = {
  item: {
    name: string
    icon: LucideIcon
  }
  expanded: boolean
  activeItem: string
  setActiveItem: React.Dispatch<React.SetStateAction<string>>
}

function SidebarItem({ item, expanded, activeItem, setActiveItem }: Props) {
  const IconComponent = item.icon

  return (
    <div
      onClick={() => setActiveItem(item.name)}
      className={`flex items-center p-2 mb-2 rounded cursor-pointer transition-all
        ${expanded ? "justify-start pl-3" : "justify-center"}
        ${expanded && activeItem === item.name ? "border-l-4 border-green-600" : ""}
        ${!expanded && activeItem === item.name ? "" : "hover:bg-green-100"}
      `}
    >
      <IconComponent
        className={`w-5 h-5 shrink-0 transition-colors
          ${expanded ? "me-3" : "me-0"}
          ${activeItem === item.name
            ? "text-green-600"
            : "text-gray-400 opacity-60"}
        `}
      />

      <span
        className={`whitespace-nowrap transition-all duration-200
          ${expanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
          ${activeItem === item.name ? "text-black font-medium" : "text-[#8e9c97]"}
        `}
      >
        {item.name}
      </span>
    </div>
  )
}

export default SidebarItem
