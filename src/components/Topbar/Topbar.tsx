import { Search } from "lucide-react"


//only do onSearch change if showSearch is true
type TopbarProps =
  | {
    showSearch: true
    searchPlaceholder: string
    onSearchChange: (value: string) => void
    searchValue: string
    rightActions?: React.ReactNode
  }
  | {
    showSearch?: false
    rightActions?: React.ReactNode
}



function Topbar(props: TopbarProps) {
  return (
    <div className="w-full bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
      {/* inner spacing container */}
      <div className="flex items-center px-4 py-3">
        <div className="flex-1">
          {props.showSearch && (
            <div className="inline-flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-full px-3 py-2 w-40 sm:w-50">
              <Search className="w-5 h-5 text-gray-900 dark:text-gray-100" />
              <input
                type="text"
                placeholder={props.searchPlaceholder}
                value={props.searchValue}
                onChange={(e) => props.onSearchChange(e.target.value)}
                className="bg-transparent outline-none text-sm min-w-0 w-full text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {props.rightActions}
        </div>
      </div>
    </div>
  )
}

export default Topbar