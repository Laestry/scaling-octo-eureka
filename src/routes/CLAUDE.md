# CLAUDE.md - src/routes/

This file provides guidance to Claude Code when working with the SvelteKit routes in this directory.

## Directory Overview

This directory contains all SvelteKit routes, layouts, and page components for the Ward & Associés wine e-commerce application.

## SvelteKit Route Structure

### Root Layout and Pages
- **`+layout.svelte`** - Main app layout with Header/Footer, page transitions with fly animations
- **`+layout.server.ts`** - Root server load function (currently commented out cart logic)
- **`+page.svelte`** - Homepage with featured wine products in responsive grid layout
- **`+page.server.ts`** - Loads 20 alcohol products from PocketBase for homepage

### Global Components
- **`Header.svelte`** - Dynamic navigation with backdrop images, cart counter, scroll-to-top button
- **`Footer.svelte`** - Newsletter signup form, contact information, social media links

## Page Routes

### Product Catalog
**`products/`** - Complete product browsing and filtering system
- `+page.svelte` - Product grid with filters sidebar
- `+page.server.ts` - Complex URL parameter parsing for filters (producer, region, price, etc.)
- `+layout.svelte` - Products section layout
- Various product display components (ProductCard, ProductGrid, ProductList, etc.)

### Individual Product Details
**`product/[slug]/`** - Dynamic product detail pages
- `+page.svelte` - Product detail view with image carousel, purchase controls, related products
- `+page.server.ts` - Loads product by slug, fetches related products by producer/region
- `ProductTags.svelte` - Product categorization display
- `utils.ts` - Product-specific utility functions

### Shopping Cart
**`cart/`** - Checkout and order processing
- `+page.svelte` - Multi-step checkout with form validation, SAQ branch selection
- `+layout.svelte` - Cart-specific layout
- `CartItem.svelte` - Individual cart item display component

### Static Content Pages
- **`associes/+page.svelte`** - About the associates/team page
- **`vision/+page.svelte`** - Company vision and mission page

### Administrative Interface
**`admin/`** - Backend administration tools
- `+page.svelte` - Product/client syncing from Portaus API, PDF generation
- `+page.server.ts` - Admin authentication and token management

### Development/Testing
- **`components/+page.svelte`** - Component showcase/testing page
- **`pdftest/+page.svelte`** - PDF generation testing interface

## API Routes

**`api/`** - Server-side API endpoints for external integrations
- Product syncing from Portaus API
- Customer management operations
- Order processing endpoints
- SAQ branch data retrieval
- PDF generation services

## SvelteKit Patterns Used

### File Naming Conventions
- `+page.svelte` - Route page component
- `+page.server.ts` - Server-side load function
- `+layout.svelte` - Layout component for route group
- `+server.ts` - API endpoint handler
- `[slug]` - Dynamic route parameter

### Data Loading
- Server load functions fetch data from PocketBase
- Complex URL parameter parsing for filtering
- Related product loading using PocketBase queries

### Form Handling
- Custom form validation using Input/Select components
- Multi-step checkout process with state management
- Email validation and account checking

### Navigation and Transitions
- Programmatic navigation with `goto()`
- Page transitions using Svelte's fly animations
- Dynamic backdrop images based on current route

## Development Notes

- Routes follow SvelteKit file-based routing conventions
- Server functions handle data fetching from multiple sources (PocketBase, Portaus API)
- Components are modular and reusable across different routes
- Form validation uses custom validation schema with real-time feedback
- Shopping cart state persists across page navigation using stores