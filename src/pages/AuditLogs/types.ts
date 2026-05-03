export type AuditLog = {
    id: string;
    userId: string;
    userEmail: string;
    roleAtTime: AuditLogRole;
    actionType: string;
    actionCategory: string;
    resourceType: string;
    resourceId: string;
    resourceName: string;
    message: string;
    ipAddress: string;
    userAgent: string;
    status: AuditLogStatus;
    errorMessage: string;
    metadata: Record<string, unknown>;
    createdAt: string;
}

export type AuditLogStatus = "SUCCESS" | "FAILED" | "DENIED";

export type AuditLogRole = "OWNER" | "ADMIN" | "VIEWER" | "OPERATOR" | "SYSTEM";