# CLAUDE.md - src/lib/

This file provides guidance to Claude Code when working with the library code in this directory.

## Directory Overview

This directory contains shared utilities, components, and business logic for the Ward & Associés wine e-commerce application.

## Key Files and Modules

### State Management
- **`cart.ts`** - Shopping cart store with localStorage persistence, quantity management
- **`store.ts`** - Global application state (pricing modes, UI states)
- **`pocketbase.ts`** - PocketBase client instance for frontend database operations

### External API Integration
- **`shopify.ts`** - Shopify integration utilities (if used)

### Data Models
- **`models/`** - TypeScript interfaces and types
  - `pocketbase.ts` - PocketBase collection schemas (AlcoholProduct, etc.)
  - `general.ts` - General application types and filters
  - `shopifyTypes.ts` - Shopify-related type definitions

### Utility Functions
- **`utils.ts`** - General utility functions
- **`utils/teleport.js`** - DOM manipulation utilities
- **`index.ts`** - Main exports from the lib directory

## Subdirectories

### `components/`
Reusable Svelte components used throughout the application:
- Form components (Input, Select, Toggle)
- UI components (Accordion, Carousel, Logo)
- Interactive elements (FavoriteButton, ImageLoader)

### `icons/`
SVG icon collection with Svelte wrappers:
- Both `.svelte` components and raw `.svg` files
- Exported through `index.ts` for easy importing
- Used with unplugin-icons system

### `server/`
Server-side utilities and API integrations:
- PocketBase operations and batch processing
- Portaus API client and data transformation
- Supabase integration

### `listToPdf/`
PDF generation functionality:
- Product catalog PDF generation
- Example data for testing
- Svelte components for PDF layouts

### `portausObjects/`
Reference data and examples for Portaus API:
- JSON examples of client and order structures
- cURL command examples for API testing

## Development Patterns

### Component Usage
```typescript
import { ComponentName } from '$lib/components/ComponentName.svelte';
```

### Icon Usage
```typescript
import { IconName } from '$lib/icons';
// Icons are automatically loaded through unplugin-icons
```

### Store Usage
```typescript
import { cart } from '$lib/cart';
import { isPrixResto } from '$lib/store';
```

### API Integration
```typescript
import { pb } from '$lib/pocketbase';
// For server-side operations, use src/lib/server/ modules
```

## Architecture Notes

- Components are designed to be reusable across different routes
- Server utilities handle multi-database integration (PocketBase, Portaus, Supabase)
- Shopping cart uses reactive Svelte stores with localStorage sync
- PDF generation works by rendering hidden Svelte components and converting to PDF
- Icon system supports both local SVG files and Svelte components