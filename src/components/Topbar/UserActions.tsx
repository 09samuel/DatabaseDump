import { Bell, UserCircle } from "lucide-react"

function UserActions() {
    return (
        <div className="flex items-center gap-4">
            <button aria-label="Notifications" className="bg-white rounded-full p-2">
                <Bell className="w-5 h-5 text-black" />
            </button>
                    
            <div className="flex items-center gap-2">
                <button aria-label="User profile"  className="bg-white rounded-full p-2">
                    <UserCircle className="w-6 h-6 text-black" />
                </button>

                <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium text-black">
                        John Doe
                    </span>
                    
                    <span className="text-xs text-gray-500">
                        john.doe@email.com
                    </span>
                </div>
            </div>
        </div>
    )
}

export default UserActions