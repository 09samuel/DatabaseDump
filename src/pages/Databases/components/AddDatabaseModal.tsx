import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import type { BackendVerifyState, VerifyState } from "../types";
import { addDatabase, getConnectionStatus, verifyConnection, verifyDryRun } from "../../../services/database.service";
import StatusBar from "../../../components/StatusBar/StatusBar";

type AddDatabaseModalProps = {
    onClose: () => void
    onSuccess: () => void
}

function AddDatabaseModal({ onClose, onSuccess }: AddDatabaseModalProps) {
    const [databaseName, setDatabaseName] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState<number | string>("");
    const [dbEngine, setDbEngine] = useState("");
    const [environment, setEnvironment] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

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
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [databaseName, host, port, dbEngine, environment, username, verifyState]);


    // Reset verification state when credentials change
    useEffect(() => {
        if (verifyState === "success") {
            setVerifyState("idle");
        }
    }, [databaseName, host, port, dbEngine, username, password]);


    //clear form errors on input change
    useEffect(() => {
        if (formErrors.length > 0) {
            setFormErrors([])
        }
    }, [databaseName, host, port, dbEngine, environment, username, password])



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
            await verifyDryRun({
                dbType: dbEngine,
                dbHost: host,
                dbPort: Number(port),
                dbName: databaseName,
                dbUserName: username,
                dbUserSecret: password,
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
            const db = await addDatabase({
                dbType: dbEngine,
                dbHost: host,
                dbPort: Number(port),
                dbName: databaseName,
                envTag: environment,
                dbUserName: username,
                dbUserSecret: password,
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
        setDbEngine("")
        setEnvironment("")
        setUsername("")
        setPassword("")

        setVerifyState("idle")
        setVerifyError(null)
        setError(null)
        setLoading(false)
    }


    //validations
    const validateForm = (): string[] => {
        const errors: string[] = [];

        const trimmedDatabaseName = databaseName.trim();
        const trimmedHost = host.trim();
        const trimmedUsername = username.trim();
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
        if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
            errors.push("Port must be a valid number between 1–65535");
        }

        // Engine: required
        if (!dbEngine) {
            errors.push("Database engine is required");
        }

        // Environment: required
        if (!environment) {
            errors.push("Environment is required");
        }

        // Username: required, 1–64 chars
        if (!trimmedUsername) {
            errors.push("Username is required");
        } else if (trimmedUsername.length > 64) {
            errors.push("Username must be at most 64 characters");
        }

        // Password: required, 1–128 chars
        if (!trimmedPassword) {
            errors.push("Password is required");
        } else if (trimmedPassword.length > 128) {
            errors.push("Password must be at most 128 characters");
        }

        return errors;
    };




    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
       
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
        >
            <form  onSubmit={handleAddDatabase} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-lg">
                <div className="flex flex-col gap-1" >
                    <span className="text-2xl font-semibold">Add Database</span>
                    <span className="text-[#8e9c97]">
                        Fill in the details to add a new database connection
                    </span>
                </div>
            

                {/* Form fields container */}
                <div className="flex flex-col gap-4 max-w-md">
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
                        value={port}
                        disabled={isLocked}
                        onChange={(e) => setPort(e.target.value)}  
                        placeholder="Port"
                        className="p-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />

                    {/* Database Engine */}
                    <div className="flex flex-col gap-1">
                    <label htmlFor="dbEngine" className="font-medium">
                        Database engine
                    </label>
                    <select
                        id="dbEngine"
                        value={dbEngine}
                        disabled={isLocked}
                        onChange={(e) => setDbEngine(e.target.value)} 
                        className="p-2 border border-gray-300 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="">Select engine</option>
                        <option value="postgresql">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                        <option value="mongodb">MongoDB</option>
                    </select>
                    </div>

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
                        value={username}
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
                        {backendVerifyState === "VERIFYING" ? "Verifying...": loading ? "Adding..." : "Add Database"}
                    </button>
                </div>

                {/* Helper text */}
                <div className="flex items-start gap-2 text-sm text-gray-500 max-w-md">
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
