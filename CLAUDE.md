# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with debug options and memory allocation
- `npm run build` - Build the application for production with debug options

### Database Management
- `npx prisma migrate dev --name examplenameREPLACETHIS --schema=./src/lib/server/prisma/schema.prisma` - Create and apply database migrations

## Architecture Overview

This is a **SvelteKit** application with a multi-service backend architecture:

### Core Technologies
- **SvelteKit** with TypeScript
- **Tailwind CSS** for styling
- **PocketBase** for user management and some data storage
- **Portaus API** for payment processing and business logic
- **Supabase** for additional data services
- **Prisma** for database schema management

### Key Architecture Patterns

**Multi-Database Setup**: The application uses multiple data sources:
- PocketBase for user authentication and some collections
- Supabase for additional data storage
- External Portaus API for payment and business operations

**Server-Side Integration**: 
- `hooks.server.ts` handles PocketBase authentication with token refresh logic
- API routes in `/src/routes/api/` integrate with Portaus services
- JWT-based authentication for Portaus API calls

**Component Structure**:
- Reusable UI components in `/src/lib/components/`
- Custom icons system using unplugin-icons with local SVG files
- Product-focused e-commerce components in `/src/routes/products/`

### Important Implementation Details

**Authentication Flow**: 
- PocketBase handles user sessions with automatic token refresh (30-minute threshold)
- JWT tokens are used for Portaus API authentication
- Authentication state is managed through SvelteKit's event.locals

**Product Management**:
- Products are managed through both PocketBase collections and Portaus API
- Batch operations available for product and customer data syncing
- Shopping cart functionality with cookie-based persistence

**Payment Processing**:
- Portaus API integration for payment intents
- SAQ branches integration for location services
- PDF generation for order management

### Development Environment Setup

The application runs on port 3173 by default and includes:
- Debug tracing enabled with memory allocation settings
- Icon system with local SVG files in `/src/lib/icons/`
- Vite configuration with SvelteKit and custom icon loading

### Key Files to Understand
- `/src/hooks.server.ts` - Authentication and request handling
- `/src/lib/server/portausApi.ts` - External API integration patterns
- `/src/lib/server/pocketbase.ts` - Database batch operations
- `/src/routes/+layout.server.ts` - Server-side data loading patterns