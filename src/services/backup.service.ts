import { api } from "../lib/api"
import type { Backup } from "../pages/DatabaseDetails/types"
import { mapBackupFromApi } from "./backup.mapper"

export async function getBackups(id: string): Promise<Backup[]> {
  const res = await api.get(`/backups/${id}`)
  return res.data.data.map(mapBackupFromApi)
}

export async function initiateBackup(dbId: string, payload: {backupType: string, backupName?: string | null}): Promise<void> {
  await api.post(`/backups/${dbId}`, payload)
}

export async function downloadBackup(backupId: string): Promise<string> {
  const res= await api.get(`backups/download/${backupId}`)
  return res.data.downloadUrl
}