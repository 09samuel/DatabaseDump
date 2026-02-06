import type { BackupType } from "../pages/Databases/types";
import type { BackupSettings } from "../pages/DatabaseDetails/types";
import { normalizeEngine } from "./database.mapper";

type ApiBackupSettings = {
  connection_id: string;

  db_type: string;

  // Storage
  storage_target: "S3" | "LOCAL";
  s3_bucket: string | null;
  s3_region: string | null;
  backup_upload_role_arn: string | null;
  backup_restore_role_arn: string | null
  backup_delete_role_arn: string | null
  local_storage_path: string | null;

  // Retention
  retention_enabled: boolean
  retention_mode: "COUNT" | "DAYS";
  retention_value: number;

  // Defaults
  default_backup_type: BackupType

  // Scheduling
  scheduling_enabled: boolean;
  cron_expression: string | null;

  // Limits
  timeout_minutes: number | null;

  // Metadata
  created_at: string;
  updated_at: string;
};


export function mapBackupSettingsFromApi( api: ApiBackupSettings ): BackupSettings {
  return {
    connectionId: api.connection_id,

    engine: normalizeEngine(api.db_type),

    storageTarget: api.storage_target,
    s3Bucket: api.s3_bucket,
    s3Region: api.s3_region,
    backupUploadRoleArn: api.backup_upload_role_arn,
    backupRestoreRoleArn: api.backup_restore_role_arn,
    backupDeleteRoleArn: api.backup_delete_role_arn,
    localStoragePath: api.local_storage_path,

    retentionEnabled: api.retention_enabled,
    retentionMode: api.retention_mode,
    retentionValue: api.retention_value,

    defaultBackupType: api.default_backup_type,

    schedulingEnabled: api.scheduling_enabled,
    cronExpression: api.cron_expression,

    timeoutMinutes: api.timeout_minutes,

    createdAt: new Date(api.created_at),
    updatedAt: new Date(api.updated_at),
  };
}
