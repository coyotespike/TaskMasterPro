import type { NextApiRequest, NextApiResponse } from 'next';

type ConfigResponse = {
  openaiApiKey: string;
  apiProvider: string;
  useMockResponses: boolean;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigResponse>
) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key is missing in environment variables');
  }
  
  res.json({
    // Don't expose the full API key to the client, just indicate if it exists
    openaiApiKey: apiKey ? "configured" : "",
    apiProvider: process.env.API_PROVIDER || "openai",
    useMockResponses: process.env.USE_MOCK_RESPONSES === "true"
  });
}