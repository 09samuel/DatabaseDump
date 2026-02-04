function DatabaseListSkeleton() {
  return (
    <table className="w-full border-separate border-spacing-y-2">
      <thead className="sticky top-0 z-10">
        <tr className="bg-gray-200 animate-pulse h-10.5">
          <th className="rounded-l-lg"/>
          <th className="rounded-r-lg"/>
        </tr>
      </thead>
      <tbody>
        {[...Array(6)].map((_, i) => (
          <tr key={i} className="bg-gray-200 animate-pulse h-9.25">
            <td className="rounded-l-lg"/>
            <td className="rounded-r-lg"/>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default DatabaseListSkeleton
