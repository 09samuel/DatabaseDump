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
      <div className="my-2 mr-2 p-4 border border-black rounded-lg flex items-center bg-[#f7f7f7]">

        <div className="flex-1">
          {props.showSearch && props.searchPlaceholder && (
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-3 py-2">
              <Search className="w-5 h-5 text-black" />

              <input 
                type="text"
                placeholder={props.searchPlaceholder}
                value={props.searchValue}
                onChange={(e) => props.onSearchChange(e.target.value)}
                className="bg-transparent outline-none text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex items-center">
          {props.rightActions}
        </div>
      </div>

    )
  }

  export default Topbar