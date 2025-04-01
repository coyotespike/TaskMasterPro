import { useEffect } from 'react';
import TaskInput from '@/components/TaskInput';
import TaskList from '@/components/TaskList';
import ScheduleDisplay from '@/components/ScheduleDisplay';
import { usePlanner } from '@/hooks/usePlanner';

const Home = () => {
  const { 
    tasks,
    schedule,
    explanation,
    isLoading,
    error,
    addTask,
    removeTask,
    generateTaskSchedule,
    clearError
  } = usePlanner();

  useEffect(() => {
    document.title = 'Daily Task Planner';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary dark:text-indigo-400 mb-2">Daily Task Planner</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Add your tasks below and our AI will organize them into an optimized daily schedule.
        </p>
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
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Schedule Output */}
        <div className="lg:col-span-7 space-y-6">
          <ScheduleDisplay 
            schedule={schedule || []} 
            isLoading={isLoading}
            error={error}
            explanation={explanation}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
