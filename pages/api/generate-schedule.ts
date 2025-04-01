import { OpenAI } from "openai";
import type { NextApiRequest, NextApiResponse } from 'next';

// Simplified Task type for API endpoint
interface Task {
  id: string;
  description: string;
};

type ScheduleItem = {
  time: string;
  taskDescription: string;
};

type ScheduleResponse = {
  explanation: string;
  schedule: ScheduleItem[];
};

type ErrorResponse = {
  error: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScheduleResponse | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Tasks array is required and must not be empty' });
    }

    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key is missing in environment variables');
      return res.status(500).json({ 
        error: 'OpenAI API key is missing', 
        details: 'Please check the environment variables' 
      });
    }

    // Only use mock responses if explicitly configured
    if (process.env.USE_MOCK_RESPONSES === 'true') {
      console.log('Using mock schedule response');
      return res.json(generateMockSchedule(tasks));
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const taskDescriptions = tasks.map(task => task.description);
    const prompt = `
    Given these tasks:
    - ${taskDescriptions.join('\n- ')}

    Please create an optimized daily schedule with specific times and a brief explanation of your reasoning. 

    When formulating task descriptions in the schedule, be sure to use descriptive words that indicate the category of the task, such as:
    - For eating tasks, include words like "breakfast", "lunch", "dinner", "food", etc.
    - For work-related tasks, include words like "work", "meeting", "email", etc.
    - For fitness tasks, include words like "workout", "exercise", "gym", "run", etc.
    - For reading or studying, include words like "read", "study", "learning", etc.
    - For shopping, include words like "shop", "buy", "purchase", etc.

    Format your response exactly like this:

    EXPLANATION: [Your explanation of why you ordered the tasks this way]

    SCHEDULE:
    [Time]: [Task description with category-specific words]
    [Time]: [Task description with category-specific words]
    ...
    `;

    console.log('Generating schedule for tasks:', taskDescriptions);
    
    // Set a timeout to prevent hanging indefinitely
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 30000);
    });

    // Make the actual API request
    const apiRequestPromise = openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that helps users organize and optimize their daily tasks into a schedule."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    // Race between the timeout and the actual request
    const response = await Promise.race([apiRequestPromise, timeoutPromise]) as { 
      choices: { message: { content: string } }[] 
    };
    
    if (!response.choices || !response.choices[0].message.content) {
      throw new Error("Received empty response from OpenAI");
    }

    const result = response.choices[0].message.content;
    const parsedResponse = parseResponse(result);
    
    console.log('Successfully generated schedule');
    return res.json(parsedResponse);
  } catch (error) {
    console.error('Error generating schedule:', error);
    
    // Provide more detailed error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        return res.status(504).json({
          error: 'Request to OpenAI timed out',
          details: 'The OpenAI service is taking too long to respond'
        });
      } else if (error.message.includes('authentication')) {
        return res.status(401).json({
          error: 'Invalid OpenAI API key',
          details: 'The provided API key is incorrect or has expired'
        });
      } else if (error.message.includes('billing') || error.message.includes('quota')) {
        return res.status(402).json({
          error: 'OpenAI billing issue',
          details: 'There may be an issue with your OpenAI account quota or billing'
        });
      } else if (error.message.includes('rate limit') || error.message.includes('rate_limit_exceeded')) {
        return res.status(429).json({
          error: 'OpenAI rate limit exceeded',
          details: 'Too many requests sent to OpenAI in a short time'
        });
      }
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate schedule', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Parse the LLM response into our data structure
function parseResponse(text: string): ScheduleResponse {
  try {
    const explanation = text.match(/EXPLANATION:\s*([\s\S]*?)(?=SCHEDULE:|$)/i)?.[1]?.trim() || "Schedule optimized based on task requirements.";
    
    const scheduleMatch = text.match(/SCHEDULE:\s*([\s\S]*?)$/i)?.[1];
    const scheduleLines = scheduleMatch?.trim().split('\n') || [];
    
    const scheduleItems: ScheduleItem[] = scheduleLines
      .map(line => {
        const match = line.match(/([0-9:]{1,5}(?:\s*[AP]M)?)\s*(?:-|:)?\s*(.*)/i);
        if (!match) return null;
        
        const [, time, description] = match;
        
        return {
          time: time.trim(),
          taskDescription: description.trim(),
        };
      })
      .filter((item): item is ScheduleItem => item !== null);
    
    return {
      explanation,
      schedule: scheduleItems
    };
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    throw new Error("Failed to parse the AI response. Please try again.");
  }
}

