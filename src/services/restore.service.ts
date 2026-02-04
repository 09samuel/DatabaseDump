import { api } from "../lib/api"
import type { ApiRestore } from "./restore.mapper";

export async function requestRestore(dbId: string, backupId: string): Promise<ApiRestore> {
    const response = await api.post(`/restore/${dbId}/${backupId}` );
    return response.data;
}
