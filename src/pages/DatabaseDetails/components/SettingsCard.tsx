
type SettingsCardProps = {
    title: string;
    editing: boolean;
    disableEdit?: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    children: React.ReactNode;
}

function SettingsCard({ title, editing, disableEdit, onEdit, onCancel, onSave, children,}: SettingsCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>

            {!editing ? (
            <button
                onClick={onEdit}
                disabled={disableEdit}
                // className="text-sm text-blue-600 hover:underline"
                className={`text-sm text-blue-600 ${
                    disableEdit
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:underline"
                }`}
            >
                Edit settings
            </button>
            ) : (
            <div className="flex gap-4">
                <button className="text-sm text-green-600 hover:underline" onClick={onSave}>
                Save
                </button>
                <button
                onClick={onCancel}
                className="text-sm text-gray-500 hover:underline"
                >
                Cancel
                </button>
            </div>
            )}
        </div>

        <div className={`space-y-4 transition-all duration-150 ${ editing ? "opacity-100 pointer-events-auto": "opacity-60 pointer-events-none" }`}>
            {children}
        </div>
    </div>
  );
}

export default SettingsCard