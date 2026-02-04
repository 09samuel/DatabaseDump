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
  textColor = "text-black",
  backgroundColor = "bg-white",
  buttonBorderColor = "border-white",
}: StatsCardProps) {    
    return (
        <div className={`flex flex-col ${backgroundColor} rounded-2xl ${textColor} p-4 w-56 h-32`}>
            <div className="flex items-center justify-between">
                <span className="text-md font-semibold mb-2">{title}</span>
                <button className={`bg-white text-black border ${buttonBorderColor} rounded-full p-2`}>
                    <ArrowUpRight className="h-4 w-4"/>
                </button>
            </div>
            <span className="text-6xl">{value}</span>           
        </div>
    )
}

export default StatsCard