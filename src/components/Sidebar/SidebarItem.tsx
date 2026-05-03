import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

type Props = {
  item: {
    name: string;
    icon: LucideIcon;
    path?: string;
    onClick?: () => void;
  };
  expanded: boolean;
};

function SidebarItem({ item, expanded }: Props) {
  const IconComponent = item.icon;

  const baseClasses = ` flex items-center p-2 mb-2 rounded cursor-pointer transition-all ${expanded ? "justify-start pl-3" : "justify-center"} hover:bg-blue-100 dark:hover:bg-neutral-800`;

  if (item.onClick) {
    return (
      <button
        onClick={item.onClick}
        className={baseClasses + " w-full"}
      >
        <IconComponent
          className={`w-5 h-5 shrink-0 ${
            expanded ? "me-3" : ""
          } text-gray-400 dark:text-gray-500`}
        />

        <span
          className={`whitespace-nowrap transition-all duration-200
          ${expanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
          text-gray-500 dark:text-gray-400`}
        >
          {item.name}
        </span>
      </button>
    );
  }

  return (
    <NavLink
      to={item.path!}
      className={({ isActive }) =>
        `${baseClasses}
        ${expanded && isActive ? "border-l-4 border-blue-600" : ""}`
      }
    >
      {({ isActive }) => (
        <>
          <IconComponent
            className={`w-5 h-5 shrink-0 ${
              expanded ? "me-3" : ""
            } ${isActive ? "text-blue-600" : "text-gray-400 dark:text-gray-500"}`}
          />

          <span
            className={`whitespace-nowrap transition-all duration-200
            ${expanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}
            ${isActive ? "font-medium text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}
          >
            {item.name}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default SidebarItem;