import type { DatabaseEngine, SSLMode } from "../pages/Databases/types";

export interface DatabaseConnectionValidationParams {
  databaseName: string;
  host: string;
  port: number | string | null;
  dbEngine: DatabaseEngine | null;
  environment: string;
  username: string | null | undefined;
  password?: string;
  sslMode: SSLMode | null;
  isEditMode?: boolean;
}

export function validateDatabaseConnection(params: DatabaseConnectionValidationParams): string[] {
  const errors: string[] = [];
  const {
    databaseName,
    host,
    port,
    dbEngine,
    environment,
    username,
    password = "",
    sslMode,
    isEditMode = false,
  } = params;

  const trimmedDatabaseName = databaseName.trim();
  const trimmedHost = host.trim();
  const trimmedUsername = (username ?? "").trim();
  const trimmedPassword = password.trim();

  // Database name: required, alphanumeric + underscores/dashes, 1–64 chars
  if (!trimmedDatabaseName) {
    errors.push("Database name is required");
  } else if (!/^[a-zA-Z0-9_-]+$/.test(trimmedDatabaseName)) {
    errors.push("Database name must contain only letters, numbers, underscores, or dashes");
  } else if (trimmedDatabaseName.length > 64) {
    errors.push("Database name must be 1–64 characters");
  }

  // Host: 1–253 chars, required, valid hostname or IPv4
  if (!trimmedHost) {
    errors.push("Host is required");
  } else if (trimmedHost.length > 253) {
    errors.push("Host must be at most 253 characters");
  } else if (
    !/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$|^(\d{1,3}\.){3}\d{1,3}$/.test(
      trimmedHost
    )
  ) {
    errors.push("Host must be a valid hostname or IP address");
  }

  // Port: required, valid range unless mongodb
  const portNum = Number(port);
  if (dbEngine !== "mongodb") {
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      errors.push("Port must be a valid number between 1–65535");
    }
  }

  // Engine: required
  if (!dbEngine) {
    errors.push("Database engine is required");
  }

  // Environment: required
  if (!environment) {
    errors.push("Environment is required");
  }

  // Username & Password validation
  if (!isEditMode) {
    if (dbEngine === "postgresql") {
      if (!trimmedUsername) {
        errors.push("Username is required");
      }
      if (!trimmedPassword) {
        errors.push("Password is required");
      }
    } else if (dbEngine === "mysql") {
      if (!trimmedUsername) {
        errors.push("Username is required");
      }
      if (trimmedPassword.length > 128) {
        errors.push("Password must be at most 128 characters");
      }
    } else {
      // MongoDB
      if ((trimmedUsername && !trimmedPassword) || (!trimmedUsername && trimmedPassword)) {
        errors.push("Both username and password are required when using MongoDB authentication");
      }
      if (trimmedUsername.length > 64) {
        errors.push("Username must be at most 64 characters");
      }
      if (trimmedPassword.length > 128) {
        errors.push("Password must be at most 128 characters");
      }
    }
  } else {
    // Edit mode specific limits
    if (trimmedUsername.length > 64) {
      errors.push("Username must be at most 64 characters");
    }
    if (trimmedPassword.length > 128) {
      errors.push("Password must be at most 128 characters");
    }
  }

  // SSL validation (Postgres & MySQL only)
  if (dbEngine === "postgresql") {
    const validPgModes = ["disable", "require", "verify-ca", "verify-full"];
    if (!sslMode || !validPgModes.includes(sslMode)) {
      errors.push("Invalid SSL mode selected for PostgreSQL");
    }
  }

  if (dbEngine === "mysql") {
    const validMysqlModes = ["disable", "require"];
    if (!sslMode || !validMysqlModes.includes(sslMode)) {
      errors.push("Invalid SSL mode selected for MySQL");
    }
  }

  return errors;
}
