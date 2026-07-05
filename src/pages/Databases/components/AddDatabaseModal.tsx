import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import type { BackendVerifyState, DatabaseEngine, SSLMode, VerifyState } from "../types";
import { addDatabase, getConnectionStatus, verifyConnection, verifyDryRun } from "../../../services/database.service";
import StatusBar from "../../../components/StatusBar/StatusBar";
import { validateDatabaseConnection } from "../../../utils/validators";

type AddDatabaseModalProps = {
    onClose: () => void
    onSuccess: () => void
}

function AddDatabaseModal({ onClose, onSuccess }: AddDatabaseModalProps) {
    const [databaseName, setDatabaseName] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState<number | string | null>("");
    const [dbEngine, setDbEngine] = useState<DatabaseEngine | null>(null);
    const [environment, setEnvironment] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [sslMode, setSslMode] = useState<SSLMode | null>("disable");

    const [loading, setLoading] = useState(false)
    const [, setError] = useState<string | null>(null)

    const [verifyState, setVerifyState] = useState<VerifyState>("idle")
    const [, setVerifyError] = useState<string | null>(null)

    const [formErrors, setFormErrors] = useState<string[]>([])

    const isVerified = verifyState === "success"

    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

    const STORAGE_KEY = "add-database-form";


    const [connectionId, setConnectionId] = useState<string | null>(null)
    const [backendVerifyState, setBackendVerifyState] = useState<BackendVerifyState>("CREATED")

    const isLocked = verifyState === "verifying" || backendVerifyState === "VERIFYING" || backendVerifyState === "VERIFIED"


    //To automatically clear status messages after 3 seconds
    useEffect(() => {
        if (!statusMessage) return

        const t = setTimeout(() => setStatusMessage(null), 3000)
        return () => clearTimeout(t)
    }, [statusMessage])


    // Load form data from localStorage ONCE on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        try {
            const data = JSON.parse(saved);
            setDatabaseName(data.databaseName ?? "");
            setHost(data.host ?? "");
            setPort(data.port ?? "");
            setDbEngine(data.dbEngine ?? "");
            setEnvironment(data.environment ?? "");
            setUsername(data.username ?? "");
            setPassword(""); // Don't persist password for security
            setVerifyState(data.verifyState ?? "idle");
            setSslMode(data.sslMode ?? null);
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);


    // Save form data to localStorage on change
    useEffect(() => {
        // Skip saving if all fields are empty (initial state)
        if (!databaseName && !host && !port && !dbEngine && !environment && !username) {
            return;
        }

        const data = {
            databaseName,
            host,
            port,
            dbEngine,
            environment,
            username,
            verifyState,
            sslMode
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [databaseName, host, port, dbEngine, environment, username, verifyState, sslMode]);


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
                        message: "Database added successfully",
                    })

                    // Wait for user to see success message (3 seconds)
                    await new Promise(resolve => setTimeout(resolve, 1500))

                    localStorage.removeItem(STORAGE_KEY)
                    resetForm()

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
            if (!dbEngine) return;

            await verifyDryRun({
                connectionId: null,
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


    async function handleAddDatabase(e: React.FormEvent) {
        e.preventDefault()

        const errors = validateForm()
        if (errors.length > 0) {
            setFormErrors(errors)

            setStatusMessage({
                type: "error",
                message: errors[0] // Show first error
            });
            return
        }

        if (!isVerified) return

        setLoading(true)
        setError(null)

        try {
            if (!dbEngine) return;

            const db = await addDatabase({
                dbType: dbEngine,
                dbHost: host?.trim(),
                dbPort: port ? Number(port) : null,
                dbName: databaseName?.trim(),
                envTag: environment,
                dbUserName: username?.trim() || null,
                dbUserSecret: password?.trim() || null,
                sslMode: sslMode || null,
            })

            setStatusMessage({
                type: "success",
                message: "Database added. Verifying connection...",
            })

            // Wait for user to see success message (3 seconds)
            await new Promise(resolve => setTimeout(resolve, 1500))

            setConnectionId(db.id)


            //start backend verification
            const result = await verifyConnection(db.id)
            setBackendVerifyState(result.status)

        } catch (error) {
            console.error("Add database error:", error)
            setError("Failed to add database")
            setStatusMessage({
                type: "error",
                message: "Failed to add database",
            })
        } finally {
            setLoading(false)
        }
    }


    function resetForm() {
        setDatabaseName("")
        setHost("")
        setPort("")
        setDbEngine(null)
        setEnvironment("")
        setUsername("")
        setPassword("")
        setSslMode(null)

        setVerifyState("idle")
        setVerifyError(null)
        setError(null)
        setLoading(false)
    }


    //validations
    const validateForm = (): string[] => {
        return validateDatabaseConnection({
            databaseName,
            host,
            port,
            dbEngine,
            environment,
            username,
            password,
            sslMode,
        });
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
            <form onSubmit={handleAddDatabase} onClick={(e) => e.stopPropagation()} className="mx-auto w-full max-w-md max-h-[90vh] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg shadow-lg p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1" >
                    <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Add Database</span>
                    <span className="text-gray-500 dark:text-gray-400">
                        Fill in the details to add a new database connection
                    </span>
                </div>


                {/* Form fields container */}
                <div className="flex flex-col gap-4 max-w-md overflow-y-auto md:no-scrollbar flex-1 min-h-0">
                    {/* <div className="flex-1 min-h-0"></div> */}
                    <input
                        type="text"
                        value={databaseName}
                        disabled={isLocked}
                        onChange={(e) => setDatabaseName(e.target.value)}
                        placeholder="Database Name"
                        className="p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed"
                    />

                    <input
                        type="text"
                        value={host}
                        disabled={isLocked}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="Host"
                        className="p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed"
                    />

                    <input
                        type="number"
                        value={port === null ? "" : port}
                        disabled={isLocked}
                        onChange={(e) => {
                            const v = e.target.value;
                            setPort(v === "" ? null : Number(v));
                        }}
                        placeholder={dbEngine === "mongodb" ? "Not required for MongoDB Atlas" : "Port"}
                        className="p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-neutral-800"
                    />


                    {/* Database Engine */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="dbEngine" className="font-medium text-gray-700 dark:text-gray-300">
                            Database engine
                        </label>
                        <select
                            id="dbEngine"
                            value={dbEngine ?? ""}
                            disabled={isLocked}
                            onChange={(e) => setDbEngine(e.target.value === "" ? null : (e.target.value as DatabaseEngine))}
                            className="p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed"
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
                            <label htmlFor="sslMode" className="font-medium text-gray-700 dark:text-gray-300">
                                SSL Mode
                            </label>
                            <select
                                id="sslMode"
                                value={sslMode ?? "disable"}
                                disabled={isLocked}
                                onChange={(e) => setSslMode(e.target.value === "" ? null : (e.target.value as SSLMode))}
                                className="p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed"
                            >
                                {dbEngine === "postgresql" && (
                                    <>
                                        <option value="disable">Disable</option>
                                        <option value="prefer">Prefer</option>
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

                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Hosted databases usually require SSL.
                            </span>
                        </div>
                    )}


                    {/* Environment */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="environment" className="font-medium text-gray-700 dark:text-gray-300">
                            Environment
                        </label>
                        <select
                            id="environment"
                            value={environment}
                            disabled={isLocked}
                            onChange={(e) => setEnvironment(e.target.value)}
                            className="p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed"
                        >
                            <option value="">Select environment</option>
                            <option value="development">Development</option>
                            <option value="staging">Staging</option>
                            <option value="production">Production</option>
                        </select>
                    </div>

                    <input
                        type="text"
                        value={username}
                        disabled={isLocked}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed"
                    />

                    <input
                        type="password"
                        value={password}
                        disabled={isLocked}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="p-2 border border-gray-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed"
                    />
                </div>


                <div className="flex gap-3 mt-4 max-w-md">
                    <button
                        type="button"
                        onClick={handleVerify}
                        disabled={verifyState === "verifying" || backendVerifyState === "VERIFYING"}
                        className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {verifyState === "verifying" ? "Verifying..." : "Verify Connection"}
                    </button>

                    <button
                        type="submit"
                        disabled={!isVerified || loading || isLocked}
                        className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {backendVerifyState === "VERIFYING" ? "Verifying..." : loading ? "Adding..." : "Add Database"}
                    </button>
                </div>

                {/* Helper text */}
                <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="min-w-0">
                        For security best practices, create a dedicated database user with
                        backup-level permissions and provide those credentials here.
                    </span>
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

export default AddDatabaseModal;
