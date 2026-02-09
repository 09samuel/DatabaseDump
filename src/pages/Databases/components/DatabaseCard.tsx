import { DatabaseBackup, Edit3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom"
import type { Database } from "../types";
import { useEffect, useRef, useState } from "react";

type DatabaseRowProps = {
  db: Database;
  onBackup: (db: Database) => void;
  onEdit: (db: Database) => void;
  onDelete: (db: Database) => void;
};

function DatabaseCard({ db, onBackup, onEdit, onDelete }: DatabaseRowProps) {

    const navigate = useNavigate()

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            onClick={() => navigate(`/databases/${db.id}`)}
            className="bg-white rounded-lg p-4 shadow-sm border flex justify-between gap-4"
        >
            <div className="min-w-0">
                <p className="font-medium truncate">{db.name}</p>
                <p className="text-sm text-gray-500">{db.engine}</p>
                <p className="text-xs text-gray-400">{db.environment}</p>
            </div>

            <div className="flex items-start gap-2 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); onBackup(db); }} className="p-1 text-gray-700 hover:bg-gray-100" >
                    <DatabaseBackup className="h-4 w-4" />
                </button>

                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit(db); }} className="p-1 text-gray-700 hover:bg-gray-100" >
                    <Edit3 className="h-4 w-4" />
                </button>

                <button onClick={(e) => { e.stopPropagation();  setIsOpen(false); onDelete(db);}} className="p-1 text-red-600 hover:bg-red-50" >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

        </div>
    );
}

export default DatabaseCard