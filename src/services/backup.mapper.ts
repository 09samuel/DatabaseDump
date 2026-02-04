import type { BackupStatus, BackupType, StorageTarget } from "../pages/Databases/types";
import type { Backup } from "../pages/DatabaseDetails/types";

type ApiBackup ={
     id: string;
     backup_name: string | null;
     backup_type: string | null;
     backup_size_bytes: number | null;
     storage_target: string | null;
     storage_path: string | null;
     status: string;
     created_at: string; 
     started_at: string | null;
     error: string | null;
}

export function mapBackupFromApi(b: ApiBackup): Backup {
  return {
    backupId: b.id,

    backupName: b.backup_name,
    backupType: b.backup_type as BackupType | null,
    backupSizeBytes: b.backup_size_bytes,
    storageTarget: b.storage_target as StorageTarget | null,
    storagePath: b.storage_path,

    status: normalizeBackupStatus(b.status),
    createdAt: b.created_at,
    startedAt: b.started_at,
    error: b.error,
  };
}


function normalizeBackupStatus(status: string ): BackupStatus {
  switch (status) {
    case "QUEUED":
      return "Queued"
    case "RUNNING":
      return "Running"
    case "COMPLETED":
      return "Success"
    case "FAILED":
      return "Failed"
    default:
      throw new Error(`Unknown backup status: ${status}`)
  }
}