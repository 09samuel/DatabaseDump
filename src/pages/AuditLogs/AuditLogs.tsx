import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, ChevronDown } from "lucide-react";
import AuditLogsCard from "./components/AuditLogsCard";
import type { AuditLog } from "./types";
import { getUserAuditLogs } from "../../services/audit-logs.service";
import ErrorState from "../Databases/components/ErrorState";
import EmptyState from "../Databases/components/EmptyState";
import StatusBar from "../../components/StatusBar/StatusBar";
import { useOutletContext } from "react-router-dom";

type StatusMessage = { type: "success" | "error"; message: string };

type DateRangeKey = "" | "today" | "7d" | "30d" | "90d";

type SortKey = "timeDesc" | "timeAsc";

const ACTION_CATEGORIES = [
	"AUTH",
	"BACKUP",
	"RESTORE",
	"USER_MANAGEMENT",
	"SECURITY",
	"DATABASE",
	"SYSTEM",
];

const ACTION_TYPES_BY_CATEGORY: Record<string, string[]> = {
	AUTH: [
		"AUTHENTICATION_CHECK",
		"FORGOT_PASSWORD",
		"LOGIN_ATTEMPT",
		"LOGOUT",
		"PERMISSION_CHECK",
		"REGISTER_ATTEMPT",
		"RESET_PASSWORD",
		"TOKEN_REFRESH",
		"VERIFY_EMAIL",
	],
	BACKUP: [
		"BACKUP_COMPLETED",
		"BACKUP_DELETED",
		"BACKUP_DOWNLOAD_URL_REQUESTED",
		"BACKUP_RENAMED",
		"BACKUP_REQUESTED",
		"RETENTION_DELETE",
		"RETENTION_JOB_ENQUEUED",
		"RETENTION_SCAN",
		"SCHEDULED_BACKUP_ENQUEUED",
		"SCHEDULED_BACKUP_SCAN",
	],
	RESTORE: ["RESTORE_COMPLETED", "RESTORE_REQUESTED"],
	USER_MANAGEMENT: [
		"COLLABORATOR_ADD",
		"COLLABORATOR_REMOVE",
		"COLLABORATOR_ROLE_UPDATE",
	],
	DATABASE: [
		"CONNECTION_CREATE",
		"CONNECTION_DELETE",
		"CONNECTION_UPDATE",
		"CONNECTION_VERIFICATION_COMPLETED",
		"CONNECTION_VERIFY_DRY_RUN",
		"CONNECTION_VERIFY_REQUESTED",
	],
};

function getDateRange(range: DateRangeKey): { from?: string; to?: string } {
	if (!range) return {};

	const now = new Date();
	const endDate = new Date(now);

	if (range === "today") {
		const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		return { from: start.toISOString(), to: endDate.toISOString() };
	}

	const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
	const start = new Date(now);
	start.setDate(start.getDate() - days);

	return { from: start.toISOString(), to: endDate.toISOString() };
}

function getSortDirection(sortBy: SortKey): "ASC" | "DESC" {
	return sortBy === "timeAsc" ? "ASC" : "DESC";
}


