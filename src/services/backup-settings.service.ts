import { api } from "../lib/api"
import type { BackupSettings } from "../pages/DatabaseDetails/types"
import { mapBackupSettingsFromApi } from "./backup-settings.mapper"


export async function getBackupSettings(id: string): Promise<BackupSettings | null> {
  const res = await api.get(`/backup-settings/${id}`)
  return mapBackupSettingsFromApi(res.data.data)
}

export async function updateBackupSettings( id: string, payload: Partial<BackupSettings>): Promise<Partial<BackupSettings>> {
  const { data } = await api.patch(`/backup-settings/${id}`, payload);
  return data;
}
