import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, ScheduleItem, PlannerResponse } from '@shared/schema';
import { generateSchedule } from '@/services/llmService';
import { PlannerState } from '@/types';

export const usePlanner = () => {
  const [state, setState] = useState<PlannerState>({
    tasks: [],
    schedule: null,
    explanation: null,
    isLoading: false,
    error: null,
  });

  const addTask = useCallback((description: string) => {
    setState((prevState) => ({
      ...prevState,
      tasks: [
        ...prevState.tasks,
        {
          id: uuidv4(),
          description: description.trim(),
        },
      ],
    }));
  }, []);

  const removeTask = useCallback((id: string) => {
    setState((prevState) => ({
      ...prevState,
      tasks: prevState.tasks.filter((task) => task.id !== id),
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      error: null,
    }));
  }, []);

  const generateTaskSchedule = useCallback(async () => {
    if (state.tasks.length === 0) {
      setState((prevState) => ({
        ...prevState,
        error: "Please add at least one task before generating a schedule.",
      }));
      return;
    }

    setState((prevState) => ({
      ...prevState,
      isLoading: true,
      error: null,
    }));

    try {
      const plannerResponse = await generateSchedule(state.tasks);
      
      setState((prevState) => ({
        ...prevState,
        schedule: plannerResponse.schedule,
        explanation: plannerResponse.explanation,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error generating schedule:', error);
      
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred while generating your schedule.',
      }));
    }
  }, [state.tasks]);

  return {
    ...state,
    addTask,
    removeTask,
    generateTaskSchedule,
    clearError,
  };
};
