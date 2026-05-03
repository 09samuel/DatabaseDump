import { api } from '../lib/api';
import { mapAuditLogFromApi, type ApiAuditLog } from './audit-logs.mapper';
import type { AuditLog } from '../pages/AuditLogs/types';

export async function fetchAuditLogsByConnection(connectionId: string,params: {
    cursor?: string | null;
    limit?: number;
    role?: string;
    actionCategory?: string;
    actionType?: string;
    status?: string;
    from?: string;
    to?: string;
    search?: string;
    sort?: "ASC" | "DESC";
}): Promise<{ data: AuditLog[]; nextCursor: string | null; hasMore: boolean }> {
    const response = await api.get(`/audit-logs/${connectionId}`, { params });

    return {
        data: response.data.data.map(mapAuditLogFromApi),
        nextCursor: response.data.nextCursor,
        hasMore: response.data.hasMore,
    };
}

export async function getUserAuditLogs(params: {
    cursor?: string | null;
    limit?: number;
    role?: string;
    actionCategory?: string;
    actionType?: string;
    status?: string;
    from?: string;
    to?: string;
    search?: string;
    sort?: "ASC" | "DESC";
}): Promise<{ data: AuditLog[]; nextCursor: string | null; hasMore: boolean }> {
    const response = await api.get('/audit-logs/user', { params });

    return {
        data: response.data.data.map(mapAuditLogFromApi),
        nextCursor: response.data.nextCursor,
        hasMore: response.data.hasMore,
    };
}