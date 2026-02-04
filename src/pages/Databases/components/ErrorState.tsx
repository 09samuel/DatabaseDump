import { AlertCircle } from "lucide-react";

type ErrorStateProps = {
  errorMessage: string | null
}

function ErrorState( { errorMessage = "Failed to load databases. Please try again." }: ErrorStateProps ) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="w-12 h-12 text-green-600 mb-6" />
        <span className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
        </span>
        <span className="text-gray-500 max-w-md mb-6">
            {errorMessage}
        </span>

    </div>
  );
}

export default ErrorState;
