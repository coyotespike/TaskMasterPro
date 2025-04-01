import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TaskInputProps } from "@/types";

const TaskInput = ({ onAddTask }: TaskInputProps) => {
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Add Your Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="task-input" className="block text-sm font-medium mb-1">
              Task Description
            </Label>
            <div className="relative">
              <Input
                id="task-input"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="E.g., Go for a 20 minute run"
                className="w-full"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-1">
                {error}
              </p>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit"
              className="bg-primary hover:bg-indigo-700 text-white"
            >
              Add Task
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskInput;
