import StatsCard from "./StatsCard"

function ErrorStatsRowState(){
    return(
        <div className="flex gap-3">
        <StatsCard title="Total Databases" value="--" backgroundColor="bg-blue-600" textColor="text-white" buttonBorderColor="border-white"/>
        <StatsCard title="Backedup Databases" value="--" backgroundColor="bg-white dark:bg-neutral-900" textColor="text-gray-900 dark:text-gray-100" buttonBorderColor="border-gray-200 dark:border-neutral-800"/>
        <StatsCard title="Last Backup" value="--" backgroundColor="bg-white dark:bg-neutral-900" textColor="text-gray-900 dark:text-gray-100" buttonBorderColor="border-gray-200 dark:border-neutral-800"/>
        <StatsCard title="Storage Used" value="--" backgroundColor="bg-white dark:bg-neutral-900" textColor="text-gray-900 dark:text-gray-100" buttonBorderColor="border-gray-200 dark:border-neutral-800"/>    
    </div>
    )
}
 
export default ErrorStatsRowState