import { Icon, type LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon
  mainMessage: string | null
  subMessage: string |null
}

function EmptyState({icon: Icon, mainMessage, subMessage}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Icon className="w-12 h-12 text-gray-400 mb-6" />
        <span className="text-xl font-semibold text-gray-900 mb-2">
            {mainMessage}
        </span>
        <span className="text-gray-500 max-w-md">
            {subMessage}
        </span>
    </div>
  );
}

export default EmptyState;
