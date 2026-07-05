import { describe, expect, it } from "vitest";
import {
    mapDatabaseFromApi,
    mapDatabaseDetailsFromApi,
    mapDatabaseOverviewFromApi,
    mapDatabaseBasicDetailsFromApi,
    normalizeEngine,
    type ApiDatabase,
    type ApiDatabaseDetails,
    type ApiDatabaseOverview,
    type ApiDatabaseBasicDetails
} from "./database.mapper";

describe('normalizeEngine', () => {
    it.each([
        ['POSTGRES', 'postgresql'],
        ['POSTGRESQL', 'postgresql'],
        ['PostgreSQL', 'postgresql'],
        ['postgres', 'postgresql'],
        ['MYSQL', 'mysql'],
        ['mysql', 'mysql'],
        ['MySql', 'mysql'],
        ['MONGODB', 'mongodb'],
        ['mongodb', 'mongodb'],
        ['MongoDb', 'mongodb'],
    ])('normalizes engine casing "%s" to "%s"', (input, expected) => {
        expect(normalizeEngine(input)).toBe(expected);
    });

    it('throws error for unknown engine', () => {
        expect(() => normalizeEngine('MSSQL')).toThrow('Unknown engine: MSSQL');
    });
});

describe('mapDatabaseFromApi', () => {
    const baseApiDb: ApiDatabase = {
        id: 'log-123',
        db_name: 'test-db',
        db_type: 'PostgreSQL',
        env_tag: 'Production',
        status: 'CREATED',
        lastBackupAt: '2026-07-03T11:00:00Z',
        backupStatus: 'COMPLETED',
        storageUsedGB: 100,
    };

    it('correctly maps snake_case api properties to camelCase frontend properties', () => {
        const result = mapDatabaseFromApi(baseApiDb);

        expect(result.id).toBe('log-123');
        expect(result.name).toBe('test-db');
        expect(result.engine).toBe('postgresql');
        expect(result.environment).toBe('Production');
        expect(result.status).toBe('SettingUp');
        expect(result.lastBackupAt).toBe('2026-07-03T11:00:00Z');
        expect(result.backupStatus).toBe('Success');
        expect(result.storageUsedGB).toBe(100);
    });

    it('correctly handles nullable optional fields', () => {
        const result = mapDatabaseFromApi({
            ...baseApiDb,
            lastBackupAt: null,
            backupStatus: null,
        });

        expect(result.lastBackupAt).toBeNull();
        expect(result.backupStatus).toBeNull();
    });

    it('unexpected engine throws an error', () => {
        expect(() => mapDatabaseFromApi({ ...baseApiDb, db_type: 'Unknown' })).toThrow('Unknown engine: Unknown');
    });

    it('unexpected status throws an error', () => {
        expect(() => mapDatabaseFromApi({ ...baseApiDb, status: 'Unknown' })).toThrow('Unknown connection status: Unknown');
    });

    it('unexpected backup status throws an error', () => {
        expect(() => mapDatabaseFromApi({ ...baseApiDb, backupStatus: 'Unknown' })).toThrow('Unknown backup status: Unknown');
    });
});

describe('mapDatabaseDetailsFromApi', () => {
    const baseApiDbDetails: ApiDatabaseDetails = {
        dbName: 'test-db',
        dbHost: 'localhost',
        dbPort: 5432,
        dbEngine: 'PostgreSQL',
        environment: 'Production',
        dbUsername: 'admin',
        sslMode: 'disable',
    };

    it('correctly maps snake_case api properties to camelCase frontend properties', () => {
        const result = mapDatabaseDetailsFromApi(baseApiDbDetails);

        expect(result.dbName).toBe('test-db');
        expect(result.dbHost).toBe('localhost');
        expect(result.dbPort).toBe(5432);
        expect(result.dbEngine).toBe('postgresql');
        expect(result.environment).toBe('Production');
        expect(result.dbUsername).toBe('admin');
        expect(result.sslMode).toBe('disable');
    });

    it('correctly handles nullable optional fields', () => {
        const result = mapDatabaseDetailsFromApi({
            ...baseApiDbDetails,
            dbPort: null,
            dbUsername: null,
            sslMode: null,
        });

        expect(result.dbPort).toBeNull();
        expect(result.dbUsername).toBeNull();
        expect(result.sslMode).toBeNull();
    });

    it('unexpected engine throws an error', () => {
        expect(() => mapDatabaseDetailsFromApi({ ...baseApiDbDetails, dbEngine: 'Unknown' })).toThrow('Unknown engine: Unknown');
    });

    it('unexpected SSL mode throws an error', () => {
        expect(() => mapDatabaseDetailsFromApi({ ...baseApiDbDetails, sslMode: 'Unknown' })).toThrow('Unknown SSL mode: Unknown');
    });
});

