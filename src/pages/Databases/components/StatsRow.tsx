import type { Stats } from "../types";
import StatsCard from "./StatsCard";

type DatabaseListProps = {
  stats: Stats
}

function StatsRow( {stats}: DatabaseListProps) {
  return (
    <div className="flex gap-3">
        <StatsCard title="Total Databases" value={stats?.totalDatabases} backgroundColor="bg-green-600" textColor="text-white" buttonBorderColor="border-white"/>
        <StatsCard title="Verified Databases" value={stats?.activeDatabases} backgroundColor="bg-white" textColor="text-black" buttonBorderColor="border-black"/>
        <StatsCard title="Backedup Databases" value={stats?.backedUpDatabases} backgroundColor="bg-white" textColor="text-black" buttonBorderColor="border-black"/>
        <StatsCard title="Last Backup" value={stats.lastBackupStatus ?? "--"} backgroundColor="bg-white" textColor="text-black" buttonBorderColor="border-black"/>
        <StatsCard title="Storage Used" value={stats?.storageUsedGB} backgroundColor="bg-white" textColor="text-black" buttonBorderColor="border-black"/>    
    </div>
  )
}

export default StatsRow