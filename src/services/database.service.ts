import type { AddDatabasePayload, BackendVerifyState, BackupCapabilitiesResponse, Database, DatabaseBasicDetails, DatabaseDetails, DatabaseOverview, UpdateDatabasePayload, VerifyDryRunPayload } from "../pages/Databases/types"
import { api } from "../lib/api"
import { mapDatabaseBasicDetailsFromApi, mapDatabaseDetailsFromApi, mapDatabaseFromApi, mapDatabaseOverviewFromApi } from "./database.mapper"

export async function fetchDatabases(): Promise<Database[]> {
  const res = await api.get("/connections/summary")
  return res.data.data.map(mapDatabaseFromApi)
}

export async function addDatabase(payload: AddDatabasePayload): Promise<Database> {
  const res = await api.post("/connections", payload)
  return mapDatabaseFromApi(res.data.connection)  
}

export async function verifyDryRun(payload: VerifyDryRunPayload): Promise<void> {
  await api.post("/connections/verify-dry-run", payload)
}

export async function deleteDatabase(dbId: string): Promise<void> {
  await api.delete(`/connections/${dbId}`)
}

export async function getDatabaseDetails(dbId: string): Promise<DatabaseDetails> {
  const res = await api.get(`/connections/${dbId}`)
  return mapDatabaseDetailsFromApi(res.data.data)
}

export async function updateDatabase(dbId: string, payload: Partial<UpdateDatabasePayload>): Promise<void> {
  await api.patch(`/connections/${dbId}`, payload)
}

export async function verifyConnection(dbId: string): Promise<{ status: BackendVerifyState }> {
  const res = await api.post(`/connections/${dbId}/verify`)
  return res.data
}

export async function getConnectionStatus( dbId: string): Promise<{status: BackendVerifyState; errorMessage?: string | null}> {
  const res = await api.get(`/connections/${dbId}/status`)
  return res.data
}

export async function getConnectionOverview( dbId: string): Promise<DatabaseOverview> {
  const res = await api.get(`/connections/${dbId}/overview`)
  return mapDatabaseOverviewFromApi(res.data.data)
}

export async function getConnectionBasicDetails( dbId: string): Promise<DatabaseBasicDetails> {
  const res = await api.get(`/connections/${dbId}/basic-details`)
  return mapDatabaseBasicDetailsFromApi(res.data.data)
}

export async function getBackupCapabilities(dbId: string): Promise<BackupCapabilitiesResponse> {
  const res = await api.get(`/backups/${dbId}/capabilities`)
  return res.data
}
