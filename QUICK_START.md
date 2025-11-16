# 🚀 Evolution Engine - Quick Start Guide

**Date:** November 14, 2024  
**Status:** ✅ Ready to Use

---

## 📦 Installation

```bash
# Install root dependencies (Turborepo)
npm install

# Install all app dependencies
cd apps/studio && npm install
cd ../owners && npm install
cd ../valuation && npm install
```

---

## 🏃 Running Apps

### Run Individual Apps

```bash
# Studio - Content Creation (port 3000)
npm run dev:studio

# Owners - Horse Registration (port 3001)
npm run dev:owners

# Valuation - ROI Calculator (port 3002)
npm run dev:valuation
```

### Run All Apps Simultaneously

```bash
# Runs all three apps in parallel with Turborepo
npm run dev
```

---

## 🔨 Building Apps

```bash
# Build all apps
npm run build

# Build individual apps
npm run build:studio
npm run build:owners
npm run build:valuation
```

---

## 🌐 Access URLs

| Module | Port | URL (Development) | URL (Production) |
|--------|------|-------------------|------------------|
| **Studio** | 3000 | http://localhost:3000 | studio.evolutionstables.nz |
| **Owners** | 3001 | http://localhost:3001 | owners.evolutionstables.nz |
| **Valuation** | 3002 | http://localhost:3002 | valuation.evolutionstables.nz |

---

## 📁 Project Structure

```
evolution-engine/
├── apps/
│   ├── studio/          # ✅ Production ready
│   ├── owners/          # 🚧 Placeholder UI
│   └── valuation/       # 🚧 Placeholder UI
├── services/
│   ├── orchestrator/    # AI processing
│   └── scraper/         # Media extraction
├── database/            # Supabase migrations
└── turbo.json          # Monorepo config
```

---

## 🎯 Module Status

### Studio (Production Ready)
- ✅ Full content creation pipeline
- ✅ AI-assisted editing
- ✅ Supabase integration
- ✅ File upload & processing
- ✅ Job dashboard

### Owners (Placeholder)
- ✅ UI scaffold complete
- 🚧 Registration flows (to build)
- 🚧 KYC/AML integration (to build)
- 🚧 Document generation (to build)

### Valuation (Placeholder)
- ✅ UI scaffold complete
- 🚧 ROI calculator (to build)
- 🚧 Scenario modeling (to build)
- 🚧 Financial reports (to build)

---

## 🛠️ Common Commands

```bash
# Lint all apps
npm run lint

# Clean all build artifacts
rm -rf apps/*/. next apps/*/.turbo

# Install new dependency in specific app
cd apps/studio && npm install <package>

# Update Evolution UI components
cd ../evolution-ui && npm run build
```

---

## 🔗 Related Documentation

- **Architecture:** `EVOLUTION_ENGINE_ARCHITECTURE.md`
- **Evolution UI:** `/home/evo/evolution-ui/README.md`
- **Studio Docs:** `apps/studio/README.md`

---

## 💡 Tips

1. **Hot Reload:** All apps support hot module replacement
2. **Shared Components:** Always import from `@evolution/ui`
3. **Brand Colors:** Use tokens from `@evolution/brand`
4. **Ports:** Each app runs on a different port to avoid conflicts

---

**Ready to build the future of horse ownership!** 🏇✨
