import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, ScheduleItem, PlannerResponse } from '@shared/schema';
import { generateSchedule } from '@/services/llmService';
import { getTaskImage } from '@/services/imageService';
import { PlannerState } from '@/types';

export const usePlanner = () => {
  const [state, setState] = useState<PlannerState>({
    tasks: [],
    schedule: null,
    explanation: null,
    isLoading: false,
    isLoadingImages: false,
    error: null,
    imageProgress: {
      total: 0,
      loaded: 0
    }
  });

  // In-memory cache for task images
  const [taskImageCache] = useState<Record<string, string>>({});

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

  // Load images for tasks in the schedule
  useEffect(() => {
    const loadTaskImages = async () => {
      // Only run if we have a schedule and aren't already loading images
      if (!state.schedule || state.isLoadingImages || state.schedule.length === 0) {
        return;
      }

      // Find tasks that need images generated
      const tasksNeedingImages = state.schedule.filter(
        item => !taskImageCache[item.taskDescription]
      );

      if (tasksNeedingImages.length === 0) {
        return;
      }

      // Start loading images
      setState(prev => ({
        ...prev,
        isLoadingImages: true,
        imageProgress: {
          total: tasksNeedingImages.length,
          loaded: 0
        }
      }));

      // Process tasks one by one to show progress
      for (let i = 0; i < tasksNeedingImages.length; i++) {
        const task = tasksNeedingImages[i];
        try {
          // Fetch the image for this task
          const imageUrl = await getTaskImage(task.taskDescription);
          
          // Update the cache
          taskImageCache[task.taskDescription] = imageUrl;
          
          // Update progress
          setState(prev => ({
            ...prev,
            imageProgress: {
              ...prev.imageProgress,
              loaded: prev.imageProgress.loaded + 1
            }
          }));
        } catch (error) {
          console.error(`Failed to generate image for task: ${task.taskDescription}`, error);
        }
      }

      // All images loaded
      setState(prev => ({
        ...prev,
        isLoadingImages: false
      }));
    };

    loadTaskImages();
  }, [state.schedule, state.isLoadingImages, taskImageCache]);

  const generateTaskSchedule = useCallback(async () => {
    if (state.tasks.length === 0) {
      setState((prevState) => ({
        ...prevState,
        error: "Please add at least one task before generating a schedule.",
      }));
      return;
    }

    // Reset any existing schedule and start loading
    setState((prevState) => ({
      ...prevState,
      schedule: null,
      explanation: null,
      isLoading: true,
      isLoadingImages: false,
      imageProgress: { total: 0, loaded: 0 },
      error: null,
    }));

    try {
      const plannerResponse = await generateSchedule(state.tasks);
      
      setState((prevState) => ({
        ...prevState,
        schedule: plannerResponse.schedule,
        explanation: plannerResponse.explanation,
        isLoading: false,
        // Image loading will begin automatically via the useEffect
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

  // Combine both loading states
  const isProcessing = state.isLoading || state.isLoadingImages;

  return {
    ...state,
    isProcessing,
    addTask,
    removeTask,
    generateTaskSchedule,
    clearError,
    taskImageCache,
  };
};
