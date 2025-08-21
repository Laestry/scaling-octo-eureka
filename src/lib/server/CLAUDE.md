# CLAUDE.md - src/lib/server/

This file provides guidance to Claude Code when working with server-side utilities and API integrations in this directory.

## Directory Overview

This directory contains server-side utilities for integrating with multiple backend services: PocketBase, Portaus API, and Supabase.

## Core Server Modules

### PocketBase Integration
**`pocketbase.ts`**
- Batch operations for bulk data synchronization
- `upsertAlcoholProductBatch()` - Bulk product upserts from external APIs
- `upsertCustomerBatch()` - Bulk customer data synchronization
- Uses PocketBase batch API for efficient operations

### Portaus API Integration
**`portausApi.ts`**
- JWT-based authentication wrapper for Portaus API
- `createPaymentIntent()` - Payment processing integration
- `getSaqBranches()` - SAQ branch location retrieval
- Handles API key wrapping with JWT tokens

**`portaus.ts`**
- Extended Portaus API functionality
- Additional business logic for order processing
- Customer and product data transformation

**`portausModels.ts`**
- TypeScript interfaces for Portaus API responses
- Data models for customers, orders, products
- Type safety for external API integration

### Supabase Integration
**`supabase/index.ts`**
- Supabase client configuration and utilities
- Additional data storage and retrieval operations
- Backup/alternative database operations

## Integration Patterns

### Multi-Database Architecture
The server handles a complex multi-database setup:
1. **PocketBase** - Primary database for users, products, orders
2. **Portaus API** - External business logic and payment processing
3. **Supabase** - Additional data storage and analytics

### Authentication Flow
```typescript
// JWT token generation for Portaus API
function generateApiKeyJWT(): string {
    const payload = { API_KEY: PORTAUS_API_KEY.trim() };
    return jwt.sign(payload, PORTAUS_JWT_SECRET);
}
```

### Data Synchronization
```typescript
// Batch operations for efficient data sync
const batch = pbAdmin.createBatch();
for (const item of items) {
    batch.collection('collection_name').upsert(item);
}
await batch.send();
```

## Environment Variables

### Required Environment Variables
- `PORTAUS_BASE` - Base URL for Portaus API
- `PORTAUS_API_KEY` - API key for Portaus authentication
- `PORTAUS_JWT_SECRET` - Secret for JWT token signing
- `POCKETBASE_ADMIN_USER` - PocketBase admin username
- `POCKETBASE_ADMIN_PASSWORD` - PocketBase admin password
- `PUBLIC_DB_URL` - PocketBase database URL

## API Integration Workflows

### Product Synchronization
1. Fetch products from Portaus API with pagination
2. Transform product data to PocketBase schema
3. Batch upsert products to PocketBase collection
4. Handle errors and continue processing

### Customer Management
1. Retrieve customer data from Portaus API
2. Process and validate customer information
3. Sync to PocketBase users/customers collections
4. Maintain data consistency across systems

### Order Processing
1. Create payment intents through Portaus API
2. Store order data in PocketBase
3. Handle SAQ branch assignment
4. Process payment confirmations

## Error Handling

### API Error Management
- Comprehensive error logging for debugging
- Graceful degradation when external APIs fail
- Retry logic for transient failures
- Error responses with appropriate HTTP status codes

### Data Validation
- Input validation before external API calls
- Response validation from external services
- Type checking with TypeScript interfaces
- Schema validation for data integrity

## Development Guidelines

### Security Considerations
- API keys stored securely in environment variables
- JWT tokens for secure API communication
- Admin authentication for sensitive operations
- Input sanitization for all external data

### Performance Optimization
- Batch operations for bulk data processing
- Pagination handling for large datasets
- Connection pooling where applicable
- Caching strategies for frequently accessed data

### Testing Approaches
- Mock external API responses for unit tests
- Integration tests with test databases
- Environment-specific configurations
- Error scenario testing