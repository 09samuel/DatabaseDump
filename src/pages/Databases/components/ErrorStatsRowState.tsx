import StatsCard from "./StatsCard"

function ErrorStatsRowState(){
    return(
        <div className="flex gap-3">
        <StatsCard title="Total Databases" value="--" backgroundColor="bg-green-600" textColor="text-white" buttonBorderColor="border-white"/>
        <StatsCard title="Backedup Databases" value="--" backgroundColor="bg-white" textColor="text-black" buttonBorderColor="border-black"/>
        <StatsCard title="Last Backup" value="--" backgroundColor="bg-white" textColor="text-black" buttonBorderColor="border-black"/>
        <StatsCard title="Storage Used" value="--" backgroundColor="bg-white" textColor="text-black" buttonBorderColor="border-black"/>    
    </div>
    )
}
 
export default ErrorStatsRowState