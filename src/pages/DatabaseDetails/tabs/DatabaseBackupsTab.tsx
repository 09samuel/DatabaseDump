import { useCallback, useEffect, useState } from "react";
import type { Backup } from "../../DatabaseDetails/types";
import { getBackups } from "../../../services/backup.service";
import { useParams } from "react-router-dom";
import BackupItem from "../backups/BackupItem";
import ErrorState from "../../Databases/components/ErrorState";
import EmptyState from "../../Databases/components/EmptyState";
import { DatabaseBackup } from "lucide-react";
import StatusBar from "../../../components/StatusBar/StatusBar";

function DatabaseBackupsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backups, setBackups] = useState<Backup[]>();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)


  const { id } = useParams<{ id: string }>();

  const fetchBackups = useCallback(async () => {
    if (!id) {
      setError("Database ID is missing in URL parameters.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getBackups(id);
      setBackups(data);
    } catch (error) {
      setError("Error fetching database backups data");
      setStatusMessage({ type: "error", message: "Error fetching database backups data" });
      console.error("Error fetching database backups data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  //To automatically clear status messages after 3 seconds
  useEffect(() => {
    if (!statusMessage) return

    const t = setTimeout(() => setStatusMessage(null), 3000)
    return () => clearTimeout(t)
  }, [statusMessage])

  if (error && !loading) {
    return <ErrorState errorMessage={error} />;
  }

  if (backups?.length === 0 && !loading) {
    return (
      <EmptyState icon={DatabaseBackup} mainMessage={"No backups found"} subMessage={"Get started by creating your first backup"} />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 me-2 mb-4 pb-24 md:pb-0 text-gray-900 dark:text-gray-100">
      {loading
        ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-65 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-200 dark:bg-neutral-800 animate-pulse" />
          ))
        : backups?.map((b) => (
            <BackupItem key={b.backupId} {...b} dbId={id!} onBackupUpdated={fetchBackups} />
          ))}

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

export default DatabaseBackupsTab;
