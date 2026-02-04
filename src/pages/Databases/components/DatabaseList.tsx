import type { Database } from "../types";
import DatabaseRow from "./DatabaseRow";
import DatabaseRowHeader from "./DatabaseRowHeader";

type DatabaseListProps = {
  databases: Database[],
  onBackup: (db: Database) => void,
  onEdit: (db: Database) => void
  onDelete: (db: Database) => void
}

function DatabaseList( { databases, onBackup, onEdit, onDelete }: DatabaseListProps) {
  return (
    <div>
      <table className="w-full border-separate border-spacing-y-2">
        <thead className="sticky top-0 z-10">
          <DatabaseRowHeader/>
        </thead>
        <tbody>
          {databases.map((db) => (
            <DatabaseRow
              key={db.id}
              db={db}
              onBackup={onBackup}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}



export default DatabaseList

