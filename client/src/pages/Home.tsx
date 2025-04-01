import { useEffect } from 'react';
import TaskInput from '@/components/TaskInput';
import TaskList from '@/components/TaskList';
import ScheduleDisplay from '@/components/ScheduleDisplay';
import { usePlanner } from '@/hooks/usePlanner';
import { CalendarClock, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import LoadingIndicator from '@/components/LoadingIndicator';

const Home = () => {
  const { 
    tasks,
    schedule,
    explanation,
    isLoading,
    isLoadingImages,
    isProcessing,
    imageProgress,
    error,
    addTask,
    removeTask,
    generateTaskSchedule,
    clearError,
    taskImageCache
  } = usePlanner();

  useEffect(() => {
    document.title = 'AI Task Planner';
  }, []);

  // Determine what's currently loading
  const getLoadingState = () => {
    if (isLoading) return 'schedule';
    if (isLoadingImages) return 'images';
    return null;
  };

  // If images are loading but the schedule is displayed, this is special handling
  const showImageLoadingIndicator = isLoadingImages && schedule && schedule.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50/30 dark:from-gray-900 dark:to-gray-800/30">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center mb-3">
            <CalendarClock className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-indigo-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              AI Task Planner
            </h1>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full py-3 px-6 max-w-2xl mx-auto shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 flex items-center justify-center">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Add your tasks below and our AI will create your optimized daily schedule
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Task Input */}
          <div className="lg:col-span-5 space-y-6">
            <TaskInput onAddTask={addTask} />
            <TaskList 
              tasks={tasks} 
              onRemoveTask={removeTask} 
              onGenerateSchedule={generateTaskSchedule}
              isLoading={isProcessing} // Use combined loading state
            />
          </div>

          {/* Right Column: Schedule Output */}
          <div className="lg:col-span-7 space-y-6">
            {/* Display image loading indicator if only images are loading */}
            {showImageLoadingIndicator ? (
              <div className="space-y-6">
                {explanation && <div className="mb-4">
                  <Card className="p-4">
                    <CardContent className="p-2">
                      <LoadingIndicator 
                        stage="images" 
                        message="Generating task visualizations..."
                        subMessage="Creating visual representations for your tasks"
                        progress={imageProgress.loaded / imageProgress.total * 100}
                      />
                    </CardContent>
                  </Card>
                </div>}
                
                <ScheduleDisplay 
                  schedule={schedule || []} 
                  isLoading={isLoading}
                  error={error}
                  explanation={explanation}
                />
              </div>
            ) : (
              <ScheduleDisplay 
                schedule={schedule || []} 
                isLoading={isLoading}
                error={error}
                explanation={explanation}
              />
            )}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p className="flex items-center justify-center">
            <span className="mr-1">Powered by</span> 
            <span className="text-primary font-medium">OpenAI</span>
            <span className="mx-2">•</span>
            <span>© {new Date().getFullYear()}</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
