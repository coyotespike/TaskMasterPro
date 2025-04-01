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
  stage?: 'schedule' | 'images' | 'combined';
  progress?: number;
}

export interface PlannerState {
  tasks: Task[];
  schedule: ScheduleItem[] | null;
  explanation: string | null;
  isLoading: boolean;
  isLoadingImages: boolean;
  error: string | null;
  imageProgress: {
    total: number;
    loaded: number;
  };
}

export interface ApiError {
  message: string;
}
