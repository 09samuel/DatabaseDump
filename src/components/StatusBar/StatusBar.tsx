type StatusBarProps = {
  type: "success" | "error"
  message: string
  onClose?: () => void
}


function StatusBar({ type, message, onClose }: StatusBarProps) { 
    const isSuccess = type === "success"

    return (
        <div className="fixed bottom-4 flex inset-x-0 justify-center z-70">
        <div 
            className={`flex items-center gap-4 px-4 py-3 rounded-lg shadow-lg text-sm
            ${
            isSuccess
              ? "bg-green-50 border-green-500 text-green-800"
              : "bg-red-50 border-red-500 text-red-800"
          }            `}
        >
            <span>{message}</span>

            {onClose && (
            <button
                onClick={onClose}
                className="text-black/80 hover:text-black text-xs"
            >
                ✕
            </button>
            )}
        </div>
        </div>
    )
}

export default StatusBar;