import type { BackupStatus, ConnectionStatus, Database, DatabaseBasicDetails, DatabaseDetails, DatabaseOverview, DatabaseEngine, SSLMode } from "../pages/Databases/types"

type ApiDatabase = {
  id: string
  db_name: string
  db_type: string
  env_tag: string
  status: string
  lastBackupAt: string | null
  backupStatus: string | null
  storageUsedGB: number
}

type ApiDatabaseDetails = {
  dbName: string
  dbHost: string
  dbPort: number | null
  dbEngine: string
  environment: string
  dbUsername: string | null
  sslMode: string | null
}

type ApiDatabaseOverview = {
  db_name: string
  db_type: string
  env_tag: string
  db_host: string
  db_port: string | number
  status: string
  ssl_mode: string | null
  last_backup_at: string | null
  last_storage_target: string
  storage_used_bytes: number
}

type ApiDatabseBasicDetails = {
  db_name: string,
  db_type: string, 
  env_tag: string, 
  status: ConnectionStatus
}

export function mapDatabaseFromApi(db: ApiDatabase): Database {
  return {
    id: db.id,
    name: db.db_name,
    engine: normalizeEngine(db.db_type),
    environment: db.env_tag,
    status: normalizeStatus(db.status),
    lastBackupAt: db.lastBackupAt,
    backupStatus: normalizeBackupStatus(db.backupStatus),
    storageUsedGB: db.storageUsedGB,
  }
}

export function mapDatabaseDetailsFromApi(db: ApiDatabaseDetails): DatabaseDetails {
  return {
    dbName: db.dbName,
    dbHost: db.dbHost,
    dbPort: db.dbPort,
    dbEngine: normalizeEngine(db.dbEngine),
    environment: db.environment,
    dbUsername: db.dbUsername,
    sslMode: normalizeSSLMode(db.sslMode)
  }
}

export function mapDatabaseOverviewFromApi(db: ApiDatabaseOverview): DatabaseOverview{
  return{
    name: db.db_name,
    engine: normalizeEngine(db.db_type),
    environment: db.env_tag,
    host: db.db_host,
    port: db.db_port,
    status: normalizeStatus(db.status),
    lastBackupAt: db.last_backup_at,
    lastBackupStatus: "Success",
    lastStorageTarget: db.last_storage_target,
    totalstorageUsed: db.storage_used_bytes,
    sslMode: normalizeSSLMode(db.ssl_mode)
  }
    
}

export function mapDatabaseBasicDetailsFromApi(db: ApiDatabseBasicDetails): DatabaseBasicDetails {
  return {
    name: db.db_name,
    engine: normalizeEngine(db.db_type),
    environment: db.env_tag,
    status: normalizeStatus(db.status),
  }
}


export function normalizeEngine(engine: string): DatabaseEngine {
  switch (engine.toUpperCase()) {
    case "POSTGRES":
    case "POSTGRESQL":
      return "postgresql"
    case "MYSQL":
      return "mysql"
    case "MONGODB":
      return "mongodb"
    default:
      throw new Error(`Unknown engine: ${engine}`)
  }
}


function normalizeStatus(status: string): ConnectionStatus {
  switch (status) {
    case "CREATED":
    case "VERIFYING":
      return "SettingUp"

    case "VERIFIED":
      return "Active"

    case "ERROR":
      return "Error"

    default:
      throw new Error(`Unknown connection status: ${status}`)
  }
}

function normalizeBackupStatus(status: string | null ): BackupStatus | null {
  if (!status) return null

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

function normalizeSSLMode(mode: string | null): SSLMode | null {
  if (!mode) return null;

  switch (mode) {
    case "disable":
    case "require":
    case "verify-ca":
    case "verify-full":
      return mode;
    default:
      throw new Error(`Unknown SSL mode: ${mode}`);
  }
}
