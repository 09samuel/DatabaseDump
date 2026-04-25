import { api } from "../lib/api";
import type { CollaboratorRoles } from "../pages/Databases/types"

export async function addCollaborator(databaseId: string, email: string, role: CollaboratorRoles): Promise<{message: string}> {
    const res = await api.post(`/collaborators/connection/${databaseId}`, { email, role });
    return res.data;
}

export async function getCollaborators(databaseId: string): Promise<{ id: string; name:string; email: string, role: CollaboratorRoles }[]> {
    const res = await api.get(`/collaborators/connection/${databaseId}`);
    return res.data;
}

export async function updateCollaboratorRole(databaseId: string, userId: string, role: CollaboratorRoles): Promise<{ message: string }> {
    const res = await api.patch(`/collaborators/connection/${databaseId}/${userId}`, { role });
    return res.data;
}

export async function deleteCollaborator(databaseId: string, userId: string): Promise<{ message: string }> {
    const res = await api.delete(`/collaborators/connection/${databaseId}/${userId}`);
    return res.data;
}