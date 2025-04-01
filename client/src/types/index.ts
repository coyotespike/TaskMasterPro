import { z } from "zod";
import { Task, ScheduleItem, PlannerResponse } from "@shared/schema";

export interface TaskInputProps {
  onAddTask: (task: string) => void;
}

export interface TaskListProps {
  tasks: Task[];
  onRemoveTask: (id: string) => void;
  onGenerateSchedule: () => void;
  isLoading: boolean;
}

export interface ExplanationCardProps {
  explanation: string;
}

export interface ScheduleDisplayProps {
  schedule: ScheduleItem[];
  isLoading: boolean;
  error: string | null;
  explanation: string | null;
}

export interface LoadingIndicatorProps {
  message?: string;
  subMessage?: string;
}

export interface PlannerState {
  tasks: Task[];
  schedule: ScheduleItem[] | null;
  explanation: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ApiError {
  message: string;
}
