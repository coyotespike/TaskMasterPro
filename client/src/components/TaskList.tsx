import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ListTodo, CalendarRange, Calendar } from "lucide-react";
import { TaskListProps } from "@/types";

const TaskList = ({ tasks, onRemoveTask, onGenerateSchedule, isLoading }: TaskListProps) => {
  const isEmpty = tasks.length === 0;

  return (
    <Card className="card-shadow border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-indigo-400/10 pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold flex items-center">
            <ListTodo className="w-5 h-5 mr-2 text-primary" />
            Your Tasks
          </CardTitle>
          <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-primary/15 text-primary">
            {tasks.length} tasks
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {isEmpty ? (
          <div className="py-10 text-center">
            <div className="animate-float">
              <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">No tasks added yet</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Add tasks above to create your schedule</p>
          </div>
        ) : (
          <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {tasks.map((task, index) => (
              <li 
                key={task.id}
                className="task-item-enter-active flex items-center justify-between group p-4 bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700/50 transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-gray-800 dark:text-gray-200 break-words pr-2 font-medium">
                  {task.description}
                </span>
                <button 
                  onClick={() => onRemoveTask(task.id)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 bg-white dark:bg-gray-700 p-1.5 rounded-full hover:shadow-md"
                  aria-label="Remove task"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-8 flex justify-center">
          <Button 
            disabled={isEmpty || isLoading}
            onClick={onGenerateSchedule}
            className={`btn-gradient py-5 px-6 rounded-xl transition-all duration-300 font-medium flex items-center ${isLoading ? 'opacity-80' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-5 w-5" />
                Generate Schedule
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
