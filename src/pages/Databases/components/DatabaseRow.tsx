import { DatabaseBackup } from "lucide-react";
import DatabaseActionsMenu from "./DatabaseActionsMenu";
import type { Database } from "../types";
import { useNavigate } from "react-router-dom"

type DatabaseRowProps = {
  db: Database;
  onBackup: (db: Database) => void;
  onEdit: (db: Database) => void;
  onDelete: (db: Database) => void;
};

function DatabaseRow({ db, onBackup, onEdit, onDelete }: DatabaseRowProps) {
  
  const navigate = useNavigate()

  function formatDateTime(value?: string | null) {
    if (!value) return "--";

    const date = new Date(value);

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  
  return (
    <tr 
      onClick={() => navigate(`/databases/${db.id}`)}
      className="bg-[#f7f7f7] text-[#8e9c97] hover:bg-green-100 cursor-pointer"
    >
      <td className="px-6 py-2 rounded-l-lg border-b">
        {db.name}
      </td>
      <td className="border-b">{db.engine}</td>
      <td className="border-b">{db.environment}</td>
      <td className="border-b">{db.status}</td>
      <td className="border-b">{formatDateTime(db.lastBackupAt)?? '--'}</td>
      <td className="px-6 text-right rounded-r-lg border-b relative">
        <div className="flex gap-2 justify-end">
          <button title="Backup Database" className="p-1 hover:text-green-600 cursor-pointer">
            <DatabaseBackup className="h-4 w-4 inline-block" onClick={(e) => {e.stopPropagation(); onBackup(db)}}/>
          </button>
          <div className="inline-flex flex-col items-end">
            <DatabaseActionsMenu onEdit={() => onEdit(db)} onDelete={() => onDelete(db)}/>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default DatabaseRow;