describe('mapDatabaseOverviewFromApi', () => {
    const baseApiDbOverview: ApiDatabaseOverview = {
        db_name: 'test-db',
        db_type: 'PostgreSQL',
        env_tag: 'Production',
        db_host: 'localhost',
        db_port: 5432,
        status: 'CREATED',
        ssl_mode: 'disable',
        last_backup_at: '2026-07-03T11:00:00Z',
        last_storage_target: '2026-07-03T11:00:00Z',
        storage_used_bytes: 100,
    };

    it('correctly maps snake_case api properties to camelCase frontend properties', () => {
        const result = mapDatabaseOverviewFromApi(baseApiDbOverview);

        expect(result.name).toBe('test-db');
        expect(result.engine).toBe('postgresql');
        expect(result.environment).toBe('Production');
        expect(result.host).toBe('localhost');
        expect(result.port).toBe(5432);
        expect(result.status).toBe('SettingUp');
        expect(result.sslMode).toBe('disable');
        expect(result.lastBackupAt).toBe('2026-07-03T11:00:00Z');
        expect(result.lastBackupStatus).toBe('Success');
        expect(result.lastStorageTarget).toBe('2026-07-03T11:00:00Z');
        expect(result.totalstorageUsed).toBe(100);
    });

    it('correctly handles nullable optional fields', () => {
        const result = mapDatabaseOverviewFromApi({
            ...baseApiDbOverview,
            ssl_mode: null,
            last_backup_at: null,
        });

        expect(result.sslMode).toBeNull();
        expect(result.lastBackupAt).toBeNull();
    });

    it('unexpected engine throws an error', () => {
        expect(() => mapDatabaseOverviewFromApi({ ...baseApiDbOverview, db_type: 'Unknown' })).toThrow('Unknown engine: Unknown');
    });

    it('unexpected status throws an error', () => {
        expect(() => mapDatabaseOverviewFromApi({ ...baseApiDbOverview, status: 'Unknown' })).toThrow('Unknown connection status: Unknown');
    });

    it('unexpected SSL mode throws an error', () => {
        expect(() => mapDatabaseOverviewFromApi({ ...baseApiDbOverview, ssl_mode: 'Unknown' })).toThrow('Unknown SSL mode: Unknown');
    });
});

describe('mapDatabaseBasicDetailsFromApi', () => {
    const baseApiDbBasic: ApiDatabaseBasicDetails = {
        db_name: 'test-db',
        db_type: 'PostgreSQL',
        env_tag: 'Production',
        status: 'CREATED',
    };

    it('correctly maps snake_case api properties to camelCase frontend properties', () => {
        const result = mapDatabaseBasicDetailsFromApi(baseApiDbBasic);

        expect(result.name).toBe('test-db');
        expect(result.engine).toBe('postgresql');
        expect(result.environment).toBe('Production');
        expect(result.status).toBe('SettingUp');
    });

    it('unexpected engine throws an error', () => {
        expect(() => mapDatabaseBasicDetailsFromApi({ ...baseApiDbBasic, db_type: 'Unknown' })).toThrow('Unknown engine: Unknown');
    });
});