import { useEffect, useState } from "react";
import type { Backup } from "../../DatabaseDetails/types"
import BackupActionsMenu from "./BackupActionsMenu";
import { requestRestore } from "../../../services/restore.service";
import { Download } from "lucide-react";
import { downloadBackup } from "../../../services/backup.service";
import StatusBar from "../../../components/StatusBar/StatusBar";

type BackupItemProps = Backup & {
  dbId: string;
};


function BackupItem({ backupId, dbId, backupName, backupType, backupSizeBytes, storageTarget, status, createdAt, startedAt, error} : BackupItemProps){
    const [restoring, setRestoring] = useState(false);
    const [restoreError, setRestoreError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    const canRestore = status === "Success" && backupType === "FULL";
    const canDownload = status === "Success" && storageTarget == "S3"; 

    //const timeoutRef = useRef<number | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error";  message: string;} | null>(null);

    //To auto-clear status message
    useEffect(() => {
        if (!statusMessage) return;
        const t = setTimeout(() => setStatusMessage(null), 3000);
        return () => clearTimeout(t);
    }, [statusMessage]);

  
    async function onRestore() {
        if(restoring) return

        try {
            setRestoring(true);
            setRestoreError(null);

            await requestRestore(dbId, backupId);

            setStatusMessage({
                type: "success",
                message: "Database restoration started successfully",
            });

        } catch (err: any) {
            setRestoreError(err.message ?? "Failed to start restore");
            setStatusMessage({type: "error", message: err?.response?.data?.message || err?.response?.data?.error || err?.message || "Failed to start restore"})
        } finally {
            setRestoring(false);
        }
    }

    async function onDownload() {
        try {
            setDownloading(true);

            const url = await downloadBackup(backupId);
            window.location.href = url;

            setStatusMessage({
                type: "success",
                message: "Download successful",
            });

        } catch (err: any) {
            alert(err.message ?? "Failed to download backup");
            setStatusMessage({type: "error", message: err?.response?.data?.message || "Failed to download backup"})
        } finally {
            setDownloading(false);
        }
    }

    
    return(
        <>
        <div className="rounded-xl border bg-white p-5 flex flex-col justify-between h-65">
            {/* Header */}
            {/* <div>
                <h3 className="text-sm font-semibold text-gray-800 truncate">
                {backupName ?? "Backup"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    {new Date(createdAt).toLocaleString()}
                </p>
            </div> */}

            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {backupName ?? "Backup"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(createdAt).toLocaleString()}
                    </p>
                </div>

                <BackupActionsMenu status={status} />
            </div>


            {/* Content */}
            <dl className="mt-4 space-y-2 text-sm">
                <Row label="Status">
                    <StatusBadge status={status} />
                </Row>

                <Row label="Type">
                    {backupType ?? "—"}
                </Row>

                <Row label="Size">
                    {backupSizeBytes != null ? convertBytesToGB(backupSizeBytes) : "—"}
                </Row>

                <Row label="Storage">
                    {storageTarget ?? "—"}
                </Row>

                <Row label="Started">
                    {startedAt ? new Date(startedAt).toLocaleTimeString() : "—"}
                </Row>
            </dl>

            {/* Footer */}
            <div className="mt-4 h-9 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {canRestore && (
                        <button
                            onClick={onRestore}
                            disabled={restoring}
                            className="text-sm text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:pointer-events-none"
                        >
                            {restoring ? "Restoring…" : "Restore"}
                        </button>
                    )}

                    {canDownload && (
                        <button
                            onClick={onDownload}
                            title="Download backup file"
                            disabled={downloading || restoring}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:pointer-events-none"
                        >
                            <Download size={14} />
                            {downloading ? "Downloading…" : "Download"}
                        </button>
                    )}
                </div>

                {status === "Failed" && (
                    <span
                    className="text-xs text-red-600 truncate"
                    title={error ?? undefined}
                    >
                    Failed
                    </span>
                )}

                {(status === "Queued" || status === "Running") && (
                    <span className="text-xs text-gray-400">
                    In progress…
                    </span>
                )}
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

function convertBytesToGB(bytes?: number | null): string {
    if (!bytes || bytes <= 0) return "0 GB";
    return `${(bytes / (1024 ** 3)).toFixed(2)} GB`;
}


function Row({label, children}: {label: string; children: React.ReactNode;}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-800 truncate text-right">
        {children}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: Backup["status"] }) {
  let className = "";

  switch (status) {
    case "Success":
      className = "text-green-600";
      break;
    case "Failed":
      className = "text-red-600";
      break;
    case "Running":
      className = "text-blue-600";
      break;
    case "Queued":
      className = "text-gray-500";
      break;
  }

  return <span className={className}>{status}</span>;
}

export default BackupItem