# CLAUDE.md - evolution-studios-engine

## What this repo is and what it solves
evolution-studios-engine is a monorepo containing the full stack platform for Evolution Stables. It solves the problem of managing the entire content pipeline from job submission to video generation by providing a unified dashboard and backend services.

## Full Stack
### What IS used:
- **Next.js 14** with App Router for frontend
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for database and storage
- **FastAPI** for backend services
- **Docker** for containerization
- **PostgreSQL** for database (Supabase)

### What IS NOT used:
- **Create React App**: Not used (Next.js 14 with App Router preferred)
- **Styled Components**: Not used (Tailwind CSS preferred)
- **Firebase**: Not used (Supabase preferred)

## Hard Coding Rules

1. **No empty placeholder files** - Implement or don't create the file
2. **TypeScript first** - All new code must be TypeScript
3. **Monorepo structure must be maintained** - Keep apps and services separate
4. **Performance optimized** - Use Next.js 14 features (Streaming, Partial Prerendering)
5. **Security must be enforced** - Sanitize all user inputs

## Project Structure
```
evolution-studios-engine/
├── apps/                  # Frontend applications
│   ├── owners/           # Owner dashboard
│   ├── studio/           # Content studio
│   └── valuation/        # Valuation calculator
├── services/             # Backend services
│   ├── enrich-svc/       # Content enrichment
│   ├── orchestrator/     # Job orchestration
│   ├── refiner/          # Content refinement
│   ├── scraper/          # Web scraping
│   └── transcriber/      # Audio transcription
├── database/             # Database migrations
│   └── migrations/       # SQL migrations
├── docker-compose.yml    # Docker configuration
├── package.json          # Dependencies (Turbo monorepo)
└── turbo.json            # Turbo configuration
```

## Key Features
1. **Job Dashboard**: Manages content generation jobs
2. **Transcript Viewer**: Views and edits audio transcripts
3. **URL Submission**: Submits URLs for content generation
4. **Valuation Calculator**: Calculates horse valuations
5. **API Integration**: Integrates with backend services

## Environment Variables
Required environment variables in `.env`:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## WSL2 Paths
- **Project Path**: `/home/evo/projects/evolution-studios-engine/`
- **Windows Path**: `C:\Users\Evo\projects\evolution-studios-engine\`
- **Dev Server Port**: 3000 (default)

## Current Phase and Next Build Target
- **Current Phase**: Integration Complete
- **Next Build Target**: Migrate to production environment

## Commands
- **Dev Server**: `npm run dev` (runs all apps on port 3000)
- **Build**: `npm run build`
- **Start**: `npm run start`
- **Lint**: `npm run lint`
- **Type Check**: `npm run type-check`

## Source of Truth
**All development standards are defined in 00_DNA**:
- **Build Philosophy**: `/home/evo/00_DNA/build-philosophy/Master_Config_2026.md`
- **System Prompts**: `/home/evo/00_DNA/system-prompts/PROMPT_LIBRARY.md`
- **Brand Voice**: `/home/evo/00_DNA/brand-identity/BRAND_VOICE.md`
- **Workflows**: `/home/evo/00_DNA/workflows/`

**Key Files to Reference**:
1. `/home/evo/00_DNA/AGENTS.core.md` - Universal agent rules
2. `/home/evo/00_DNA/build-philosophy/Master_Config_2026.md` - Hardware and architecture specs
3. `/home/evo/00_DNA/brand-identity/MESSAGING_CHEAT_SHEET.md` - Brand voice guidelines
