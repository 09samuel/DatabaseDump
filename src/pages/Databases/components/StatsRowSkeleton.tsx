

function StatsRowSkeleton() {
    return(
        <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex flex-col bg-gray-200  rounded-2xl p-4 w-56 h-32 animate-pulse `}></div>
            ))}
        </div>
    )
}

export default StatsRowSkeleton