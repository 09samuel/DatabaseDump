type DeleteBackupModalProps = {
    open: boolean;
    backupName: string | null;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

function DeleteBackupModal({ open, backupName, loading, onClose, onConfirm}: DeleteBackupModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-100 bg-black/80 flex items-center justify-center px-4"
            onClick={(e) => {
                if (e.target === e.currentTarget && !loading) onClose();
            }}
        >
        <div
            className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-md border border-gray-200 dark:border-neutral-800"
            onClick={(e) => e.stopPropagation()}
        >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Delete Backup</h2>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Delete <strong>{backupName ?? "Backup"}</strong> ?
            </p>

            <div className="flex gap-3 mt-5">
            <button type="button" className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed" onClick={onClose} disabled={loading}>
                Cancel
            </button>

            <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {loading ? "Deleting..." : "Delete"}
            </button>
            </div>
        </div>
        </div>
    );
}

export default DeleteBackupModal;