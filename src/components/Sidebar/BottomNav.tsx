import { useState } from "react";
import { NavLink } from "react-router-dom";
import { dashboardMenuItems, dashboardGeneralItems } from "./menuItems";
import LogoutModal from "../Logout/LogoutModal";

function BottomNav() {
  const [logoutOpen, setLogoutOpen] = useState(false);

  const items = [
    ...dashboardMenuItems,
    ...dashboardGeneralItems.map((item) =>
        item.name === "Logout"
            ? { ...item, onClick: () => setLogoutOpen(true) }
            : item
    ),
  ];

  return (
    <>
        <nav className="fixed bottom-6 left-6 right-6 z-50 bg-white md:hidden">
            <ul className="flex justify-around items-center h-14 rounded-xl shadow border">
                {items.map((item) => (
                    <li key={item.name}>
                        {item.name === "Logout" ? (
                        <button
                            onClick={() => setLogoutOpen(true)}
                            className="flex flex-col items-center text-xs text-gray-400"
                        >
                            <item.icon className="h-5 w-5" />
                        </button>
                        ) : (
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                            `flex flex-col items-center text-xs ${
                                isActive ? "text-green-600" : "text-gray-400"
                            }`
                            }
                        >
                            <item.icon className="h-5 w-5" />
                        </NavLink>
                        )}
                    </li>
                ))}
            </ul>
        </nav>

        <LogoutModal
            open={logoutOpen}
            onClose={() => setLogoutOpen(false)}
        />
    </>
  );
}

export default BottomNav;