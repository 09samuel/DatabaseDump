import type { BackupStatus, BackupType, StorageTarget } from "../Databases/types";

export type BackupSettings = {
  connectionId: string;

  engine: "PostgreSQL" | "MySQL" | "MongoDB";

  // Storage
  storageTarget: "S3" | "LOCAL";
  s3Bucket: string | null;
  s3Region: string | null;
  backupUploadRoleArn: string | null;
  backupRestoreRoleArn: string | null;
  backupDeleteRoleArn: string | null;
  localStoragePath: string | null;

  // Retention
  retentionEnabled: boolean;
  retentionMode: "COUNT" | "DAYS" | "NONE" | null;
  retentionValue: number | null;

  // Defaults
  defaultBackupType: BackupType

  // Scheduling
  schedulingEnabled: boolean;
  cronExpression: string | null;

  // Limits
  timeoutMinutes: number | null;

  createdAt: Date | null;
  updatedAt: Date | null;
};


export type Backup = {
  backupId: string;

  // Artifact fields (only for COMPLETED)
  backupName: string | null;
  backupType: BackupType | null;
  backupSizeBytes: number | null;
  storageTarget: StorageTarget | null;
  storagePath: string | null;

  // Job metadata
  status: BackupStatus;
  createdAt: string; 
  startedAt: string | null;
  error: string | null;
};

