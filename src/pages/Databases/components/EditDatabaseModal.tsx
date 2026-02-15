import { useEffect, useState } from "react";
import { type DatabaseEngine, type BackendVerifyState, type DatabaseDetails, type UpdateDatabasePayload, type VerifyState, type SSLMode } from "../types";
import {  getConnectionStatus, getDatabaseDetails, updateDatabase, verifyConnection, verifyDryRun } from "../../../services/database.service";
import StatusBar from "../../../components/StatusBar/StatusBar";


type EditDatabaseModalProps = {
    dbId: string
    onClose: () => void
    onSuccess: () => void
}

function EditDatabaseModal({ dbId, onClose, onSuccess }: EditDatabaseModalProps) {
    const [databaseName, setDatabaseName] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState<number | string | null>(null);
    const [dbEngine, setDbEngine] = useState<DatabaseEngine | null>(null);
    const [environment, setEnvironment] = useState("");
    const [username, setUsername] = useState<string | null>();
    const [password, setPassword] = useState("");
    const [sslMode, setSslMode] = useState<SSLMode | null>(null)

    //to track original details for comparison for changes
    const [original, setOriginal] = useState<DatabaseDetails | null>(null);

    const [loading, setLoading] = useState(false)
    const [, setError] = useState<string | null>(null)

    const [verifyState, setVerifyState] = useState<VerifyState>("idle")
    const [, setVerifyError] = useState<string | null>(null)

    const [formErrors, setFormErrors] = useState<string[]>([])

    const isVerified = verifyState === "success"

    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

    const [connectionId, setConnectionId] = useState<string | null>(null)
    const [backendVerifyState, setBackendVerifyState] = useState<BackendVerifyState>("CREATED")

    const isLocked = verifyState === "verifying" || backendVerifyState === "VERIFYING" || backendVerifyState === "VERIFIED"

    // Constructs payload with only changed fields
    const buildUpdatePayload = () => {
        if (!original) return {};

        const payload: UpdateDatabasePayload = {};  

        if (databaseName !== original.dbName) payload.dbName = databaseName.trim();
        if (host !== original.dbHost) payload.dbHost = host.trim();
        
        const normalizedPort = port === "" || port === null ? null : Number(port);
        if (normalizedPort !== original.dbPort) payload.dbPort = normalizedPort;
        
        if (dbEngine && dbEngine !== original.dbEngine)  payload.dbEngine = dbEngine;
        if (environment !== original.environment) payload.environment = environment;
        if (username !== original.dbUsername) payload.dbUsername =  username?.trim() ?? null;
        if (sslMode != original.sslMode) payload.sslMode = sslMode

        // password ONLY if user entered it
        if (password.trim()) payload.dbUserSecret = password.trim();

        return payload;
    };


    // Determines if verification is needed based on changed fields
    const needsVerification = () => {
    if (!original) return false;

    const normalizedPort = port === "" || port === null ? null : Number(port);

    return (
        host !== original.dbHost ||
        normalizedPort !== original.dbPort ||
        dbEngine !== original.dbEngine ||
        username !== original.dbUsername ||
        password.trim().length > 0 ||
        sslMode !== original.sslMode
    );
};




    useEffect(() => {
        const loadDatabaseDetails = async () => {
            setLoading(true);               

            try{
                const db = await getDatabaseDetails(dbId);

                setOriginal(db);

                setDatabaseName(db.dbName);
                setHost(db.dbHost);
                setPort(db.dbPort);
                setDbEngine(db.dbEngine);
                setEnvironment(db.environment);
                setUsername(db.dbUsername);
                setSslMode(db.sslMode)

            } catch (error) {
                console.error("Error loading saved form data:", error);
            } finally { 
                setLoading(false);
            }
        };

        loadDatabaseDetails();
    } , [dbId]);

    //To automatically clear status messages after 3 seconds
    useEffect(() => {
        if (!statusMessage) return

        const t = setTimeout(() => setStatusMessage(null), 3000)
        return () => clearTimeout(t)
    }, [statusMessage])


    // Reset verification state when credentials change
    useEffect(() => {
        if (verifyState === "success") {
            setVerifyState("idle");
        }
    }, [databaseName, host, port, dbEngine, username, password, sslMode]);


    //clear form errors on input change
    useEffect(() => {
        if (formErrors.length > 0) {
            setFormErrors([])
        }
    }, [databaseName, host, port, dbEngine, environment, username, password, sslMode])



    //polling to check backend verification status on adding database
    useEffect(() => {
        if (!connectionId || backendVerifyState !== "VERIFYING") return

        let cancelled = false

        const poll = async () => {
            try {
                const res = await getConnectionStatus(connectionId)

                if (cancelled) return

                if (res.status === "VERIFIED") {
                    setBackendVerifyState("VERIFIED")

                    setStatusMessage({
                        type: "success",
                        message: "Database updated and verified successfully",
                    })

                    // Wait for user to see success message (3 seconds)
                    await new Promise(resolve => setTimeout(resolve, 1500))

            
                    onSuccess()
                    onClose()

                    return
            }

            if (res.status === "ERROR") {
                setBackendVerifyState("ERROR")
                setStatusMessage({
                    type: "error",
                    message: res.errorMessage || "Verification failed",
                })
                return
            }

                setTimeout(poll, 2500)
            } catch {
                setTimeout(poll, 2500)
            }
        }

        poll()

        return () => {
            cancelled = true
        }
    }, [connectionId, backendVerifyState])


    async function handleVerify() {
        const errors = validateForm();
        if (errors.length > 0) {
            setFormErrors(errors);
            setVerifyState("error");

            setStatusMessage({
                type: "error",
                message: errors[0] // Show first error
            });
            return;
        }

        setFormErrors([])
        setVerifyState("verifying")
        setVerifyError(null)

        try {
            if (!dbEngine) return

             await verifyDryRun({
                connectionId: dbId,
                dbType: dbEngine,
                dbHost: host?.trim(),
                dbPort: port ? Number(port) : null,
                dbName: databaseName?.trim(),
                dbUserName: username?.trim() || null,
                dbUserSecret: password?.trim() || null,
                sslMode: sslMode || null,
            })

            setVerifyState("success")

            setStatusMessage({
                type: "success",
                message: "Connection verified successfully",
            })

        } catch (err) {
            console.error(err)
            setVerifyError("Verification failed. Please check credentials.")
            setVerifyState("error")

            setStatusMessage({
                type: "error",
                message: "Verification failed. Please check credentials.",
            })
        }
    }


    async function handleUpdateDatabase(e: React.FormEvent) {
        e.preventDefault()

        const payload = buildUpdatePayload()
        const requiresVerification = needsVerification()
        
        if(Object.keys(payload).length === 0) {
            setStatusMessage({
                type: "error",
                message: "No changes to update"
            })
            return
        }

        if (requiresVerification && verifyState !== "success") {
            setStatusMessage({
                type: "error",
                message: "Please verify the connection before saving",
            });
            return;
        }

        setLoading(true)
        setError(null)

        try {
            await updateDatabase(dbId, payload)

            if (requiresVerification) {
                setStatusMessage({ type: "success",
                message: "Database updated. Verifying connection...",
                })
                
                setConnectionId(dbId)

                const result = await verifyConnection(dbId)
                setBackendVerifyState(result.status)

                return
            }

            setStatusMessage({
                type: "success",
                message: "Database updated successfully",
            })

            // Wait for user to see success message (3 seconds)
            await new Promise(resolve => setTimeout(resolve, 1500))

            setConnectionId(dbId)


            onSuccess()
            setLoading(false)
            onClose()

        } catch (error) {
            console.error("Update database error:", error)
            setError("Failed to update database")
            setStatusMessage({
                type: "error",
                message: "Failed to update database",
            })
        } finally {
            setLoading(false)
        }
    }



    //validations
    const validateForm = (): string[] => {
        const errors: string[] = [];

        const trimmedDatabaseName = databaseName.trim();
        const trimmedHost = host.trim();
        const trimmedUsername = (username ?? "").trim();
        const trimmedPassword = password.trim();

        // Database name: required, alphanumeric + underscores/dashes, 1–64 chars
        if (!trimmedDatabaseName) {
            errors.push("Database name is required");
        } else if (!/^[a-zA-Z0-9_-]+$/.test(trimmedDatabaseName)) {
            errors.push("Database name must contain only letters, numbers, underscores, or dashes");
        } else if (trimmedDatabaseName.length > 64) {
            errors.push("Database name must be 1–64 characters");
        }

        // Host: 1–253 chars, required, valid hostname or IPv4
        if (!trimmedHost) {
            errors.push("Host is required");
        } else if (trimmedHost.length > 253) {
            errors.push("Host must be at most 253 characters");
        } else if (
            !/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$|^(\d{1,3}\.){3}\d{1,3}$/.test(
            trimmedHost
            )
        ) {
            errors.push("Host must be a valid hostname or IP address");
        }

        // Port: required, valid range
        const portNum = Number(port);

        if (dbEngine !== "mongodb") {
            if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
                errors.push("Port must be a valid number between 1–65535");
            }
        }

        // Engine: required
        if (!dbEngine) {
            errors.push("Database engine is required");
        }

        // Environment: required
        if (!environment) {
            errors.push("Environment is required");
        }

        // Username & Password validation
        if (trimmedUsername.length > 64) {
            errors.push("Username must be at most 64 characters");
        }

        if (trimmedPassword.length > 128) {
            errors.push("Password must be at most 128 characters");
        }

        // SSL validation (Postgres & MySQL only)
        if (dbEngine === "postgresql") {
        const validPgModes = ["disable", "require", "verify-ca", "verify-full"];

            if (!sslMode || !validPgModes.includes(sslMode)) {
                errors.push("Invalid SSL mode selected for PostgreSQL");
            }
        }

        if (dbEngine === "mysql") {
            const validMysqlModes = ["disable", "require"];

            if (!sslMode || !validMysqlModes.includes(sslMode)) {
                errors.push("Invalid SSL mode selected for MySQL");
            }
        }

        return errors;
    };




    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 px-4 py-6 sm:px-6 sm:py-10"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
        >
            <form  onSubmit={handleUpdateDatabase} onClick={(e) => e.stopPropagation()} className="mx-auto w-full max-w-md max-h-[90vh] bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1" >
                    <span className="text-2xl font-semibold">Edit Database</span>
                    <span className="text-[#8e9c97]">
                        Update the details of an existing database connection
                    </span>
                </div>
            

                {/* Form fields container */}
                <div className="flex flex-col gap-4 max-w-md overflow-y-auto md:no-scrollbar flex-1 min-h-0">
                    <input
                        type="text"
                        value={databaseName}
                        disabled={isLocked}
                        onChange={(e) => setDatabaseName(e.target.value)} 
                        placeholder="Database Name"
                        className="p-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />

                    <input
                        type="text"
                        value={host}
                        disabled={isLocked}
                        onChange={(e) => setHost(e.target.value)} 
                        placeholder="Host"
                        className="p-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />

                    <input
                        type="number"
                        value={port ?? ""}
                        disabled={isLocked}
                        onChange={(e) => setPort(e.target.value)}  
                        placeholder={dbEngine === "mongodb" ? "Not required for MongoDB Atlas" : "Port"}
                        className="p-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />

                    {/* Database Engine */}
                    <div className="flex flex-col gap-1">
                    <label htmlFor="dbEngine" className="font-medium">
                        Database engine
                    </label>
                    <select
                        id="dbEngine"
                        value={dbEngine ?? ""}
                        disabled={isLocked}
                        onChange={(e) => setDbEngine(e.target.value === "" ? null : (e.target.value as DatabaseEngine)) }
                        className="p-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="">Select engine</option>
                        <option value="postgresql">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                        <option value="mongodb">MongoDB</option>
                    </select>
                    </div>

                    {/* SSL Mode */}
                    {(dbEngine === "postgresql" || dbEngine === "mysql") && (
                        <div className="flex flex-col gap-1">
                            <label htmlFor="sslMode" className="font-medium">
                            SSL Mode
                            </label>
                            <select
                            id="sslMode"
                            value={sslMode ?? "disable"}
                            disabled={isLocked}
                            onChange={(e) => setSslMode(e.target.value === "" ? null : (e.target.value as SSLMode)) }
                            className="p-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                            {dbEngine === "postgresql" && (
                                <>
                                <option value="disable">Disable</option>
                                <option value="require">Require</option>
                                <option value="verify-ca">Verify CA</option>
                                <option value="verify-full">Verify Full</option>
                                </>
                            )}

                            {dbEngine === "mysql" && (
                                <>
                                <option value="disable">Disable</option>
                                <option value="require">Require</option>
                                </>
                            )}
                            </select>

                            <span className="text-xs text-gray-500">
                            Hosted databases usually require SSL.
                            </span>
                        </div>
                    )}


                    {/* Environment */}
                    <div className="flex flex-col gap-1">
                    <label htmlFor="environment" className="font-medium">
                        Environment
                    </label>
                    <select
                        id="environment"
                        value={environment}
                        disabled={isLocked}
                        onChange={(e) => setEnvironment(e.target.value)} 
                        className="p-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="">Select environment</option>
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                    </select>
                    </div>

                    <input
                        type="text"
                        value={username ?? ""}
                        disabled={isLocked}
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Username"
                        className="p-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />

                    <input
                        type="password"
                        value={password}
                        disabled={isLocked}
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Password"
                        className="p-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                </div>


                <div className="flex gap-3 mt-4 max-w-md">
                    <button 
                        type="button" 
                        onClick={handleVerify} 
                        disabled={verifyState === "verifying" || backendVerifyState === "VERIFYING"}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                        {verifyState === "verifying" ? "Verifying..." : "Verify Connection"}
                    </button>

                    <button
                        type="submit"
                        disabled={!isVerified || loading || isLocked}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                        {loading ? "Updating..." : "Update Database"}
                    </button>
                </div>

            


            </form>

            {statusMessage && (
                <StatusBar
                    type={statusMessage.type}
                    message={statusMessage.message}
                    onClose={() => setStatusMessage(null)}
                />
            )}

        </div>
    );
}

export default EditDatabaseModal;
