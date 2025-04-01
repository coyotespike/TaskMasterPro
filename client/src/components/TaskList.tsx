import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { TaskListProps } from "@/types";

const TaskList = ({ tasks, onRemoveTask, onGenerateSchedule, isLoading }: TaskListProps) => {
  const isEmpty = tasks.length === 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Your Tasks</CardTitle>
          <span className="text-sm text-gray-500 dark:text-gray-400">{tasks.length} tasks</span>
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="py-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p className="mt-2 text-gray-500 dark:text-gray-400">No tasks added yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add tasks above to get started</p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-[400px] overflow-y-auto">
            {tasks.map((task) => (
              <li 
                key={task.id}
                className="flex items-center justify-between group p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-md transition"
              >
                <span className="text-gray-800 dark:text-gray-200 break-words pr-2">
                  {task.description}
                </span>
                <button 
                  onClick={() => onRemoveTask(task.id)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  aria-label="Remove task"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-6 flex justify-center">
          <Button 
            disabled={isEmpty || isLoading}
            onClick={onGenerateSchedule}
            className="px-6 py-2.5 bg-primary hover:bg-indigo-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Generate Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
