type EmptySearchStateProps = {
  query: string
}

function EmptySearchState({ query }: EmptySearchStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 text-gray-600">
      <p className="text-lg font-medium">
        No results found
      </p>
      <p className="text-sm mt-2">
        No databases match “<strong>{query}</strong>”
      </p>
    </div>
  )
}

export default EmptySearchState