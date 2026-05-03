import { useState, useRef, useEffect } from "react";
import type { BackupStatus } from "../../Databases/types";
import { EllipsisVertical } from "lucide-react";
import StatusBar from "../../../components/StatusBar/StatusBar";
import { deleteBackup, renameBackup } from "../../../services/backup.service";
import DeleteBackupModal from "./DeleteBackupModal";
import RenameBackupModal from "./RenameBackupModal";

type BackupActionsMenuProps = {
    backupId: string;
    backupName: string | null;
    status: BackupStatus;
    onActionSuccess: () => void;
};

function BackupActionsMenu({ backupId, backupName, status, onActionSuccess }: BackupActionsMenuProps) {
    const [open, setOpen] = useState(false);
    const [modal, setModal] = useState<"rename" | "delete" | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    // close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!statusMessage) return;
        const t = setTimeout(() => setStatusMessage(null), 3000);
        return () => clearTimeout(t);
    }, [statusMessage]);

    async function handleRename(nextName: string) {
        const trimmedName = nextName.trim();

        if (!trimmedName) {
            setStatusMessage({ type: "error", message: "Backup name is required" });
            return;
        }

        if (trimmedName.length > 64) {
            setStatusMessage({ type: "error", message: "Backup name must be 64 characters or less" });
            return;
        }

        try {
            setLoading(true);
            await renameBackup(backupId, trimmedName);
            setStatusMessage({ type: "success", message: "Backup renamed successfully" });
            onActionSuccess();
            setModal(null);
        } catch (error) {
            setStatusMessage({ type: "error", message: "Failed to rename backup" });
            console.error("Rename backup failed", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        try {
            setLoading(true);
            await deleteBackup(backupId);
            setStatusMessage({ type: "success", message: "Backup deleted successfully" });
            onActionSuccess();
            setModal(null);
        } catch (error) {
            setStatusMessage({ type: "error", message: "Failed to delete backup" });
            console.error("Delete backup failed", error);
        } finally {
            setLoading(false);
        }
    }

    const baseItem = "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200";
    const dangerItem = "w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20";

    return (
        <>
            <div className="relative" ref={ref}>
                <button
                onClick={() => setOpen(!open)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                aria-label="Backup actions"
                title="Backup actions"
                >
                <EllipsisVertical className="h-4 w-4" />
                </button>

                {open && (
                    <div className="absolute right-0 w-28 rounded-md border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md z-10">
                        <ul className="py-1">
                            <li>
                                <button
                                className={baseItem}
                                onClick={() => {
                                    setOpen(false);
                                    setModal("rename");
                                }}
                                >
                                Rename
                                </button>
                            </li>
                            <hr className="my-1" />
                                    
                            <li>
                                <button
                                    className={dangerItem}
                                    onClick={() => {
                                        setOpen(false);
                                        setModal("delete");
                                    }}
                                >
                                    Delete
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            <RenameBackupModal
                open={modal === "rename"}
                backupName={backupName}
                loading={loading}
                onClose={() => setModal(null)}
                onConfirm={handleRename}
            />

            <DeleteBackupModal
                open={modal === "delete"}
                backupName={backupName}
                loading={loading}
                onClose={() => setModal(null)}
                onConfirm={handleDelete}
            />

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

export default BackupActionsMenu;
