import { Task, PlannerResponse, ScheduleItem } from "@shared/schema";
import { ApiError } from "@/types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Get API key from environment variables or API
let cachedApiKey: string | null = null;

const getApiKey = async (): Promise<string> => {
  // If we already fetched the API key, return it
  if (cachedApiKey) {
    return cachedApiKey;
  }
  
  // First try from environment variables (for local development)
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envApiKey) {
    cachedApiKey = envApiKey;
    return envApiKey;
  }
  
  // Then try to fetch from our server endpoint
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      if (config.openaiApiKey) {
        cachedApiKey = config.openaiApiKey;
        return config.openaiApiKey;
      }
    }
  } catch (error) {
    console.error('Error fetching API key from server:', error);
  }
  
  return "";
};

// Get API provider from environment variables or default to OpenAI
const getApiProvider = (): "openai" | "anthropic" => {
  const provider = import.meta.env.VITE_API_PROVIDER || "openai";
  return provider === "anthropic" ? "anthropic" : "openai";
};

// Create a prompt for the LLM
const createPrompt = (tasks: Task[]): string => {
  const taskDescriptions = tasks.map(task => task.description);
  
  return `
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
};

// Parse the LLM response into our data structure
const parseResponse = (text: string): PlannerResponse => {
  try {
    const explanation = text.match(/EXPLANATION:\s*([\s\S]*?)(?=SCHEDULE:|$)/i)?.[1]?.trim() || "Schedule optimized based on task requirements.";
    
    const scheduleMatch = text.match(/SCHEDULE:\s*([\s\S]*?)$/i)?.[1];
    const scheduleLines = scheduleMatch?.trim().split('\n') || [];
    
    const scheduleItems = scheduleLines
      .map(line => {
        const match = line.match(/([0-9:]{1,5}(?:\s*[AP]M)?)\s*(?:-|:)?\s*(.*)/i);
        if (!match) return null;
        
        const [, time, description] = match;
        
        return {
          time: time.trim(),
          taskDescription: description.trim(),
        };
      })
      .filter((item): item is ScheduleItem => 
        item !== null
      );
    
    return {
      explanation,
      schedule: scheduleItems
    };
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    throw new Error("Failed to parse the AI response. Please try again.");
  }
};

// API call to OpenAI
const callOpenAI = async (tasks: Task[]): Promise<PlannerResponse> => {
  const apiKey = await getApiKey();
  
  if (!apiKey) {
    throw new Error("OpenAI API key is missing. Please check your environment variables.");
  }
  
  const prompt = createPrompt(tasks);
  
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
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
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    const result = data.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error("Received empty response from AI service");
    }
    
    return parseResponse(result);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to connect to AI service. Please check your internet connection and try again.");
  }
};

// API call to Anthropic
const callAnthropic = async (tasks: Task[]): Promise<PlannerResponse> => {
  const apiKey = await getApiKey();
  
  if (!apiKey) {
    throw new Error("Anthropic API key is missing. Please check your environment variables.");
  }
  
  const prompt = createPrompt(tasks);
  
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 800,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Anthropic API error:", errorData);
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    const result = data.content?.[0]?.text;
    
    if (!result) {
      throw new Error("Received empty response from AI service");
    }
    
    return parseResponse(result);
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to connect to AI service. Please check your internet connection and try again.");
  }
};

// Main function to generate schedule
export const generateSchedule = async (tasks: Task[]): Promise<PlannerResponse> => {
  if (!tasks.length) {
    throw new Error("No tasks provided. Please add at least one task.");
  }
  
  const apiProvider = getApiProvider();
  
  try {
    if (apiProvider === "anthropic") {
      return await callAnthropic(tasks);
    } else {
      return await callOpenAI(tasks);
    }
  } catch (error) {
    console.error("Schedule generation error:", error);
    throw error;
  }
};
