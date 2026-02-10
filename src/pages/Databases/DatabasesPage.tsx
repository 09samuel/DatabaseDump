import DatabaseList from "./components/DatabaseList"
import StatsRow from "./components/StatsRow"
import { Database as DatabaseIcon, Plus } from "lucide-react"
import StatsRowSkeleton from "./components/StatsRowSkeleton"
import DatabaseListSkeleton from "./components/DatabaseListSkeleton"
import EmptyState from "./components/EmptyState"
import ErrorState from "./components/ErrorState"
import ErrorStatsRowState from "./components/ErrorStatsRowState"
import { useEffect, useMemo, useState } from "react"
import type { Database, PageState } from "./types"
import { fetchDatabases } from "../../services/database.service"
import EmptySearchState from "./components/EmptySearchState"
import AddDatabaseModal from "./components/AddDatabaseModal"
import EditDatabaseModal from "./components/EditDatabaseModal"
import DeleteDatabaseModal from "./components/DeleteDatabaseModal"
import BackupDatabaseModal from "./components/BackupDatabaseModal"
import { useOutletContext } from "react-router-dom"
import DatabaseCard from "./components/DatabaseCard"

function DatabasesPage() {
  const [status, setStatus] = useState<PageState>("loading")
  const [databases, setDatabases] = useState<Database[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAddOpen, setIsAddOpen] = useState<Boolean>(false)
  const [editingDb, setEditingDb] = useState<Database | null>(null)
  const [deletingDb, setDeletingDb] = useState<Database | null>(null)
  const [backupDb, setBackupDb] = useState<Database | null>(null)

  const { dbSearch } =  useOutletContext<{ dbSearch: string }>()

  const isLoading = status === "loading"
  const error = true
  const isEmpty = status === "empty"


  //search databases
  const filteredDatabases = databases.filter((db) => {
    const q = dbSearch.toLowerCase()

    return (
      db.name.toLowerCase().includes(q) ||
      db.engine.toLowerCase().includes(q)
    )
  })

  const isSearchEmpty =
    status === "loaded" &&
    databases.length > 0 &&
    filteredDatabases.length === 0 &&
    dbSearch.trim() !== ""



  //load the database data
  const loadDatabases = async (): Promise<void> => {
    try {
      setStatus("loading")
      setErrorMessage(null)

      const data = await fetchDatabases()

      if (!data.length) {
        setStatus("empty")  
        return
      }

      setDatabases(data)
      setStatus("loaded")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Failed to load databases")
      }
      setStatus("error")
    }
  }


  useEffect(() => {
    loadDatabases()
  }, [])


  //calculate stats for the stats row
  function computeStats(databases: Database[]) {
    const totalDatabases = databases.length
    const activeDatabases = databases.filter(db => db.status === "Active").length

    const backedUpDatabases = databases.filter(db => db.lastBackupAt && db.backupStatus=="Success").length
    
    const latestBackup = databases
      .filter(db => db.lastBackupAt)
      .sort((a, b) => new Date(b.lastBackupAt!).getTime() - new Date(a.lastBackupAt!).getTime())[0]
    
    const storageUsedGB = databases
      .reduce((sum, db) => sum + (Number(db.storageUsedGB) || 0), 0)
      .toFixed(2)

    return {
      totalDatabases,
      activeDatabases,
      backedUpDatabases,
      lastBackupStatus: latestBackup?.backupStatus ?? null,
      storageUsedGB,  
    }
  }


  const stats = useMemo(() => {
      //if (status !== "loaded") return null
      return computeStats(databases)
  }, [databases, status])



  function handleEdit(db: Database) {
    setEditingDb(db)
  }

  function handleDelete(db: Database) {
    setDeletingDb(db)
  }

  function handleBackup(db: Database) {
    setBackupDb(db)
  }


  return (
    <div className="flex flex-col h-full min-h-0 border border-black rounded-lg bg-green-200 text-sm md:text-base overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 p-4 overflow-hidden">

        {/* Top Section - same for both states */}
        <div className="flex flex-nowrap items-center mb-8 gap-4">
          {/* Title and Description */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-semibold">Databases Page</h1>
            <p className="text-[#8e9c97]">Plan, prioritize and accomplish your tasks with ease</p>
          </div>
          
          {/* Add Database Button / Skeleton */}
          <div className="shrink-0">
            {isLoading ? (
              <div className=" h-10 w-10 md:h-auto md:w-auto gap-4 leading-none bg-gray-200 rounded-full animate-pulse self-end md:self-auto" />
            ) : status === "loaded" || status === "empty" ? (
              <button 
                onClick={() => setIsAddOpen(true)} 
                className="flex items-center justify-center h-10 w-10 md:h-auto md:w-auto gap-4 md:px-6 md:py-3 leading-none bg-green-600 text-white rounded-full text-sm font-medium self-end md:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Add Database</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Statistics Row / Skeleton */}
        <div className="hidden md:block">
          {isLoading ? (
            <StatsRowSkeleton /> 
          ) : error? (
            <ErrorStatsRowState/>
          ) : (
            <StatsRow stats= {stats}/>
          )}
        </div>

        {/* Database List / Skeleton */}
        <div className="mt-8 hidden md:flex flex-col w-full flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {isLoading ? (
            <DatabaseListSkeleton />
          ) : error ? (
            <ErrorState errorMessage={errorMessage} />
          ) : isEmpty ? (
            <EmptyState
              icon={DatabaseIcon}
              mainMessage="No databases found"
              subMessage="Get started by adding your first database or connect to existing ones."
            />
          ) : isSearchEmpty ? (
            <EmptySearchState query={dbSearch} />
          ) : (
            <DatabaseList
              databases={filteredDatabases}
              onBackup={handleBackup}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Database Cards on mobile */}
        { isLoading ? (
          <div className="space-y-3 md:hidden overflow-y-auto pb-24">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg border shadow-sm animate-pulse h-24 w-full"
              />
            ))}
          </div>
        ) : error ? (
          <ErrorState errorMessage={errorMessage} />
        ) : isEmpty ? (
          <EmptyState
            icon={DatabaseIcon}
            mainMessage="No databases found"
            subMessage="Get started by adding your first database or connect to existing ones."
          />
        ) : isSearchEmpty ? (
            <EmptySearchState query={dbSearch} />
        ) : (
          <div className="space-y-3 md:hidden overflow-y-auto pb-24">
            {filteredDatabases.map(db => (
              <DatabaseCard key={db.id} db={db} onBackup={handleBackup} onEdit={handleEdit}  onDelete={handleDelete}/>
            ))}
          </div>
        )}

        {/* Add Database Overlay */}
        {isAddOpen && (
          <AddDatabaseModal
            onClose={() => setIsAddOpen(false)}
            onSuccess={()=>{
              loadDatabases()
              setIsAddOpen(false)
            }}
          />
        )}

        {/* Edit Database Overlay */}
        {editingDb && (
          <EditDatabaseModal
            dbId={editingDb.id}
            onClose={() => setEditingDb(null)}
            onSuccess={() => {
              loadDatabases()
              setEditingDb(null)
            }}
          />
        )}

        {/* Delete Database Overlay */}
        {deletingDb && (
          <DeleteDatabaseModal
            dbId={deletingDb.id}
            dbName={deletingDb.name}
            onClose={() => setDeletingDb(null)}
            onSuccess={() => {
              loadDatabases()
              setDeletingDb(null)
            }}
          />
        )}

        {/* Backup Database Overlay */}
        {backupDb && (
          <BackupDatabaseModal
            dbId={backupDb.id}
            dbName={backupDb.name}
            engine={backupDb.engine}
            environment={backupDb.environment}
            onClose={() => setBackupDb(null)}
            onBackup={() => {
              loadDatabases()
              setBackupDb(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default DatabasesPage
