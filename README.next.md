# AI-Powered Task Planner

A modern web application that utilizes AI to generate optimized daily schedules based on your tasks. The app creates personalized daily plans with times allocated for each task and visual representations to enhance the user experience.

## Features

- **Task Management**: Add and remove tasks easily
- **AI-Powered Scheduling**: Get intelligently organized schedules based on your tasks
- **Visual Task Representations**: Each task comes with a custom generated image
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Intelligent Explanations**: Understand why the AI arranged your tasks in a specific order

## Technologies Used

- **Next.js**: React framework for production-grade applications
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For styling and responsive design
- **OpenAI API**: For generating schedules and task images
- **React Query**: For data fetching and state management

## Local Development

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-task-planner.git
cd ai-task-planner
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following content:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploying to Vercel

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI:
```bash
npm install -g vercel
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel:
   - Go to your project settings in the Vercel dashboard
   - Add the `OPENAI_API_KEY` environment variable with your OpenAI API key

### Other Deployment Options

For deployment on other platforms, build the application first:
```bash
npm run build
# or
yarn build
```

Then start the production server:
```bash
npm run start
# or
yarn start
```

## Project Structure

```
├── pages/               # Next.js pages
│   ├── api/             # API endpoints
│   │   ├── generate-image.ts
│   │   ├── generate-schedule.ts
│   │   └── config.ts
│   ├── _app.tsx         # App component
│   ├── _document.tsx    # Custom document
│   └── index.tsx        # Home page
├── public/              # Static assets
├── components/          # React components
├── hooks/               # Custom React hooks
├── services/            # API services
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

## License

MIT

## Acknowledgements

- [OpenAI](https://openai.com/) for providing the API services
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling system