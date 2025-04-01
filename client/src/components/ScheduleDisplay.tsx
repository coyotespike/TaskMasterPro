import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingIndicator from "./LoadingIndicator";
import ExplanationCard from "./ExplanationCard";
import { 
  AlertCircle, Clock, Coffee, Briefcase, Book, 
  ShoppingCart, Dumbbell, Utensils, HeartPulse, 
  Bike, Phone, Mail, Music, VideoIcon, Users, Home,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleDisplayProps } from "@/types";
import { getTaskImage } from "@/services/imageService";

const ScheduleDisplay = ({ schedule, isLoading, error, explanation }: ScheduleDisplayProps) => {
  const hasSchedule = schedule && schedule.length > 0 && explanation;
  const [taskImages, setTaskImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  // Load images for each task when schedule changes
  useEffect(() => {
    if (schedule && schedule.length > 0) {
      // Only load images for tasks that don't already have images
      const tasksNeedingImages = schedule.filter(
        item => !taskImages[item.taskDescription] && !loadingImages[item.taskDescription]
      );
      
      if (tasksNeedingImages.length === 0) return;
      
      // Mark these tasks as loading
      const newLoadingState = { ...loadingImages };
      tasksNeedingImages.forEach(item => {
        newLoadingState[item.taskDescription] = true;
      });
      setLoadingImages(newLoadingState);
      
      // Load images for each task
      tasksNeedingImages.forEach(async (item) => {
        try {
          const imageUrl = await getTaskImage(item.taskDescription);
          setTaskImages(prev => ({
            ...prev,
            [item.taskDescription]: imageUrl
          }));
        } catch (error) {
          console.error(`Failed to load image for task: ${item.taskDescription}`, error);
        } finally {
          setLoadingImages(prev => ({
            ...prev,
            [item.taskDescription]: false
          }));
        }
      });
    }
  }, [schedule]);
  
  // Function to determine which icon to show based on task description
  const getTaskIcon = (taskDescription: string) => {
    const description = taskDescription.toLowerCase();
    
    if (description.includes('coffee') || description.includes('tea') || description.includes('breakfast')) {
      return <Coffee className="h-4 w-4 text-white" />;
    } else if (description.includes('work') || description.includes('meeting') || description.includes('call') || description.includes('email')) {
      return <Briefcase className="h-4 w-4 text-white" />;
    } else if (description.includes('read') || description.includes('study') || description.includes('learning')) {
      return <Book className="h-4 w-4 text-white" />;
    } else if (description.includes('shop') || description.includes('buy') || description.includes('purchase')) {
      return <ShoppingCart className="h-4 w-4 text-white" />;
    } else if (description.includes('workout') || description.includes('exercise') || description.includes('gym') || description.includes('run')) {
      return <Dumbbell className="h-4 w-4 text-white" />;
    } else if (description.includes('lunch') || description.includes('dinner') || description.includes('eat') || description.includes('food')) {
      return <Utensils className="h-4 w-4 text-white" />;
    } else if (description.includes('doctor') || description.includes('health') || description.includes('appointment')) {
      return <HeartPulse className="h-4 w-4 text-white" />;
    } else if (description.includes('bike') || description.includes('cycling') || description.includes('travel')) {
      return <Bike className="h-4 w-4 text-white" />;
    } else if (description.includes('call') || description.includes('phone')) {
      return <Phone className="h-4 w-4 text-white" />;
    } else if (description.includes('mail') || description.includes('post')) {
      return <Mail className="h-4 w-4 text-white" />;
    } else if (description.includes('music') || description.includes('listen') || description.includes('song')) {
      return <Music className="h-4 w-4 text-white" />;
    } else if (description.includes('video') || description.includes('movie') || description.includes('watch')) {
      return <VideoIcon className="h-4 w-4 text-white" />;
    } else if (description.includes('friend') || description.includes('family') || description.includes('social') || description.includes('meet')) {
      return <Users className="h-4 w-4 text-white" />;
    } else if (description.includes('home') || description.includes('clean') || description.includes('house')) {
      return <Home className="h-4 w-4 text-white" />;
    }
    
    // Default icon
    return <Clock className="h-4 w-4 text-white" />;
  };

  // Empty state
  if (!hasSchedule && !isLoading && !error) {
    return (
      <Card className="text-center p-8">
        <CardContent className="pt-8">
          <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="mt-4 text-xl font-medium">No Schedule Generated Yet</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Add tasks and click "Generate Schedule" to create your optimized daily plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-8">
        <CardContent className="pt-0">
          <LoadingIndicator />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-l-4 border-red-500 p-6">
        <CardContent className="pt-0">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-500">Error Generating Schedule</h3>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button variant="link" className="text-sm font-medium text-primary dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 p-0">
                  Try again
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Schedule result
  return (
    <div className="space-y-6">
      {explanation && <ExplanationCard explanation={explanation} />}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Your Optimized Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative ml-4">
            <div className="timeline-connector"></div>
            
            {schedule?.map((item, index) => (
              <div key={index} className="relative z-10 mb-8">
                <div className="flex items-center">
                  <div className="bg-primary dark:bg-indigo-600 h-8 w-8 rounded-full flex items-center justify-center -ml-4 ring-4 ring-white dark:ring-gray-800">
                    {getTaskIcon(item.taskDescription)}
                  </div>
                  <div className="ml-4 font-medium text-primary dark:text-indigo-400">
                    {item.time}
                  </div>
                </div>
                <div className="ml-8 mt-3">
                  <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start">
                      {taskImages[item.taskDescription] ? (
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-16 h-16 rounded-md overflow-hidden">
                            <img 
                              src={taskImages[item.taskDescription]} 
                              alt={`Icon for ${item.taskDescription}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ) : loadingImages[item.taskDescription] ? (
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-16 h-16 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center animate-pulse">
                            <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>
                      ) : null}
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{item.taskDescription}</h3>
                        {item.details && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleDisplay;
