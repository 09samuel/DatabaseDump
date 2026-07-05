import { useState } from "react";

type RenameBackupModalProps = {
    open: boolean;
    backupName: string | null;
    loading: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
};

function RenameBackupModal({ open, backupName, loading, onClose, onConfirm}: RenameBackupModalProps) {
    const [prevBackupName, setPrevBackupName] = useState(backupName);
    const [name, setName] = useState(backupName ?? "");

    if (backupName !== prevBackupName) {
        setPrevBackupName(backupName);
        setName(backupName ?? "");
    }

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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Rename Backup</h2>

                <input
                    value={name}
                    maxLength={64}
                    disabled={loading}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-4 w-full border border-gray-200 dark:border-neutral-700 rounded p-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-gray-100"
                />

                <div className="flex gap-3 mt-5">
                    <button className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>

                    <button className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={loading}
                        onClick={() => onConfirm(name)}
                    >
                        {loading ? "Renaming..." : "Rename"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RenameBackupModal;