type StatusBarProps = {
  type: "success" | "error"
  message: string
  onClose?: () => void
}


function StatusBar({ type, message, onClose }: StatusBarProps) { 
    const isSuccess = type === "success"

    return (
        <div className="fixed bottom-4 flex inset-x-0 justify-center z-150">
        <div 
            className={`flex items-center gap-4 px-4 py-3 rounded-lg shadow-lg text-sm
            ${
            isSuccess
                            ? "bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-500/60 dark:text-blue-200"
                            : "bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-500/60 dark:text-red-200"
          }            `}
        >
            <span>{message}</span>

            {onClose && (
            <button
                onClick={onClose}
                className="text-black/80 hover:text-black text-xs dark:text-white/70 dark:hover:text-white"
            >
                ✕
            </button>
            )}
        </div>
        </div>
    )
}

export default StatusBar;