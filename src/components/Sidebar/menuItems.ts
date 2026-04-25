import { LayoutDashboard, Database, ClipboardList, Settings, LogOut } from "lucide-react"

import type { LucideIcon } from "lucide-react"

export type NavItem = {
  name: string
  icon: LucideIcon
  path: string
}

export const dashboardMenuItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard/databases" },
  { name: "Backups", icon: Database, path: "/dashboard/backups" },
  { name: "Audit Logs", icon: ClipboardList, path: "/dashboard/audit-logs" },
]

export const dashboardGeneralItems: NavItem[] = [
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  { name: "Logout", icon: LogOut, path: "/logout" },
]
