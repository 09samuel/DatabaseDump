import { useState } from "react"
import { deleteDatabase } from "../../../services/database.service"
import StatusBar from "../../../components/StatusBar/StatusBar";


type DeleteDatabaseModalProps = {
    dbId: string
    dbName: string
    onClose: () => void
    onSuccess: () => void
}

function DeleteDatabaseModal({ dbId, dbName, onClose, onSuccess }: DeleteDatabaseModalProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

    const handleDelete = async () => {
        try {
            setLoading(true);

            await deleteDatabase(dbId);

            setStatusMessage({
                type: "success",
                message: "Database deleted successfully",
            })

            onSuccess()
            setLoading(false);
            onClose();
        } catch (error) {
            setStatusMessage({
                type: "error",
                message: "Database deletion failed",
            })


            setLoading(false);
        }
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
            <div className="flex flex-col items-center gap-6 bg-white p-6 rounded-lg shadow-lg w-96 z-50 ">
                <span>Do you really want to delete database {dbName}?</span>

                <div className="flex gap-4">
                    <button 
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={loading}
                        onClick={onClose} 
                    >
                        Cancel
                    </button>
                    <button 
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={loading}
                        onClick={handleDelete}
                    >
                        {loading ? "Deleting..." : "Confirm Delete"}
                    </button>
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

export default DeleteDatabaseModal
