import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { getConnectionOverview } from "../../../services/database.service";
import type { DatabaseOverview } from "../../Databases/types";
import ErrorState from "../../Databases/components/ErrorState";
import EmptyState from "../../Databases/components/EmptyState";
import { Library } from "lucide-react";



function DatabaseOverviewTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string |null>(null)
  const [data, setData] = useState<DatabaseOverview>();
  
  const { id } = useParams<{ id: string }>();

  const skeleton = loading ? "animate-pulse bg-gray-200" : "bg-white";
  const hidden = loading ? "opacity-0" : "";

  useEffect( ()=>{
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!id) {
          throw new Error("Database ID is missing in URL parameters.");
        }

        const data = await getConnectionOverview(id);  
        setData(data);

      } catch (error) {
        setError("Error fetching database overview data")
        console.error("Error fetching database overview data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  },[id])    


  if (error && !loading) {
    return (
      <ErrorState errorMessage={error} />
    );
  }

  if (!data && !loading) {
    return (
      <EmptyState icon={ Library } mainMessage={"No data found"} subMessage={""} />
    );
  }

  //calculate stats for the stats row
  function convertBytesToGB(bytes?: number | null): string {
    if (!bytes || bytes <= 0) return "0 GB";
    return `${(bytes / (1024 ** 3)).toFixed(2)} GB`;
  }

  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 me-2 pb-24 md:pb-0">
      {/* BIG: Database Overview */}
      <div className={`md:col-span-2 md:row-span-2 rounded-xl border min-h-65 p-6 ${skeleton}`}>
        <h3 className={`text-sm font-semibold text-gray-700 mb-4 ${hidden}`}>
          Database
        </h3>
        <dl className={`space-y-3 ${hidden}`}>
          <div>
            <dt className="text-xs text-gray-500">Name</dt>
            <dd className="text-sm font-medium">{data?.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Engine</dt>
            <dd className="text-sm">{data?.engine}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Environment</dt>
            <dd className="text-sm">{data?.environment}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Status</dt>
            <dd className="text-sm text-green-600">{data?.status}</dd>
          </div>
        </dl>
      </div>

      {/* TALL: Backup */}
      <div className={`md:row-span-2 rounded-xl border min-h-65 p-6 ${skeleton}`}>
        <h3 className={`text-sm font-semibold text-gray-700 mb-4 ${hidden}`}>
          Backup
        </h3>
        <dl className={`space-y-3 ${hidden}`}>
          <div>
            <dt className="text-xs text-gray-500">Last Backup</dt>
            <dd className="text-sm">
              {data?.lastBackupAt
                ? new Date(data?.lastBackupAt).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Status</dt>
            <dd className="text-sm text-green-600">
              {data?.lastBackupStatus ?? "—"}
            </dd>
          </div>
        </dl>
      </div>

      {/* SMALL: Connection */}
      <div className={`rounded-xl md:row-span-1 border p-6 min-h-40 ${skeleton}`}>
        <h3 className={`text-sm font-semibold text-gray-700 mb-4 ${hidden}`}>
          Connection
        </h3>
        <dl className={`space-y-3 ${hidden}`}>
          <div>
            <dt className="text-xs text-gray-500">Host</dt>
            <dd className="text-sm">{data?.host}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Port</dt>
            <dd className="text-sm">{data?.port}</dd>
          </div>
        </dl>
      </div>

      {/* WIDE: Storage */}
      <div className={`md:col-span-2 md:row-span-1 rounded-xl min-h-40 border p-6 ${skeleton}`}>
        <h3 className={`text-sm font-semibold text-gray-700 mb-4 ${hidden}`}>
          Storage
        </h3>
        <dl className={`space-y-3 ${hidden}`}>
          <div>
            <dt className="text-xs text-gray-500">Target</dt>
            <dd className="text-sm">{data?.lastStorageTarget?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Used</dt>
            <dd className="text-sm font-medium">
              {convertBytesToGB(data?.totalstorageUsed)}
            </dd>
          </div>
        </dl>
      </div>
    </div>


  )
}

export default DatabaseOverviewTab;