import type { AuditLog, AuditLogRole, AuditLogStatus } from "../pages/AuditLogs/types";


export type ApiAuditLog = {
    id: string;
    user_id: string;
    user_email: string;
    role_at_time: AuditLogRole;
    action_type: string;
    action_category: string;
    resource_type: string;
    resource_id: string;
    resource_name: string;
    message: string;
    ip_address: string;
    user_agent: string;
    status: AuditLogStatus;
    error_message: string;
    metadata: Record<string, unknown>;
    created_at: string;
}

export function mapAuditLogFromApi(log: ApiAuditLog): AuditLog {
    return {
        id: log.id,
        userId: log.user_id,
        userEmail: log.user_email,
        roleAtTime: log.role_at_time,
        actionType: log.action_type,
        actionCategory: log.action_category,
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        resourceName: log.resource_name,
        message: log.message,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        status: log.status,
        errorMessage: log.error_message,
        metadata: log.metadata,
        createdAt: log.created_at,
    }
}