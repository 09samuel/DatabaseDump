import { DatabaseBackup, UserPlus } from "lucide-react";
import DatabaseActionsMenu from "./DatabaseActionsMenu";
import type { Database } from "../types";
import { useNavigate } from "react-router-dom"
import { formatDateTime } from "../../../utils/formatDate";

type DatabaseRowProps = {
  db: Database;
  onBackup: (db: Database) => void;
  onEdit: (db: Database) => void;
  onDelete: (db: Database) => void;
  onManageCollaborators: (db: Database) => void;
};

function DatabaseRow({ db, onBackup, onEdit, onDelete, onManageCollaborators }: DatabaseRowProps) {
  
  const navigate = useNavigate()
  
  return (
    <tr 
      onClick={() => navigate(`/dashboard/databases/${db.id}`)}
      className="bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-neutral-800 cursor-pointer"
    >
      <td className="px-6 py-2 rounded-l-lg border-b border-gray-200 dark:border-neutral-800 w-2/12 truncate">{db.name}</td>
      <td className="border-b border-gray-200 dark:border-neutral-800 w-2/12 truncate">{db.engine}</td>
      <td className="border-b border-gray-200 dark:border-neutral-800 w-2/12">{db.environment}</td>
      <td className="border-b border-gray-200 dark:border-neutral-800 w-1/12 hidden md:table-cell">{db.status}</td>
      <td className="border-b border-gray-200 dark:border-neutral-800 w-3/12 hidden md:table-cell">{formatDateTime(db.lastBackupAt)?? '--'}</td>
      <td className="px-6 w-2/12 text-right rounded-r-lg border-b border-gray-200 dark:border-neutral-800 relative">
        <div className="flex gap-2 justify-end">
          <button title="Manage Collaborators" onClick={(e) => {e.stopPropagation(); onManageCollaborators(db)}} className="p-1 hover:text-blue-600 text-gray-600 dark:text-gray-300 cursor-pointer">
            <UserPlus className="h-4 w-4 inline-block" />
          </button>
          <button title="Backup Database" onClick={(e) => {e.stopPropagation(); onBackup(db)}} className="p-1 hover:text-blue-600 text-gray-600 dark:text-gray-300 cursor-pointer">
            <DatabaseBackup className="h-4 w-4 inline-block" />
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