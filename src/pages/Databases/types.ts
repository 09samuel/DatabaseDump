export type ConnectionStatus = "Active" | "SettingUp" | "Error"

export type BackendVerifyState = "CREATED" | "VERIFYING" | "VERIFIED" | "ERROR"

export type BackupStatus = "Queued" | "Running" | "Success" | "Failed"

export type PageState = "loading" | "loaded" | "empty" | "error"

export type VerifyState = "idle" | "verifying" | "success" | "error"

export type BackupType = "FULL" | "STRUCTURE_ONLY" | "DATA_ONLY"
  
export type StorageTarget = "LOCAL_DESKTOP" | "LOCAL_TMP" | "S3"

export type DatabaseEngine = "postgresql" | "mysql" | "mongodb"

export type PostgresSSLMode = "disable" | "require" | "verify-ca" | "verify-full"

export type MySQLSSLMode = "disable" | "require"

export type SSLMode = PostgresSSLMode | MySQLSSLMode

export type Database = {
  id: string
  name: string
  engine: DatabaseEngine
  environment: string
  status: ConnectionStatus
  lastBackupAt: string | null
  backupStatus: BackupStatus | null
  storageUsedGB: number
}

export type DatabaseDetails = {
  dbName: string
  dbHost: string
  dbPort: number | null
  dbEngine: DatabaseEngine
  environment: string
  dbUsername: string | null
  sslMode: SSLMode | null
}

export type DatabaseBasicDetails = {
  name: string,
  engine: DatabaseEngine,
  environment: string,
  status: ConnectionStatus,
}

export type UpdateDatabasePayload = Partial<{
  dbName: string
  dbHost: string
  dbPort: number | null
  dbEngine: DatabaseEngine
  environment: string
  dbUsername: string | null
  dbUserSecret: string | null
  sslMode: SSLMode | null
}>

export type Stats = {
  totalDatabases: number
  activeDatabases: number
  backedUpDatabases: number
  lastBackupStatus: BackupStatus | null
  storageUsedGB: string
}

export type AddDatabasePayload = {
  dbType: DatabaseEngine
  dbHost: string
  dbPort: number | null
  dbName: string
  envTag: string
  dbUserName: string | null
  dbUserSecret: string | null
  sslMode: SSLMode | null
}

export type VerifyDryRunPayload = {
  connectionId: string | null
  dbType: DatabaseEngine
  dbHost: string
  dbPort: number | null
  dbName: string
  dbUserName: string | null;
  dbUserSecret: string | null
  sslMode: SSLMode | null
}

export type BackupCapabilitiesResponse = {
  allowed: boolean;
  engine: DatabaseEngine;
  reason: string | null;

  modes: BackupType;
  formats: Array<"CUSTOM" | "PLAIN" | "ARCHIVE">;
  compression: boolean;
};

export type DatabaseOverview = {
  name: string
  engine: DatabaseEngine
  environment: string
  host: string
  port: string | number
  status: string
  sslMode: SSLMode | null
  lastBackupAt: string | null
  lastBackupStatus: string | null
  lastStorageTarget: string
  totalstorageUsed: number
}