import { ArrowUpRight } from "lucide-react"

type StatsCardProps = {
    title?: string,
    value?: string | number,
    textColor?: string,
    backgroundColor?: string,
    buttonBorderColor?: string
}

function StatsCard({
  title = "Title",
  value = "--",
    textColor = "text-gray-900 dark:text-gray-100",
    backgroundColor = "bg-white dark:bg-neutral-900",
    buttonBorderColor = "border-gray-200 dark:border-neutral-800",
}: StatsCardProps) {    
    return (
        <div className={`flex flex-col ${backgroundColor} rounded-2xl ${textColor} p-4 w-56 h-32 snap-start shrink-0`}>
           <div className="flex items-start justify-between gap-2">
                <span className="text-md font-semibold mb-2 truncate">{title}</span>
                <button className={`shrink-0 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border ${buttonBorderColor} rounded-full p-2`}>
                    <ArrowUpRight className="h-4 w-4"/>
                </button>
            </div>
            <span className="text-6xl">{value}</span>           
        </div>
    )
}

export default StatsCard