function AuditLogs() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [cursor, setCursor] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
	const { auditSearch } = useOutletContext<{ auditSearch: string }>();
	const [debouncedSearch, setDebouncedSearch] = useState(auditSearch);

	const [filters, setFilters] = useState({
		actionCategory: "",
		actionType: "",
		status: "",
		dateRange: "" as DateRangeKey,
		sortBy: "timeDesc" as SortKey,
	});

	useEffect(() => {
		if (!statusMessage) return;

		const t = setTimeout(() => setStatusMessage(null), 3000);
		return () => clearTimeout(t);
	}, [statusMessage]);

	const sortDirection = useMemo(() => getSortDirection(filters.sortBy), [filters.sortBy]);
	const dateParams = useMemo(() => getDateRange(filters.dateRange), [filters.dateRange]);
	const searchParam = useMemo(() => {
		const next = debouncedSearch.trim();
		return next ? next : undefined;
	}, [debouncedSearch]);
	const actionTypeOptions = useMemo(() => {
		if (!filters.actionCategory) {
			return Object.values(ACTION_TYPES_BY_CATEGORY)
				.flat()
				.sort();
		}

		return (ACTION_TYPES_BY_CATEGORY[filters.actionCategory] || []).slice().sort();
	}, [filters.actionCategory]);

	useEffect(() => {
		const t = setTimeout(() => {
			setDebouncedSearch(auditSearch);
		}, 300);

		return () => clearTimeout(t);
	}, [auditSearch]);


	const fetchAuditLogs = useCallback(async () => {
		try {
			setLoading(true);

			const res = await getUserAuditLogs({
				actionCategory: filters.actionCategory,
				actionType: filters.actionType,
				status: filters.status,
				from: dateParams.from,
				to: dateParams.to,
				search: searchParam,
				sort: sortDirection,
				limit: 12,
			});

			setLogs(res.data);
			setCursor(res.nextCursor);
			setHasMore(res.hasMore);
			setError(null);
		} catch (err) {
			console.error(err);
			setError("Failed to fetch audit logs");
			setStatusMessage({ type: "error", message: "Failed to fetch audit logs" });
		} finally {
			setLoading(false);
		}
	}, [filters.status, filters.actionType, filters.actionCategory, dateParams.from, dateParams.to, searchParam, sortDirection]);

	useEffect(() => {
		fetchAuditLogs();
	}, [fetchAuditLogs]);

	const loadMore = async () => {
		if (!cursor || !hasMore) return;

		try {
			setLoadingMore(true);

			const res = await getUserAuditLogs({
				cursor,
				actionCategory: filters.actionCategory,
				actionType: filters.actionType,
				status: filters.status,
				from: dateParams.from,
				to: dateParams.to,
				search: searchParam,
				sort: sortDirection,
				limit: 12,
			});

			setLogs((prev) => [...prev, ...res.data]);
			setCursor(res.nextCursor);
			setHasMore(res.hasMore);
		} catch (err) {
			console.error(err);
			setStatusMessage({ type: "error", message: "Failed to load more logs" });
		} finally {
			setLoadingMore(false);
		}
	};

	const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFilters((prev) => {
			const next = { ...prev, [name]: value };
			if (name === "actionCategory" && prev.actionCategory !== value) {
				next.actionType = "";
			}
			return next;
		});
	};

	return (
		<>
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
				<div className="flex flex-col sm:flex-row flex-1 lg:flex-initial gap-2">
					<select
						value={filters.actionCategory}
						onChange={handleFilterChange}
						name="actionCategory"
						className="flex-1 lg:w-40 border border-gray-200 dark:border-neutral-800 rounded-lg py-2 px-2 text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
					>
						<option value="">All Categories</option>
						{ACTION_CATEGORIES.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>

					<select
						value={filters.actionType}
						onChange={handleFilterChange}
						name="actionType"
						className="flex-1 lg:w-44 border border-gray-200 dark:border-neutral-800 rounded-lg py-2 px-2 text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
					>
						<option value="">All Actions</option>
						{actionTypeOptions.map((action) => (
							<option key={action} value={action}>
								{action}
							</option>
						))}
					</select>

					<select
						value={filters.status}
						onChange={handleFilterChange}
						name="status"
						className="flex-1 lg:w-32 border border-gray-200 dark:border-neutral-800 rounded-lg py-2 px-2 text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
					>
						<option value="">All Status</option>
						<option value="SUCCESS">Success</option>
						<option value="FAILED">Failed</option>
						<option value="DENIED">Denied</option>
					</select>

					<select
						value={filters.dateRange}
						onChange={handleFilterChange}
						name="dateRange"
						className="flex-1 lg:w-36 border border-gray-200 dark:border-neutral-800 rounded-lg py-2 px-2 text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
					>
						<option value="">Any time</option>
						<option value="today">Today</option>
						<option value="7d">Last 7 days</option>
						<option value="30d">Last 30 days</option>
						<option value="90d">Last 90 days</option>
					</select>
				</div>

				<div className="w-full lg:w-auto flex justify-end">
					<select
						value={filters.sortBy}
						onChange={handleFilterChange}
						name="sortBy"
						className="w-full lg:w-auto border border-gray-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-900 font-medium text-gray-900 dark:text-gray-100"
					>
						<option value="timeDesc">Sort: Newest</option>
						<option value="timeAsc">Sort: Oldest</option>
					</select>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:pr-3 pb-24 md:pb-0 overflow-y-auto">
				{loading && logs.length === 0 &&
					Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="h-56 rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
					))}

				{!loading && error && (
					<div className="col-span-full py-12">
						<ErrorState errorMessage={error} />
					</div>
				)}

				{!loading && !error && logs.length === 0 && (
					<div className="col-span-full py-12">
						<EmptyState
							icon={ClipboardList}
							mainMessage="No audit logs found"
							subMessage="Try adjusting your filters"
						/>
					</div>
				)}

				{logs.length > 0 && logs.map((log) => (
					<AuditLogsCard key={log.id} {...log} />
				))}

				{!loading && !error && logs.length > 0 && hasMore && (
					<div className="col-span-full mt-4 flex flex-col items-center gap-3 py-8 border-t border-gray-100">
						<p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
							Showing {logs.length} logs
						</p>

						<button
							onClick={loadMore}
							disabled={loadingMore}
							className="group relative flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:border-gray-400 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
						>
							{loadingMore ? (
								<>
									<span className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
									<span>Loading...</span>
								</>
							) : (
								<>
									<span>Load more</span>
									<ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
								</>
							)}
						</button>
					</div>
				)}
			</div>

			{statusMessage && (
				<StatusBar
					type={statusMessage.type}
					message={statusMessage.message}
					onClose={() => setStatusMessage(null)}
				/>
			)}
		</>
	);
}

export default AuditLogs;
