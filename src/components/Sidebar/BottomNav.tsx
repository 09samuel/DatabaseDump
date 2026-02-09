import { useState } from "react"
import { dashboardMenuItems, dashboardGeneralItems } from "./menuItems"

function BottomNav() {
    const items = [...dashboardMenuItems, ...dashboardGeneralItems]
    const [activeItem, setActiveItem] = useState('Dashboard')

    return (
        <nav className="fixed bottom-6 left-6 right-6 z-50 bg-white md:hidden">
            <ul className="flex justify-around items-center h-14 rounded-xl shadow border">
                {items.map((item) => (
                <li key={item.name}>
                    <button
                    onClick={() => setActiveItem(item.name)}
                    className={`flex flex-col items-center text-xs ${activeItem === item.name ? "text-green-600": "text-gray-400"}          `}
                    >
                    <item.icon className="h-5 w-5" />
                    </button>
                </li>
                ))}
            </ul>
        </nav>
    )
}

export default BottomNav
