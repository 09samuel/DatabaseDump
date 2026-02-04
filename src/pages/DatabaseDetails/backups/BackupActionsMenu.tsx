import { useState, useRef, useEffect } from "react";
import type { BackupStatus } from "../../Databases/types";
import { EllipsisVertical } from "lucide-react";

type BackupActionsMenuProps = {
  status: BackupStatus;
};

function BackupActionsMenu({ status }: BackupActionsMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            setOpen(false);
        }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const baseItem = "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-gray-700";
    const dangerItem = "w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50";

    return (
        <div className="relative" ref={ref}>
        <button
            onClick={() => setOpen(!open)}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Backup actions"
            title="Backup actions"
        >
            <EllipsisVertical className="h-4 w-4" />
        </button>

        {open && (
            <div className="absolute right-0 w-28 rounded-md border bg-white shadow-md z-10">
                <ul className="py-1">
                    <li>
                        <button className={baseItem}>View details</button>
                    </li>

                    {status === "Success" && (
                        <li>
                            <button className={baseItem}>Download</button>
                        </li>
                    )}

                    <li>
                        <button className={baseItem}>Rename</button>
                    </li>

                    <li>
                        <button className={baseItem}>Add tags</button>
                    </li>

                    <hr className="my-1" />

                    {status === "Success" && (
                        <li>
                            <button className={baseItem}>Keep forever</button>
                        </li>
                    )}

                    <li>
                        <button className={dangerItem}>Delete</button>
                    </li>
                </ul>
            </div>
        )}
        </div>
    );
}

export default BackupActionsMenu;
