import { useEffect, useState } from "react";
import { LoadingIndicatorProps } from "@/types";
import { CheckCircle2 } from "lucide-react";

const LoadingIndicator = ({ 
  message = "Optimizing your schedule...", 
  subMessage = "Our AI is creating the best arrangement for your tasks" 
}: LoadingIndicatorProps) => {
  const [step, setStep] = useState(1);
  const [progressWidth, setProgressWidth] = useState(5);
  
  // Steps in the AI schedule generation process
  const steps = [
    { title: "Analyzing tasks...", description: "Examining priorities and requirements" },
    { title: "Calculating optimal timing...", description: "Determining the best sequence" },
    { title: "Generating the schedule...", description: "Creating your personalized plan" },
    { title: "Finalizing...", description: "Putting the finishing touches" }
  ];
  
  // Simulate the steps of processing
  useEffect(() => {
    // First step starts immediately
    const stepTimers = [
      setTimeout(() => {
        setStep(2);
        setProgressWidth(35);
      }, 1200),
      setTimeout(() => {
        setStep(3);
        setProgressWidth(70);
      }, 2500),
      setTimeout(() => {
        setStep(4);
        setProgressWidth(90);
      }, 3800)
    ];
    
    // Clean up all timers
    return () => {
      stepTimers.forEach(timer => clearTimeout(timer));
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary dark:border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-primary">
          {Math.round(progressWidth)}%
        </div>
      </div>
      
      <p className="mt-2 text-lg font-medium text-gray-800 dark:text-gray-200 text-center">
        {message}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4 text-center">
        {subMessage}
      </p>
      
      {/* Progress bar */}
      <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressWidth}%` }}
        ></div>
      </div>
      
      {/* Steps list */}
      <div className="w-full max-w-md">
        {steps.map((processStep, index) => (
          <div 
            key={index} 
            className={`flex items-start mb-3 ${index + 1 === step ? 'opacity-100' : index + 1 < step ? 'opacity-70' : 'opacity-40'}`}
          >
            <div className="flex-shrink-0 mr-3">
              {index + 1 < step ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
                  ${index + 1 === step ? 'border-primary text-primary animate-pulse' : 'border-gray-300 dark:border-gray-600'}`}>
                  {index + 1 === step && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  )}
                </div>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${index + 1 === step ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                {processStep.title}
              </p>
              {index + 1 === step && (
                <p className="text-xs text-gray-500 dark:text-gray-500">{processStep.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingIndicator;
