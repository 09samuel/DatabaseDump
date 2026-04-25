import { api } from "../lib/api"
import type { Backup } from "../pages/DatabaseDetails/types"
import { mapBackupFromApi } from "./backup.mapper"

export async function getBackups(id: string): Promise<Backup[]> {
  const res = await api.get(`/backups/${id}`)
  return res.data.data.map(mapBackupFromApi)
}

export async function getUserBackups(params: { cursor?: string | null; limit?: number; dbType?: string; environment?: string; status?: string; search?: string; sortBy?: string; sortOrder?: string }): Promise<{ data: Backup[]; nextCursor: string | null; hasMore: boolean;}> {
  const res = await api.get(`/backups/user`, {
    params
  });

  return {
    data: res.data.data.map(mapBackupFromApi),
    nextCursor: res.data.nextCursor,
    hasMore: res.data.hasMore
  };
}

export async function initiateBackup(dbId: string, payload: {backupType: string, backupName?: string | null}): Promise<void> {
  await api.post(`/backups/${dbId}`, payload)
}

export async function downloadBackup(backupId: string): Promise<{ url: string; checksum: string; algo: string }> {
  const res= await api.get(`backups/download/${backupId}`)
  return {
    url: res.data.downloadUrl,
    checksum: res.data.checksum,
    algo: res.data.checksumAlgo,
  };
}