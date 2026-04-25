import { useEffect, useState } from "react";

type RenameBackupModalProps = {
    open: boolean;
    backupName: string | null;
    loading: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
};

function RenameBackupModal({ open, backupName, loading, onClose, onConfirm}: RenameBackupModalProps) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (open) setName(backupName ?? "");
    }, [open, backupName]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-100 bg-black/80 flex items-center justify-center px-4"
            onClick={(e) => {
                if (e.target === e.currentTarget && !loading) onClose();
            }}
        >
            <div
                className="bg-white rounded-lg p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-semibold">Rename Backup</h2>

                <input
                    value={name}
                    maxLength={64}
                    disabled={loading}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-4 w-full border rounded p-2"
                />

                <div className="flex gap-3 mt-5">
                    <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>

                    <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
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