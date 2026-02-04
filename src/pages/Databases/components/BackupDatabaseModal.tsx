import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import StatusBar from "../../../components/StatusBar/StatusBar";
import type { BackupCapabilitiesResponse } from "../types";
import { getBackupCapabilities } from "../../../services/database.service";
import { getBackupSettings } from "../../../services/backup-settings.service";
import { initiateBackup } from "../../../services/backup.service";
import type { BackupSettings } from "../../DatabaseDetails/types";

type BackupDatabaseModalProps = {
    dbId: string;
    dbName: string;
    engine: "PostgreSQL" | "MySQL" | "MongoDB";
    environment: string;
    onClose: () => void;
    onBackup: () => void;
};

function BackupDatabaseModal({ dbId, dbName, engine, environment, onClose, onBackup }: BackupDatabaseModalProps) {
    const [backupType, setBackupType] = useState<string>("");
    const [backupName, setBackupName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [capabilities, setCapabilities] = useState<BackupCapabilitiesResponse | null>(null);
    const [capabilitiesError, setCapabilitiesError] = useState<string | null>(null);
    const [backupSettings, setBackupSettings] = useState<BackupSettings | null>(null);


    const canBackup =  !!capabilities && capabilities.allowed && backupType && !loading && !capabilitiesError;

    // useEffect(() => {
    //     async function loadCapabilities() {
    //         try {
    //             const data = await getBackupCapabilities(dbId);

    //             if (!data.allowed) {
    //                 setCapabilitiesError(data.reason ?? "Backup not allowed");
    //                 return;
    //             }

    //             setCapabilities(data);
    //         } catch {
                
               
    //         }
    //     }

    //     loadCapabilities();
    // }, [dbId]);

    useEffect(() => {
        async function load() {
            try{
                const [cap, settings] = await Promise.all([
                    getBackupCapabilities(dbId),
                    getBackupSettings(dbId),
                ]);

                setCapabilities(cap);
                setBackupSettings(settings);
            } catch{
                setCapabilitiesError("Failed to load backup capabilities");
                setStatusMessage({ type: "error", message: capabilitiesError ?? "Failed to fetch capabilities." });

                setTimeout(() => { setStatusMessage(null);}, 3000);
            }

        }

        load();
    }, [dbId]);

    //default backup type
    useEffect(() => {
        if (!backupSettings) return;

        setBackupType(backupSettings.defaultBackupType);
    }, [backupSettings]);





    const handleBackupDatabase = async() => {
        setLoading(true);
        try {
            const trimmedBackupName = backupName.trim();

            if (trimmedBackupName.length > 64) {
                setStatusMessage({
                    type: "error",
                    message: "Backup name must be 64 characters or less."
                });
                setLoading(false);
                return;
            }

            const label: string | null =  trimmedBackupName === "" ? null : trimmedBackupName;

            await initiateBackup(dbId, {
                backupType,     
                backupName: label,                
            });

            setStatusMessage({ type: "success", message: "Database backup initiated successfully." });

            // Wait for user to see success message (3 seconds)
            await new Promise(resolve => setTimeout(resolve, 1500))

            onBackup();
            //onClose();

        } catch (error) {
            console.error("Error backing up database:", error);
            setStatusMessage({ type: "error", message: "Failed to initiate database backup. Please try again." });

            setTimeout(() => { setStatusMessage(null);}, 3000);

        } finally {
            setLoading(false);
        }

    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
       
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
        >
            <div className="flex flex-col gap-2 bg-white rounded-lg p-6 w-96">
                <div className="flex flex-col gap-1" >
                    <span className="text-2xl font-semibold">Backup Database</span>
                    <span className="text-[#8e9c97]">Are you sure you want to create a backup of this database?</span>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                    <div className="flex flex-col">
                        <span>Database Name: {dbName}</span>
                        <span>Database Engine: {engine}</span>
                        <span>Environment: {environment}</span>
                    </div>

           
                    

                    {/* PostgreSQL / MySQL */}
                    {(engine.toLowerCase() === "postgresql" || engine.toLowerCase() === "mysql") && (
                        <div className="flex flex-col gap-1 mt-3">
                            <label htmlFor="backupType" className="font-medium">
                                Backup Type
                            </label>
                            <select
                                value={backupType}
                                disabled={loading}
                                onChange={(e) => setBackupType(e.target.value)}
                                className="p-2 border rounded"
                            >
                                <option value="">Select backup type</option>

                                {capabilities?.modes.includes("FULL") && (
                                    <option value="FULL">Structure + Data</option>
                                )}

                                {capabilities?.modes.includes("STRUCTURE_ONLY") && (
                                    <option value="STRUCTURE_ONLY">Structure only</option>
                                )}

                                {capabilities?.modes.includes("DATA_ONLY") && (
                                    <option value="DATA_ONLY">Data only</option>
                                )}
                            </select>
                        </div>
                    )}

                    {/* MongoDB */}
                    {engine.toLowerCase() === "mongodb" && (
                        <div className="flex flex-col gap-1 mt-3">
                            <label htmlFor="backupType" className="font-medium">
                                Backup Type
                            </label>
                            <select
                                value={backupType}
                                disabled={loading}
                                onChange={(e) => setBackupType(e.target.value)}
                                className="p-2 border rounded"
                            >

                                <option value="">Select backup type</option>

                                {capabilities?.modes.includes("FULL") && (
                                    <option value="FULL">Data + Indexes</option>
                                )}

                                {capabilities?.modes.includes("DATA_ONLY") && (
                                    <option value="DATA_ONLY">Data only</option>
                                )}
                            </select>
                        </div>
                    )}

                    <input
                        type="text"
                        value={backupName}
                        maxLength={64}
                        disabled={loading}
                        onChange={(e) => setBackupName(e.target.value)} 
                        placeholder="Backup Name"
                        className="p-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
{/* 
                    <span>Storage destination: {storage}</span> */}

                    {/* TODO: DEAL WITH NULL PROPERLY */}
                    <div className="text-sm text-gray-600">
                        <div>Storage:  {backupSettings?.storageTarget}</div>
                        <div>
                            Retention:
                            {backupSettings?.retentionEnabled
                            ? `${backupSettings?.retentionValue} ${backupSettings?.retentionMode?.toLowerCase()}`
                            : "Disabled"}
                        </div>
                    </div>



                    <div className="flex gap-3 mt-4 max-w-md">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={loading}
                            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={!canBackup}
                            onClick={handleBackupDatabase}
                            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                            {loading ? "Backing up..." : "Backup Database"}
                        </button>
                    </div>

                    {/* Helper text */}
                    <div className="flex items-start gap-2 text-sm text-gray-500 max-w-md">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="min-w-0">
                            Backups may take several minutes to complete depending on the size of the database. You will be notified once the backup is ready.
                        </span>
                    </div>
                </div>

            </div>

            {statusMessage && (
                <StatusBar
                    type={statusMessage.type}
                    message={statusMessage.message}
                    onClose={() => setStatusMessage(null)}
                />
            )}
        </div>
    )
}

export default BackupDatabaseModal;