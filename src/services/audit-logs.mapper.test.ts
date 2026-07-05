import { describe, expect, it } from "vitest";
import { mapAuditLogFromApi, type ApiAuditLog } from "./audit-logs.mapper";


describe('mapAuditLogFromApi', () => {
    it('correctly maps snake_case api properties to camelCase frontend properties', () => {
        const mockApiLog: ApiAuditLog = {
            id: 'log-123',
            user_id: 'user-456',
            user_email: 'test@example.com',
            role_at_time: 'OWNER',
            action_type: 'CREATE',
            action_category: 'DATABASE',
            resource_type: 'CONNECTION',
            resource_id: 'db-789',
            resource_name: 'Production DB',
            message: 'Created new database connection',
            ip_address: '127.0.0.1',
            user_agent: 'Mozilla/5.0',
            status: 'SUCCESS',
            error_message: '',
            metadata: { env: 'prod' },
            created_at: '2026-07-03T11:00:00Z',
        };

        const result = mapAuditLogFromApi(mockApiLog);

        expect(result.id).toBe('log-123');
        expect(result.userId).toBe('user-456');
        expect(result.userEmail).toBe('test@example.com');
        expect(result.roleAtTime).toBe('OWNER');
        expect(result.actionType).toBe('CREATE');
        expect(result.actionCategory).toBe('DATABASE');
        expect(result.resourceType).toBe('CONNECTION');
        expect(result.resourceId).toBe('db-789');
        expect(result.resourceName).toBe('Production DB');
        expect(result.message).toBe('Created new database connection');
        expect(result.ipAddress).toBe('127.0.0.1');
        expect(result.userAgent).toBe('Mozilla/5.0');
        expect(result.status).toBe('SUCCESS');
        expect(result.errorMessage).toBe('');
        expect(result.metadata).toEqual({ env: 'prod' });
        expect(result.createdAt).toBe('2026-07-03T11:00:00Z');
    })
})