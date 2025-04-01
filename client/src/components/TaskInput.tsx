import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TaskInputProps } from "@/types";
import { PlusCircle, Sparkles } from "lucide-react";

const TaskInput = ({ onAddTask }: TaskInputProps) => {
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTask = taskDescription.trim();
    
    if (!trimmedTask) {
      setError("Please enter a task description");
      return;
    }
    
    setError(null);
    onAddTask(trimmedTask);
    setTaskDescription("");
  };

  return (
    <Card className="card-shadow border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-indigo-400/10 pb-3 border-b">
        <CardTitle className="text-xl font-semibold flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          Add Your Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="task-input" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Task Description
            </Label>
            <div className={`relative transition-all duration-300 ${isInputFocused ? 'scale-[1.01]' : 'scale-100'}`}>
              <Input
                id="task-input"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="E.g., Go for a 20 minute run"
                className="w-full py-5 rounded-xl shadow-sm border-2 border-gray-100 dark:border-gray-800 focus-within:border-primary/20 transition-all duration-300 input-focus-ring"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {error}
              </p>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit"
              className="btn-gradient py-5 px-5 rounded-xl transition-all duration-300 font-medium"
              disabled={!taskDescription.trim()}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Task
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskInput;
