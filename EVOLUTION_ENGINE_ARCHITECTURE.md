# 🏗️ Evolution Engine - Modular Platform Architecture

**Date:** November 14, 2024  
**Status:** ✅ Structure Complete - Ready for Development

---

## 🎯 Overview

**Evolution Engine** is the core infrastructure powering Evolution Stables — connecting owners, investors, and industry partners through three integrated modules.

### The Platform Layer

Evolution Engine acts as the umbrella platform for all Evolution Stables operations, designed as a modular system where new tools can be added as the product scales.

---

## 🧩 Three Core Modules

### 1. **Studio** (Content Creation Hub)
**Port:** 3000  
**URL:** studio.evolutionstables.nz  
**Purpose:** AI-assisted content creation and publishing

**Core Functions:**
- Upload media from trainers and owners
- AI-assisted editing (Evolution Studios Engine)
- Investor-ready media output (reports, updates, previews)
- Integration with Orchestrator API and Supabase

**Status:** ✅ Fully operational (migrated from `/frontend`)

---

### 2. **Owners** (Registration & Management Hub)
**Port:** 3001  
**URL:** owners.evolutionstables.nz (planned)  
**Purpose:** Horse registration and ownership management

**Core Functions:**
- Horse registration (NZTR / FMA-compliant)
- Ownership and syndicate management
- KYC / AML verification integration (Tokinvest layer)
- Documentation generation (PDS, agreements, disclosures)

**Status:** 🚧 Placeholder UI created - Ready for development

---

### 3. **Valuation** (Financial Modeling Hub)
**Port:** 3002  
**URL:** valuation.evolutionstables.nz (planned)  
**Purpose:** Dynamic financial and performance modeling

**Core Functions:**
- Lease / syndicate pricing calculator
- ROI, fee, and distribution projections
- Scenario visualization (short-term vs. full-lease)
- Token flow and yield simulator (integration-ready for Tokinvest)

**Status:** 🚧 Placeholder UI created - Ready for development

---

## 📁 Project Structure

```
evolution-engine/
├── apps/
│   ├── studio/          # Content creation (Next.js 15.1.0)
│   ├── owners/          # Horse registration (Next.js 15.1.0)
│   └── valuation/       # ROI calculator (Next.js 15.1.0)
├── services/
│   ├── orchestrator/    # AI content processing
│   ├── scraper/         # Media extraction
│   └── ...
├── database/            # Supabase migrations
├── turbo.json          # Monorepo configuration
└── package.json        # Root workspace config
```

---

## 🚀 Getting Started

### Install Dependencies

```bash
# Root level - installs Turborepo
npm install

# Install all app dependencies
cd apps/studio && npm install
cd ../owners && npm install
cd ../valuation && npm install
```

### Run Individual Apps

```bash
# Studio (port 3000)
npm run dev:studio

# Owners (port 3001)
npm run dev:owners

# Valuation (port 3002)
npm run dev:valuation
```

### Run All Apps

```bash
# Run all three apps in parallel
npm run dev
```

### Build Apps

```bash
# Build all apps
npm run build

# Build individual apps
npm run build:studio
npm run build:owners
npm run build:valuation
```

---

## 🎨 Shared Design System

All three apps use the **Evolution UI monorepo** for consistent branding:

### Packages
- **@evolution/brand** - Design tokens (colors, typography, spacing)
- **@evolution/ui** - 10 React components (Button, Card, NavBar, Logo, etc.)

### Brand Colors
- **Gold:** `#d4a964` - Premium accent
- **Charcoal:** `#1a1a1a` - Background
- **Mint:** `#4ade80` - Success states
- **Coral:** `#f87171` - Error states

---

## 🔗 Integration Points

### Shared Services
- **Supabase** - Authentication, database, storage
- **Orchestrator API** - AI content processing (Studio)
- **Scraper Service** - Media extraction (Studio)

### Future Integrations
- **Tokinvest** - Tokenization and compliance (Owners + Valuation)
- **NZTR API** - Horse registration data (Owners)
- **FMA Compliance** - KYC/AML verification (Owners)

---

## 📊 Module Status

| Module | Status | Features | Next Steps |
|--------|--------|----------|------------|
| **Studio** | ✅ Production | Full content pipeline | Enhance AI features |
| **Owners** | 🚧 Placeholder | UI scaffold only | Build registration flows |
| **Valuation** | 🚧 Placeholder | UI scaffold only | Build ROI calculator |

---

## 🎯 Strategic Messaging

**Evolution Engine:**  
*"The backbone of digital syndication — combining media, management, and modeling under one regulated ecosystem."*

### For Presentations
"The core infrastructure powering Evolution Stables — connecting owners, investors, and industry partners through three integrated modules: **Studio**, **Owners**, and **Valuation**."

---

## 🔮 Future Modules

The modular architecture allows for easy expansion:

- **Dashboard** - Unified owner/investor portal
- **Admin** - Platform management and analytics
- **API Docs** - Developer documentation
- **Mobile** - Native mobile applications

---

## 🛠️ Technical Stack

### Frontend (All Apps)
- **Framework:** Next.js 15.1.0
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Library:** @evolution/ui
- **Icons:** Lucide React
- **Animations:** Framer Motion

### Backend Services
- **Orchestrator:** Python + FastAPI
- **Scraper:** Python + yt-dlp
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage

### Infrastructure
- **Monorepo:** Turborepo
- **Package Manager:** npm workspaces
- **Deployment:** Netlify (frontend), Docker (services)

---

## 📝 Development Guidelines

### Adding a New Module

1. Create new app directory: `apps/new-module/`
2. Copy structure from `owners` or `valuation`
3. Update `package.json` with unique port
4. Add scripts to root `package.json`
5. Install dependencies and test

### Shared Components

Always use components from `@evolution/ui`:
```tsx
import { Button, Card, NavBar } from '@evolution/ui';
import { colors } from '@evolution/brand';
```

### Naming Conventions

- **Apps:** Lowercase (studio, owners, valuation)
- **Components:** PascalCase (NavBar, StudiosLogo)
- **Files:** kebab-case (roi-calculator.tsx)

---

## 🎊 Summary

**Evolution Engine is now a modular platform!**

### What We Built
✅ **Monorepo Structure** - Turborepo with 3 apps  
✅ **Studio Module** - Fully operational content creation  
✅ **Owners Module** - Placeholder UI ready for development  
✅ **Valuation Module** - Placeholder UI ready for development  
✅ **Shared Design System** - Consistent branding across all apps

### What This Enables
🎨 **Consistent Branding** - Single source of truth for design  
🚀 **Independent Deployment** - Each module can deploy separately  
📱 **Scalable Architecture** - Easy to add new modules  
🎯 **Clear Boundaries** - Each module has a specific purpose

---

**Last Updated:** November 14, 2024  
**Version:** 1.0.0  
**Status:** ✅ Ready for Development
