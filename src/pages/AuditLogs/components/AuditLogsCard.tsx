import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { AuditLog } from "../types";
import { formatDateTime } from "../../../utils/formatDate";

type AuditLogsCardProps = AuditLog

function statusStyles(status: AuditLog["status"]) {
  switch (status) {
    case "SUCCESS":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200";
    case "FAILED":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200";
    case "DENIED":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-200";
  }
}

function AuditLogsCard({
  id,
  userId,
  userEmail,
  roleAtTime,
  actionType,
  actionCategory,
  resourceType,
  resourceId,
  resourceName,
  message,
  ipAddress,
  userAgent,
  status,
  errorMessage,
  metadata,
  createdAt,
}: AuditLogsCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {actionType} · {actionCategory}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {resourceName || resourceType}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles(
              status
            )}`}
          >
            {status}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(createdAt)}</span>
        </div>
      </div>

      {message ? (
        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{message}</p>
      ) : null}

      {expanded ? (
        <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-gray-600 dark:text-gray-400 sm:grid-cols-2">
          <div>
            <span className="text-gray-400 dark:text-gray-500">User ID</span>
            <p className="font-medium text-gray-800 dark:text-gray-200 wrap-break-word">{userId}</p>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500">Role</span>
            <p className="font-medium text-gray-800 dark:text-gray-200">{roleAtTime}</p>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500">Resource</span>
            <p className="font-medium text-gray-800 dark:text-gray-200 wrap-break-words">
              {resourceType} · {resourceId}
            </p>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500">IP Address</span>
            <p className="font-medium text-gray-800 dark:text-gray-200">{ipAddress || "--"}</p>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500">User Agent</span>
            <p className="font-medium text-gray-800 dark:text-gray-200 wrap-break-words">
              {userAgent || "--"}
            </p>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500">Error</span>
            <p className="font-medium text-gray-800 dark:text-gray-200 wrap-break-words">
              {errorMessage || "--"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-gray-400 dark:text-gray-500">Metadata</span>
            <pre className="mt-1 whitespace-pre-wrap rounded-md bg-gray-50 dark:bg-neutral-800 p-2 text-[11px] text-gray-700 dark:text-gray-300">
              {Object.keys(metadata || {}).length
                ? JSON.stringify(metadata, null, 2)
                : "--"}
            </pre>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400"
        >
          {expanded ? "Hide details" : "Show details"}
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default AuditLogsCard;