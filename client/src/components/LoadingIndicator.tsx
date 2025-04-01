import { useEffect, useState } from "react";
import { LoadingIndicatorProps } from "@/types";
import { CheckCircle2, Sparkles, Palette, Clock } from "lucide-react";

const LoadingIndicator = ({ 
  message = "Optimizing your schedule...", 
  subMessage = "Our AI is creating the best arrangement for your tasks",
  stage = "schedule", // 'schedule' or 'images' or 'combined'
  progress
}: LoadingIndicatorProps) => {
  const [step, setStep] = useState(1);
  const [progressWidth, setProgressWidth] = useState(progress || 5);
  
  // Steps in the AI schedule generation process
  const scheduleSteps = [
    { 
      title: "Analyzing tasks...", 
      description: "Examining priorities and requirements",
      icon: <Clock className="w-5 h-5 text-indigo-500" />
    },
    { 
      title: "Calculating optimal timing...", 
      description: "Determining the best sequence",
      icon: <Sparkles className="w-5 h-5 text-indigo-500" />
    },
    { 
      title: "Generating the schedule...", 
      description: "Creating your personalized plan",
      icon: <Clock className="w-5 h-5 text-indigo-500" />
    },
    { 
      title: "Finalizing schedule...", 
      description: "Putting the finishing touches",
      icon: <CheckCircle2 className="w-5 h-5 text-indigo-500" />
    }
  ];

  // Steps in the image generation process
  const imageSteps = [
    {
      title: "Preparing task visuals...",
      description: "Setting up task visualization parameters",
      icon: <Palette className="w-5 h-5 text-indigo-500" />
    },
    {
      title: "Generating task icons...",
      description: "Creating custom visuals for each task",
      icon: <Palette className="w-5 h-5 text-indigo-500" />
    },
    {
      title: "Optimizing visuals...",
      description: "Refining and enhancing task images",
      icon: <Sparkles className="w-5 h-5 text-indigo-500" />
    },
    {
      title: "Finalizing visuals...",
      description: "Adding visuals to your schedule",
      icon: <CheckCircle2 className="w-5 h-5 text-indigo-500" />
    }
  ];

  // Combined steps (both schedule and images)
  const combinedSteps = [
    {
      title: "Analyzing your tasks...",
      description: "Examining task priorities and requirements",
      icon: <Clock className="w-5 h-5 text-indigo-500" />
    },
    {
      title: "Generating your schedule...",
      description: "Creating an optimized arrangement for your day",
      icon: <Sparkles className="w-5 h-5 text-indigo-500" />
    },
    {
      title: "Creating task visuals...",
      description: "Generating custom visual representations",
      icon: <Palette className="w-5 h-5 text-indigo-500" />
    },
    {
      title: "Finalizing your planner...",
      description: "Combining schedule and visuals into your final plan",
      icon: <CheckCircle2 className="w-5 h-5 text-indigo-500" />
    }
  ];
  
  // Choose which steps to show based on the stage
  const steps = stage === 'schedule' 
    ? scheduleSteps 
    : stage === 'images' 
      ? imageSteps 
      : combinedSteps;
  
  // Update progress when prop changes
  useEffect(() => {
    if (progress !== undefined) {
      setProgressWidth(progress);
      
      // Update step based on progress
      if (progress >= 75) {
        setStep(4);
      } else if (progress >= 50) {
        setStep(3);
      } else if (progress >= 25) {
        setStep(2);
      } else {
        setStep(1);
      }
      
      return; // Don't run the animation if progress is provided
    }
    
    // Simulate the steps of processing if no progress is provided
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
  }, [progress]);
  
  return (
    <div className="flex flex-col items-center justify-center py-6">
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
                  {index + 1 === step && processStep.icon}
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
