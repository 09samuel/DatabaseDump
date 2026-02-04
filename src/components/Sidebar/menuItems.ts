import {
  LayoutDashboard,
  Database,
  Users,
  Settings,
  LogOut,
} from "lucide-react"

import type { LucideIcon } from "lucide-react"

export type NavItem = {
  name: string
  icon: LucideIcon
}

export const dashboardMenuItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Backups", icon: Database },
  { name: "Team", icon: Users },
]

export const dashboardGeneralItems: NavItem[] = [
  { name: "Settings", icon: Settings },
  { name: "Logout", icon: LogOut },
]
