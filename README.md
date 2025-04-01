# Task Planner AI

An AI-powered task planning application that generates optimized daily schedules with intelligent insights and user-friendly design.

## Features

- Intelligent schedule generation with OpenAI
- Beautiful task visualizations with DALL-E
- Modern, responsive UI with React and Tailwind CSS
- Intuitive task management interface

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and add your OpenAI API key
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## Deployment to Vercel

This application is configured for easy deployment to Vercel:

1. Push your code to GitHub
2. In Vercel, import your GitHub repository
3. Set the required environment variables:
   - `OPENAI_API_KEY` - Your OpenAI API key with access to GPT-4 and DALL-E
4. Deploy!

## Environment Variables

- `OPENAI_API_KEY` (required): Your OpenAI API key
- `USE_MOCK_RESPONSES` (optional): Set to "true" to use mock data for schedule generation
- `USE_MOCK_IMAGES` (optional): Set to "true" to use mock data for image generation

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Express.js
- AI: OpenAI GPT-4 and DALL-E 3
- Packaging: Vite