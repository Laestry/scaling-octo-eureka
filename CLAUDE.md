# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- **Start dev server**: `npm run dev` (runs on port 3173, with Node.js debugging and 16GB memory allocation)
- **Build for production**: `npm run build`
- **Package manager**: Uses `pnpm` (check `pnpm-lock.yaml`)

### Code Quality
- **Linting**: `npx eslint .` (ESLint with TypeScript and Svelte support)
- **Type checking**: `npx svelte-check --tsconfig ./tsconfig.json`
- **Formatting**: `npx prettier --write .` (4-space tabs, 120 character width)


## Architecture Overview

### Framework Stack
- **Frontend**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS with custom color palette (wred, wblue, wpink, wblack, wwhite variants)
- **Database**: Supabase for primary data storage with `cms_saq` schema
- **Additional Services**: PocketBase (secondary), Stripe for payments, Portaus API for wine inventory, jsPDF for PDF generation

### Key Architecture Patterns

#### Data Layer
- **Supabase**: Primary database with SSR support via `src/lib/supabase/client.ts` using `cms_saq` schema
- **PocketBase**: Secondary storage client in `src/lib/pocketbase.ts`
- **API Integration**: Custom Portaus API client in `src/lib/server/portausApi.ts` with JWT authentication
- **Models**: Type definitions in `src/lib/models/general.ts`

#### State Management
- **Cart System**: Global cart store in `src/lib/cart.ts` with localStorage persistence
- **UI State**: Simple Svelte stores in `src/lib/store.ts` for view toggles (grid/list, pricing display)

#### Route Structure
- **Product Catalog**: `/vins` with advanced filtering and search
- **Product Details**: `/vin/[slug]` with batch-based inventory
- **Shopping Cart**: `/cart` with quantity management per batch
- **Admin Panel**: `/admin` for management functions

#### Component Architecture
- **Layout**: Custom page transitions with fly animations in `+layout.svelte`
- **Reusable Components**: Located in `src/lib/components/` (form controls, UI elements)
- **Icons**: Custom icon system using unplugin-icons with local SVG collection

### Data Models
- **Products**: Wine products with batch-based inventory tracking
- **Cart Items**: Include `selectedBatchId` for batch-specific quantity management
- **Batch System**: Each product has multiple batches with individual quantities and pricing

### API Routes
- **Payment Processing**: Stripe integration in `/api/stripe/create-checkout`
- **Order Management**: Portaus API integration in `/api/submit-order`
- **Client Management**: Contact verification and creation endpoints
- **PDF Generation**: Wine list export using jsPDF in `/api/generate-pdf`

### Styling Conventions
- **Custom Colors**: Ward & Associés brand colors defined in Tailwind config
- **Typography**: Inter font family with custom Riposte font assets
- **Responsive**: Mobile-first with `md` (767px) and `lg` (1162px) breakpoints

### Environment Configuration
- **Public Variables**: Supabase URL and public API keys
- **Private Variables**: Portaus API credentials, JWT secrets, Stripe keys, Supabase service role key
- **Development**: Node.js debugging enabled with increased memory allocation
- **Environment File**: Uses `.env` with dotenvx for environment variable management