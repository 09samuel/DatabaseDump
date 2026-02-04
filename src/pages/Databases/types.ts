export type ConnectionStatus = "Active" | "SettingUp" | "Error"

export type BackendVerifyState = "CREATED" | "VERIFYING" | "VERIFIED" | "ERROR"

export type BackupStatus = "Queued" | "Running" | "Success" | "Failed"

export type Database = {
  id: string
  name: string
  engine: "PostgreSQL" | "MySQL" | "MongoDB"
  environment: string
  status: ConnectionStatus
  lastBackupAt: string | null
  backupStatus: BackupStatus | null
  storageUsedGB: number
}

export type DatabaseDetails = {
  dbName: string
  dbHost: string
  dbPort: number
  dbEngine: "PostgreSQL" | "MySQL" | "MongoDB"
  environment: string
  dbUsername: string
}

export type DatabaseBasicDetails = {
    name: string,
    engine: "PostgreSQL" | "MySQL" | "MongoDB",
    environment: string,
    status: ConnectionStatus,
}

export type UpdateDatabasePayload = Partial<{
  dbName: string
  dbHost: string
  dbPort: number
  dbEngine: string
  environment: string
  dbUsername: string
  dbUserSecret: string
}>


export type PageState = "loading" | "loaded" | "empty" | "error"

export type Stats = {
  totalDatabases: number
  activeDatabases: number
  backedUpDatabases: number
  lastBackupStatus: BackupStatus | null
  storageUsedGB: string
}

export type AddDatabasePayload = {
  dbType: string
  dbHost: string
  dbPort: number
  dbName: string
  envTag: string
  dbUserName: string
  dbUserSecret: string
}

export type VerifyDryRunPayload = {
  dbType: string
  dbHost: string
  dbPort: number
  dbName: string
  dbUserName: string
  dbUserSecret: string
}

export type VerifyState = "idle" | "verifying" | "success" | "error"

export type BackupType = "FULL" | "STRUCTURE_ONLY" | "DATA_ONLY"
  
export type StorageTarget = "LOCAL_DESKTOP" | "LOCAL_TMP" | "S3"

export type BackupCapabilitiesResponse = {
  allowed: boolean;
  engine: "PostgreSQL" | "MySQL" | "MongoDB";
  reason: string | null;

  modes: BackupType;
  formats: Array<"CUSTOM" | "PLAIN" | "ARCHIVE">;
  compression: boolean;
};

export type DatabaseOverview = {
  name: string
  engine: string
  environment: string
  host: string
  port: string | number
  status: string
  lastBackupAt: string | null
  lastBackupStatus: string | null
  lastStorageTarget: string
  totalstorageUsed: number
}

