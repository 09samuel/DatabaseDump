import { Bell, UserCircle } from "lucide-react"
import { useUserStore } from "../../store/userStore"

function UserActions() {
    const user = useUserStore((state) => state.user)

    return (
        <div className="flex items-center gap-4">
            <button aria-label="Notifications" className="bg-white dark:bg-neutral-800 rounded-full p-2">
                <Bell className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            </button>
                    
            <div className="flex items-center gap-2">
                <button aria-label="User profile"  className="bg-white dark:bg-neutral-800 rounded-full p-2">
                    <UserCircle className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                </button>

                <div className="md:flex md:flex-col hidden leading-tight">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                       {user?.name ?? "Guest"}
                    </span>
                    
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email ?? "Not logged in"}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default UserActions