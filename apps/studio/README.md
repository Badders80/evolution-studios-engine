# Evolution Studios Engine - Frontend

Modern Next.js 14+ web application for the Evolution Studios content processing pipeline.

## Overview

The Evolution Studios Engine frontend provides a beautiful, intuitive interface for submitting miStable trainer reports and monitoring their AI-powered transformation into "Gold Standard" content.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Evolution Studios brand tokens
- **UI Components**: Custom component library
- **State Management**: React hooks + SWR
- **Authentication**: Supabase Auth
- **API Integration**: REST calls to Orchestrator microservice
- **Notifications**: Sonner toast library
- **Icons**: Lucide React

## Brand Design System

### Colors
- **Gold** (#d4a964) - Primary accent, interactive elements
- **Charcoal** (#1a1a1a) - Card backgrounds
- **Mint** (#4ade80) - Success states
- **Coral** (#f87171) - Error states
- **Slate** (#64748b) - Secondary text

### Typography
- **Primary**: Geist Sans
- **Monospace**: Geist Mono

## Features

### ✅ URL Submission Form
- miStable report URL input with validation
- Optional trainer logo URL
- Custom AI directive (system prompt)
- Real-time form validation
- Loading states with spinners
- Success/error toast notifications

### 🔄 Job Processing Pipeline
1. **Scraping** - Video/audio extraction
2. **Transcribing** - Whisper AI transcription
3. **Enriching** - Brand compliance (Layer 1)
4. **Refining** - LLM Brand Bible (Layer 2)
5. **Completed** - Gold Standard output

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm/pnpm/yarn
- Running Orchestrator service (port 8080)
- Supabase project configured

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your credentials
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Orchestrator API
NEXT_PUBLIC_ORCHESTRATOR_URL=http://localhost:8080
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to `/jobs/new`.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── jobs/
│   │   ├── new/          # Job submission page
│   │   └── [id]/         # Job detail page (TODO)
│   ├── dashboard/        # Dashboard (TODO)
│   ├── settings/         # Settings (TODO)
│   ├── layout.tsx        # Root layout with Toaster
│   ├── page.tsx          # Redirects to /jobs/new
│   └── globals.css       # Brand tokens & styles
├── components/
│   ├── Button.tsx        # Primary UI button
│   ├── Input.tsx         # Form input
│   ├── Textarea.tsx      # Form textarea
│   ├── StatusBadge.tsx   # Job status indicator
│   └── UrlSubmissionForm.tsx  # Main form component
├── lib/
│   ├── api/
│   │   └── orchestrator.ts    # Orchestrator API client
│   ├── supabase.ts            # Supabase client
│   └── types.ts               # TypeScript definitions
└── public/
```

## API Integration

### Orchestrator Client

```typescript
import { orchestratorClient } from '@/lib/api/orchestrator';

// Create new job
const response = await orchestratorClient.createJob(
  {
    source_url: 'https://mistable.com/...',
    trainer_logo_url: 'https://...',
    system_prompt: 'Custom instructions...'
  },
  userId
);

// Get job status
const job = await orchestratorClient.getJob(jobId);

// List user jobs
const jobs = await orchestratorClient.listJobs(userId);
```

### Supabase Auth

```typescript
import { getCurrentUser, getUserSession } from '@/lib/supabase';

// Get current user
const user = await getCurrentUser();

// Get session
const session = await getUserSession();
```

## Components

### UrlSubmissionForm

The primary interface for job creation. Features:
- URL validation
- Form state management
- Supabase authentication check
- Orchestrator API integration
- Toast notifications
- Automatic navigation to job detail

### StatusBadge

Displays job status with appropriate colors and animations:
- PENDING (Yellow)
- SCRAPING/TRANSCRIBING/ENRICHING/REFINING (Blue, animated)
- COMPLETED (Green)
- FAILED (Red)

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configure environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Roadmap

### Phase 1 (Current)
- ✅ URL Submission Form
- ✅ Brand design system
- ✅ Orchestrator integration
- ✅ Supabase auth

### Phase 2 (Next)
- [ ] Job detail page with status timeline
- [ ] Dashboard with job list
- [ ] Real-time status updates (polling/WebSocket)
- [ ] Media player for video/audio
- [ ] Transcript viewer (raw vs refined)

### Phase 3 (Future)
- [ ] Settings page
- [ ] Brand Bible management
- [ ] User profile
- [ ] Export functionality
- [ ] Analytics dashboard

## Contributing

This is a private Evolution Stables project. For questions or issues, contact the development team.

## License

Proprietary - Evolution Stables © 2024
