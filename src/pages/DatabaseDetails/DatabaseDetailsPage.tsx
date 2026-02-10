import { DatabaseBackup, Library, Settings } from "lucide-react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import type { DatabaseBasicDetails } from "../Databases/types";
import { useEffect, useState } from "react";
import { getConnectionBasicDetails } from "../../services/database.service";
import StatusBar from "../../components/StatusBar/StatusBar";


function DatabaseDetailsPage() {
    const [data, setData] = useState<DatabaseBasicDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error";  message: string;} | null>(null);
        
    const skeleton = "animate-pulse bg-gray-200 rounded";

    const { id } = useParams<{ id: string }>();

    //To auto-clear status message
    useEffect(() => {
        if (!statusMessage) return;
        const t = setTimeout(() => setStatusMessage(null), 3000);
        return () => clearTimeout(t);
    }, [statusMessage]);
        

    useEffect(() => {
       const fetchBasicDetails = async () => {
            try {
                if (!id) {
                    throw new Error("Database ID is missing in URL parameters.");
                }
                
                const data = await getConnectionBasicDetails(id);
                setData(data);
            } catch(error){
                const message = "Failed to load database details. Please try again."
                setError(message);

                setStatusMessage({
                    type: "error",
                    message: message,
                });
                
                console.error("Error fetching database overview data:", error);

            } finally {            
                setLoading(false);
            }
        }
        fetchBasicDetails();
    }, [id]);


    return (
        <>
            <div className="flex flex-col h-full min-h-0 px-6 pt-6 border border-black rounded-lg bg-[#f7f7f7]">
                {/* Header */}
                <div className="h-7 flex items-center">
                    {loading ? (
                        <div className={`${skeleton} w-64 h-7`} />
                    ) : error ? (
                        <span className="text-xl md:text-2xl font-semibold leading-none">
                            Database Name
                        </span>
                    ) : (
                        <span className="text-xl md:text-2xl font-semibold leading-none">
                            {data?.name}
                        </span>
                    )}
                </div>


                <div className="flex gap-2 text-gray-400 items-center text-sm md:text-base">
                    {loading ? (
                        <>
                            <div className={`${skeleton} h-4 w-28`} />
                            <span>•</span>
                            <div className={`${skeleton} h-4 w-32`} />
                            <span>•</span>
                            <div className={`${skeleton} h-4 w-24`} />
                        </>
                    ) : error ? (
                        <>
                            <span>Engine</span>
                            <span>•</span>
                            <span>Environment</span>
                            <span>•</span>
                            <span>Status</span>
                        </>
                    ) : (
                        <>
                            <span>{data?.engine}</span>
                            <span>•</span>
                            <span>{data?.environment}</span>
                            <span>•</span>
                            <span>{data?.status}</span>
                        </>
                    )}
                </div>

                

                {/* Tabs */}
                <div className="border-b">
                    <ul className="flex justify-center md:justify-start gap-6 md:gap-8 mt-6">
                        <li>
                            <NavLink
                                to="."
                                end
                                className={({ isActive }) =>
                                    `inline-flex items-center gap-2 pb-2 border-b-2 text-sm md:text-base ${
                                    isActive
                                        ? "border-black font-medium"
                                        : "border-transparent text-gray-500"
                                    }`
                                }
                            >
                                <Library className="h-4 w-4 hidden md:inline" />
                                Overview
                            </NavLink>
                        </li>
            
                        <li>
                            <NavLink
                                to="backups"
                                className={({ isActive }) =>
                                    `inline-flex items-center gap-2 pb-2 border-b-2 text-sm md:text-base ${
                                    isActive
                                        ? "border-black font-medium"
                                        : "border-transparent text-gray-500"
                                    }`
                                }
                            >
                                <DatabaseBackup className="h-4 w-4 hidden md:inline"/>
                                Backups
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="settings/backups"
                                className={({ isActive }) =>
                                    `inline-flex items-center gap-2 pb-2 border-b-2 text-sm md:text-base ${
                                    isActive
                                        ? "border-black font-medium"
                                        : "border-transparent text-gray-500"
                                    }`
                                }
                            >
                                <Settings className="h-4 w-4 hidden md:inline" />
                                Backup Settings
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* Tab content */}
                <div className="pt-4 flex-1 min-h-0 overflow-y-auto">
                    <Outlet />
                </div>
            </div>

            {statusMessage && (
                <StatusBar
                type={statusMessage.type}
                message={statusMessage.message}
                onClose={() => setStatusMessage(null)}
                />
            )}
        </>
    );
}

export default DatabaseDetailsPage;