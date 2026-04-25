import { dashboardMenuItems, dashboardGeneralItems } from "./menuItems"
import { NavLink } from "react-router-dom"

function BottomNav() {
    const items = [...dashboardMenuItems, ...dashboardGeneralItems]

    return (
        <nav className="fixed bottom-6 left-6 right-6 z-50 bg-white md:hidden">
            <ul className="flex justify-around items-center h-14 rounded-xl shadow border">
                {items.map((item) => (
                <li key={item.name}>
                    <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center text-xs ${ isActive ? "text-green-600" : "text-gray-400" }`
                        }
                        >
                        <item.icon className="h-5 w-5" />
                    </NavLink>
                </li>
                ))}
            </ul>
        </nav>
    )
}

export default BottomNav
