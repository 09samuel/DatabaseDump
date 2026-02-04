import { useEffect, useRef, useState } from "react";
import { Edit3, Trash2, EllipsisVertical } from "lucide-react";

type DatabaseActionsMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
};

function DatabaseActionsMenu({ onEdit, onDelete }: DatabaseActionsMenuProps) {
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
    <div className="inline-flex flex-col items-end" ref={menuRef}>
      <button
        title="Actions"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 hover:text-green-600 cursor-pointer"
      >
        <EllipsisVertical className="h-4 w-4 inline-block" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-[50%] w-26 bg-white rounded-md border shadow-md z-10"
        >
          <ul className="py-1 text-xs">
            <li>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsOpen(false);
                  onEdit();
                }}
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </button>
            </li>

            <li>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-600 hover:bg-red-50"
                onClick={() => {
                  setIsOpen(false);
                  onDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default DatabaseActionsMenu;