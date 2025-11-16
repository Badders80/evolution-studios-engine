# Shared Environments: evolution-3.0 ↔ Evolution Studios

## Overview

Strategy for keeping builds modular and separate while replicating key environments from evolution-3.0.

---

## Current Alignment

### ✅ Already Matching
| Feature | evolution-3.0 | Evolution Studios | Status |
|---------|---------------|-------------------|--------|
| Framework | Next.js 14 | Next.js 16 | ✅ Compatible |
| Router | App Router | App Router | ✅ Identical |
| Language | TypeScript | TypeScript | ✅ Identical |
| Styling | Tailwind CSS | Tailwind CSS | ✅ Identical |
| Animation | Framer Motion | (not yet) | 🔄 Can add |
| Components | Modular | Modular | ✅ Similar |

---

## Environments to Replicate

### 1. Storybook Development Environment

**From evolution-3.0:**
- Storybook on port 6006
- Component stories for Button, Card, Badge
- Interactive component testing
- "Login (Stories)" quick access button

**For Evolution Studios:**
```bash
# Install Storybook
npm install --save-dev @storybook/nextjs

# Initialize
npx storybook@latest init

# Run
npm run storybook  # Port 6006
```

**Benefits:**
- Test components in isolation
- Visual regression testing
- Component documentation
- Shared component library development

---

### 2. Component Structure

**Replicate evolution-3.0 organization:**

```
frontend/components/
├── ui/                    # Basic UI components
│   ├── Button.tsx        ✅ Already exists
│   ├── Input.tsx         ✅ Already exists
│   ├── Textarea.tsx      ✅ Already exists
│   ├── Card.tsx          🔄 Add
│   ├── Badge.tsx         🔄 Add (StatusBadge exists)
│   └── Toast.tsx         🔄 Add
├── layout/               🔄 Create
│   ├── NavBar.tsx        
│   ├── Footer.tsx        
│   └── Container.tsx     
├── site/                 🔄 Create (Studio-specific)
│   ├── JobCard.tsx       
│   ├── StatusTimeline.tsx
│   └── TranscriptViewer.tsx
└── icons/                🔄 Create
    └── EvolutionLogo.tsx 
```

---

### 3. Shared Design System Package

**Future: @evolution/ui-kit**

Extract shared components into a private npm package:

```
@evolution/ui-kit/
├── components/
│   ├── Button.tsx       # Shared between both projects
│   ├── Card.tsx         
│   └── Badge.tsx        
├── styles/
│   └── tokens.ts        # Brand colors, typography
└── package.json
```

**Installation in both projects:**
```bash
# evolution-3.0
npm install @evolution/ui-kit

# evolution-studios-engine/frontend
npm install @evolution/ui-kit
```

---

### 4. Brand Tokens Configuration

**Create shared `brand-tokens.ts`:**

```typescript
// Shared between evolution-3.0 and Evolution Studios
export const brandTokens = {
  colors: {
    gold: '#d4a964',
    charcoal: '#1a1a1a',
    charcoalLight: '#2a2a2a',
    mint: '#4ade80',
    coral: '#f87171',
    slate: '#64748b',
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
  },
  spacing: {
    // Shared spacing scale
  },
  borderRadius: {
    // Shared radius values
  },
};
```

**Use in both Tailwind configs:**
```javascript
// tailwind.config.js (both projects)
import { brandTokens } from '@evolution/brand-tokens';

export default {
  theme: {
    extend: {
      colors: brandTokens.colors,
      fontFamily: brandTokens.typography.fontFamily,
    },
  },
};
```

---

### 5. Development Workflow

**Match evolution-3.0 dual-terminal workflow:**

```bash
# Terminal 1: Main app
cd frontend
npm run dev              # Port 3000

# Terminal 2: Storybook
npm run storybook        # Port 6006

# Terminal 3: Backend services (Evolution Studios only)
cd ..
docker compose up        # Orchestrator, Transcriber, etc.
```

---

## Implementation Phases

### Phase 1: Immediate (This Week)
- ✅ Component structure reorganization
- 🔄 Add Storybook to Evolution Studios
- 🔄 Create shared brand tokens file
- 🔄 Add Framer Motion for animations

### Phase 2: Short-term (Next Sprint)
- Extract common components to `components/ui/`
- Create `components/layout/` for NavBar, Footer
- Build `components/site/` for Studio-specific features
- Add component stories for all UI components

### Phase 3: Long-term (Future)
- Create `@evolution/ui-kit` package
- Publish to private npm registry (GitHub Packages)
- Install in both evolution-3.0 and Evolution Studios
- Single source of truth for brand components

---

## Keeping Builds Modular

### Separation Strategy

| Concern | evolution-3.0 | Evolution Studios |
|---------|---------------|-------------------|
| **Purpose** | Public marketing site | Internal dev tool |
| **Domain** | evolutionstables.nz | studio.evolutionstables.nz |
| **Deployment** | Vercel (public) | Vercel (private/auth) |
| **Backend** | Sanity CMS | Orchestrator API + Supabase |
| **Shared** | UI components, brand tokens | UI components, brand tokens |

### What Stays Separate
- ❌ API integrations (Sanity vs Orchestrator)
- ❌ Page routes (marketing vs studio tools)
- ❌ Authentication (public vs Supabase)
- ❌ Business logic (content vs job processing)

### What Gets Shared
- ✅ UI components (Button, Card, Input)
- ✅ Brand tokens (colors, typography)
- ✅ Layout components (NavBar, Footer)
- ✅ Utility functions (formatters, validators)
- ✅ TypeScript types (where applicable)

---

## Recommended Next Steps

### Option A: Quick Win (Storybook Only)
1. Add Storybook to Evolution Studios
2. Create stories for existing components
3. Match evolution-3.0 development workflow

### Option B: Full Alignment (Component Restructure)
1. Reorganize components to match evolution-3.0 structure
2. Add Storybook
3. Extract brand tokens to shared file
4. Add Framer Motion

### Option C: Future-Proof (Shared Package)
1. Do Option B
2. Create `@evolution/ui-kit` package
3. Migrate both projects to use it
4. Single source of truth for brand

---

## Questions to Resolve

1. **Storybook Priority?** Should we add it now or later?
2. **Component Restructure?** Reorganize to match evolution-3.0 structure?
3. **Shared Package Timeline?** When to extract to `@evolution/ui-kit`?
4. **Framer Motion?** Add animations to Evolution Studios?
5. **NavBar/Footer?** Should Studio have same layout as main site?

---

## Summary

**We can replicate:**
- ✅ Storybook development environment
- ✅ Component structure and organization
- ✅ Brand design tokens
- ✅ Development workflow (dual terminals)
- ✅ TypeScript + Tailwind + Next.js stack

**While keeping modular:**
- Separate deployments (different domains)
- Separate backends (Sanity vs Orchestrator)
- Separate purposes (marketing vs dev tool)
- Shared UI components via package (future)

**Recommendation:** Start with **Option A** (Storybook) for immediate value, then move to **Option B** (restructure) when ready for Phase 2 features.
