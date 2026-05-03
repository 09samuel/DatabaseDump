import type { Stats } from "../types";
import StatsCard from "./StatsCard";

type DatabaseListProps = {
  stats: Stats
}

function StatsRow( {stats}: DatabaseListProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        <div className="flex gap-3 whitespace-nowrap">
          <StatsCard title="Total Databases" value={stats?.totalDatabases} backgroundColor="bg-blue-600" textColor="text-white" buttonBorderColor="border-white"/>
          <StatsCard title="Verified Databases" value={stats?.activeDatabases} backgroundColor="bg-white dark:bg-neutral-900" textColor="text-gray-900 dark:text-gray-100" buttonBorderColor="border-gray-200 dark:border-neutral-800"/>
          <StatsCard title="Backedup Databases" value={stats?.backedUpDatabases} backgroundColor="bg-white dark:bg-neutral-900" textColor="text-gray-900 dark:text-gray-100" buttonBorderColor="border-gray-200 dark:border-neutral-800"/>
          <StatsCard title="Last Backup" value={stats.lastBackupStatus ?? "--"} backgroundColor="bg-white dark:bg-neutral-900" textColor="text-gray-900 dark:text-gray-100" buttonBorderColor="border-gray-200 dark:border-neutral-800"/>
          <StatsCard title="Storage Used" value={stats?.storageUsedGB} backgroundColor="bg-white dark:bg-neutral-900" textColor="text-gray-900 dark:text-gray-100" buttonBorderColor="border-gray-200 dark:border-neutral-800"/>    
        </div>
    </div>
  )
}

export default StatsRow