// Mock schedule generation for development
function generateMockSchedule(tasks: Task[]): ScheduleResponse {
  const scheduleItems: ScheduleItem[] = [];
  let currentTime = 9; // Start at 9 AM
  
  // Sort tasks in a more intelligent way
  // Group similar tasks and distribute them throughout the day
  const workTasks = tasks.filter(t => 
    t.description.toLowerCase().includes('work') || 
    t.description.toLowerCase().includes('meet') || 
    t.description.toLowerCase().includes('call')
  );
  
  const mealTasks = tasks.filter(t => 
    t.description.toLowerCase().includes('eat') || 
    t.description.toLowerCase().includes('lunch') || 
    t.description.toLowerCase().includes('breakfast') ||
    t.description.toLowerCase().includes('dinner')
  );
  
  const exerciseTasks = tasks.filter(t => 
    t.description.toLowerCase().includes('exercise') || 
    t.description.toLowerCase().includes('gym') || 
    t.description.toLowerCase().includes('workout')
  );
  
  const otherTasks = tasks.filter(t => 
    !workTasks.includes(t) && !mealTasks.includes(t) && !exerciseTasks.includes(t)
  );
  
  // Morning: Start with breakfast, then work
  const morningTasks = [
    ...mealTasks.filter(t => t.description.toLowerCase().includes('breakfast')),
    ...workTasks.slice(0, Math.ceil(workTasks.length / 2)),
    ...otherTasks.slice(0, Math.ceil(otherTasks.length / 3))
  ];
  
  // Midday: Lunch, then exercise, then more work
  const middayTasks = [
    ...mealTasks.filter(t => t.description.toLowerCase().includes('lunch')),
    ...exerciseTasks,
    ...workTasks.slice(Math.ceil(workTasks.length / 2)),
    ...otherTasks.slice(Math.ceil(otherTasks.length / 3), Math.ceil(2 * otherTasks.length / 3))
  ];
  
  // Evening: Dinner and remaining tasks
  const eveningTasks = [
    ...mealTasks.filter(t => 
      t.description.toLowerCase().includes('dinner') || 
      (!t.description.toLowerCase().includes('breakfast') && !t.description.toLowerCase().includes('lunch'))
    ),
    ...otherTasks.slice(Math.ceil(2 * otherTasks.length / 3))
  ];
  
  // Combine all tasks in a logical daily order
  const organizedTasks = [...morningTasks, ...middayTasks, ...eveningTasks];
  
  // If we ended up with an empty list (due to filtering), just use the original tasks
  const tasksToSchedule = organizedTasks.length > 0 ? organizedTasks : tasks;
  
  // Assign times
  for (const task of tasksToSchedule) {
    const adjustedTime = currentTime >= 12 
      ? `${currentTime > 12 ? currentTime - 12 : currentTime}:00 PM`
      : `${currentTime}:00 AM`;
    
    // Add task to schedule
    scheduleItems.push({
      time: adjustedTime,
      taskDescription: task.description
    });
    
    // Increment time by 1-2 hours
    currentTime += 1 + Math.floor(Math.random() * 2);
  }
  
  return {
    explanation: "Your optimized schedule balances productivity with wellbeing. Work tasks are distributed to maximize focus periods, while meals and exercise are strategically placed to maintain energy throughout the day. Personal tasks are arranged to create a balanced daily flow.",
    schedule: scheduleItems
  };
}