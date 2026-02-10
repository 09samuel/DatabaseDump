import { useEffect, useState } from "react";
import type { Backup } from "../../DatabaseDetails/types";
import { getBackups } from "../../../services/backup.service";
import { useParams } from "react-router-dom";
import BackupItem from "../backups/BackupItem";
import ErrorState from "../../Databases/components/ErrorState";
import EmptyState from "../../Databases/components/EmptyState";
import { DatabaseBackup } from "lucide-react";

function DatabaseBackupsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string |null>(null)
  const [backups, setBackups] = useState<Backup[]>();


  const { id } = useParams<{ id: string }>();


  useEffect( ()=> {
    const fetchBackups = async () => {
      setLoading(true)
      try{
        if (!id) {
          throw new Error("Database ID is missing in URL parameters.");
        }

        const data = await getBackups(id)
        setBackups(data)
      } catch(error){
        setError("Error fetching database overview data")
        console.error("Error fetching database overview data:", error);
      } finally{
        setLoading(false)
      }
    }

    fetchBackups()
  },[id])


  if (error && !loading) {
    return (
      <ErrorState errorMessage={error} />
    );
  }

  if ( backups?.length === 0 && !loading) {
    return (
      <EmptyState icon={ DatabaseBackup} mainMessage={"No backups found"} subMessage={"Get started by creating your first backup"} />
    );
  }


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 me-2 mb-4 pb-24 md:pb-0">
      {loading
        ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-65 rounded-xl border bg-gray-200 animate-pulse" />
          ))
        : backups?.map((b) => (
            <BackupItem key={b.backupId} {...b} dbId={id!}/>
          ))}
    </div>
  );

}

export default DatabaseBackupsTab;