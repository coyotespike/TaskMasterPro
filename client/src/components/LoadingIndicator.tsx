import { LoadingIndicatorProps } from "@/types";

const LoadingIndicator = ({ 
  message = "Optimizing your schedule...", 
  subMessage = "Our AI is creating the best arrangement for your tasks" 
}: LoadingIndicatorProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-16 h-16 border-4 border-primary dark:border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-700 dark:text-gray-300 text-center">
        {message}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
        {subMessage}
      </p>
    </div>
  );
};

export default LoadingIndicator;
