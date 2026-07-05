import { useCallback, useEffect, useMemo, useState } from "react";
import type { Backup } from "../DatabaseDetails/types";
import { getUserBackups } from "../../services/backup.service";
import ErrorState from "../Databases/components/ErrorState";
import { ChevronDown, DatabaseBackup } from "lucide-react";
import EmptyState from "../Databases/components/EmptyState";
import BackupItem from "../DatabaseDetails/backups/BackupItem";
import StatusBar from "../../components/StatusBar/StatusBar";
import { useOutletContext } from "react-router-dom";

type OutletContextType = {
  backupSearch: string;
};


function BackupsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [backups, setBackups] = useState<Backup[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error", message: string } | null>(null);
    const { backupSearch } = useOutletContext<OutletContextType>();
    const [debouncedSearch, setDebouncedSearch] = useState(backupSearch);

    const [filters, setFilters] = useState({
        dbType: "",
        environment: "",
        status: "",
        sortBy: "latest"
    });

    //debounce search input to avoid too many API calls
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(backupSearch);
        }, 300);

        return () => clearTimeout(t);
    }, [backupSearch]);

    //To automatically clear status messages after 3 seconds
    useEffect(() => {
        if (!statusMessage) return
        
        const t = setTimeout(() => setStatusMessage(null), 3000)
        return () => clearTimeout(t)
    }, [statusMessage])


    //update sort params when sortBy filter changes
    const sortParams = useMemo(() => {
        if (filters.sortBy === "latest") {
            return { sortBy: "created_at", sortOrder: "desc" };
        }
        if (filters.sortBy === "oldest") {
            return { sortBy: "created_at", sortOrder: "asc" };
        }
        if (filters.sortBy === "sizeDesc") {
            return { sortBy: "backup_size_bytes", sortOrder: "desc" };
        }
        if (filters.sortBy === "sizeAsc") {
            return { sortBy: "backup_size_bytes", sortOrder: "asc" };
        }
        return { sortBy: "created_at", sortOrder: "desc" };
    }, [filters.sortBy]);

    const loadMore = async () => {
        if (!cursor || !hasMore) return;

        try {
            setLoadingMore(true);

            const res = await getUserBackups({
                cursor,
                dbType: filters.dbType,
                environment: filters.environment,
                status: filters.status,
                search: debouncedSearch,
                sortBy: sortParams.sortBy,
                sortOrder: sortParams.sortOrder,
                limit: 12
            });

            setBackups((prev) => [...prev, ...res.data]);
            setCursor(res.nextCursor);
            setHasMore(res.hasMore);
        } catch (err) {
            console.error(err);
            setStatusMessage({ type: "error", message: "Failed to load more backups" });
        } finally {
            setLoadingMore(false);
        }
    };


    const fetchBackups = useCallback(async () => {
            try {
                setLoading(true);

                const res = await getUserBackups({
                    dbType: filters.dbType,
                    environment: filters.environment,
                    status: filters.status,
                    search: debouncedSearch,
                    sortBy: sortParams.sortBy,
                    sortOrder: sortParams.sortOrder,
                    limit: 12
                });

                setBackups(res.data);
                setCursor(res.nextCursor);
                setHasMore(res.hasMore);

                setError(null);
            } catch {
                setError("Failed to fetch backups");
                setStatusMessage({ type: "error", message: "Failed to fetch backups" });
            } finally {
                setLoading(false);
            }
    }, [filters.dbType, filters.environment, filters.status, debouncedSearch, sortParams]);

    useEffect(() => {
        fetchBackups();
    }, [fetchBackups]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            
                {/* Left Section: 3 Filters */}
                {/* Mobile: They share one row and stretch. MD+: They take natural width. */}
                <div className="flex flex-row flex-1 md:flex-initial gap-2">
                    <select
                        value={filters.dbType}
                        onChange={handleFilterChange}
                        name="dbType"
                        className="flex-1 md:w-32 border border-gray-200 dark:border-neutral-800 rounded-lg py-2 px-2 text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">All DBs</option>
                        <option value="postgresql">Postgres</option>
                        <option value="mysql">MySQL</option>
                        <option value="mongodb">MongoDB</option>
                    </select>

                    <select
                        value={filters.environment}
                        onChange={handleFilterChange}
                        name="environment"
                        className="flex-1 md:w-32 border border-gray-200 dark:border-neutral-800 rounded-lg py-2 px-2 text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">All Envs</option>
                        <option value="production">Prod</option>
                        <option value="staging">Staging</option>
                        <option value="development">Dev</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={handleFilterChange}
                        name="status"
                        className="flex-1 md:w-32 border border-gray-200 dark:border-neutral-800 rounded-lg py-2 px-2 text-sm bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
                    >
                        <option value="">Status</option>
                        <option value="queued">Queued</option>
                        <option value="running">Running</option>
                        <option value="completed">Success</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>

                {/* Right Section: Sort Dropdown */}
                {/* Mobile: Full width on its own line, right-aligned text. MD+: Natural width. */}
                <div className="w-full md:w-auto flex justify-end">
                    <select
                        value={filters.sortBy}
                        onChange={handleFilterChange}
                        name="sortBy"
                        className="w-full md:w-auto border border-gray-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-900 font-medium text-gray-900 dark:text-gray-100"
                    >
                        <option value="latest">Sort: Latest</option>
                        <option value="oldest">Sort: Oldest</option>
                        <option value="sizeDesc">Size (High-Low)</option>
                        <option value="sizeAsc">Size (Low-High)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:pr-3 pb-24 md:pb-0 overflow-y-auto">
                {/* INITIAL LOADING STATE*/}
                {loading && backups.length === 0 && (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-64 rounded-xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
                    ))
                )}

                {/* ERROR STATE: Render inside the grid but span full width */}
                {!loading && error && (
                    <div className="col-span-full py-12">
                        <ErrorState errorMessage={error} />
                    </div>
                )}

                {/* EMPTY STATE: Render inside the grid but span full width */}
                {!loading && !error && backups.length === 0 && (
                    <div className="col-span-full py-12">
                        <EmptyState 
                            icon={DatabaseBackup} 
                            mainMessage="No backups found" 
                            subMessage="Try adjusting your filters or search terms" 
                        />
                    </div>
                )}
                
                {/* Data State */}
                {(backups.length > 0) && backups.map((b) => (
                    <BackupItem key={b.backupId} {...b} dbId={""} onBackupUpdated={fetchBackups} />
                ))}

                {!loading && !error && backups.length > 0 && hasMore && (
                    /* Full-width container to ground the button */
                    <div className="col-span-full mt-4 flex flex-col items-center gap-3 py-8 border-t border-gray-100 dark:border-neutral-800">
                        
                        {/* Optional: Results Counter (Very common in SaaS) */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                            Showing {backups.length} backups
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
                                    <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
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

export default BackupsPage