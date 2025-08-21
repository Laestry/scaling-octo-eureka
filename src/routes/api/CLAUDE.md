# CLAUDE.md - src/routes/api/

This file provides guidance to Claude Code when working with SvelteKit API endpoints in this directory.

## Directory Overview

This directory contains SvelteKit API routes (`+server.ts` files) that handle server-side operations, external API integrations, and business logic.

## API Endpoint Structure

### External API Integration Endpoints

**`getProductsFromPortaus/+server.ts`**
- **Purpose**: Fetches products from Portaus API and syncs to PocketBase
- **Method**: POST
- **Input**: `{ tokens, page }` - Authentication tokens and pagination
- **Process**: 
  1. Authenticates with PocketBase admin
  2. Fetches products from Portaus API for specified page
  3. Transforms product data using `PortausApi.processProduct()`
  4. Batch upserts products to PocketBase collection
- **Output**: `{ totalPages, processedProducts, pocketResponse }`

**`getSaqBranches/+server.ts`**
- **Purpose**: Retrieves SAQ branch locations for order pickup
- **Method**: GET (likely)
- **Integration**: Calls Portaus API `getSaqBranches()` function
- **Output**: List of SAQ branch locations with addresses and details

### Customer Management Endpoints

**`checkExisitingContact/+server.ts`**
- **Purpose**: Validates if customer email exists in system
- **Method**: POST
- **Input**: `{ email }` - Customer email address
- **Process**: Queries PocketBase for existing contact
- **Status**: Implementation appears incomplete

**`createClient/+server.ts`**
- **Purpose**: Creates new customer records in system
- **Method**: Likely POST
- **Contains**: Extensive cURL command examples for Portaus customer creation
- **Process**: Complex customer data structure with addresses, contacts, settings

**`createAccountFromExistingEmail/+server.ts`**
- **Purpose**: Creates user account for existing customer email
- **Method**: POST
- **Process**: Account creation workflow for returning customers

### Order Processing Endpoints

**`createOrder/+server.ts`**
- **Purpose**: Processes new wine orders
- **Method**: Likely POST
- **Contains**: Comprehensive cURL example for Portaus order creation
- **Process**: Complex order structure with products, pricing, taxes, delivery

### Document Generation

**`generate-pdf/+server.ts`**
- **Purpose**: Generates PDF documents (product catalogs, invoices)
- **Method**: POST (likely)
- **Status**: Minimal implementation, may need development

## API Patterns and Conventions

### Authentication Pattern
Most endpoints follow this pattern:
```typescript
const pbAdmin = new PocketBase(PUBLIC_DB_URL);
await pbAdmin.collection('_superusers').authWithPassword(
    POCKETBASE_ADMIN_USER, 
    POCKETBASE_ADMIN_PASSWORD
);
```

### Error Handling
```typescript
try {
    const result = await operation();
    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    });
} catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
}
```

### Data Transformation
- Products fetched from Portaus API are transformed using `PortausApi.processProduct()`
- Customer data follows complex Portaus schema with addresses, contacts, settings
- Orders include detailed pricing, tax calculations, and delivery information

## Integration Workflows

### Product Synchronization Flow
1. Admin triggers product sync from frontend
2. API endpoint authenticates with PocketBase admin
3. Fetches paginated product data from Portaus API
4. Transforms and validates product data
5. Batch uploads to PocketBase collections
6. Returns sync status and processed counts

### Customer Management Flow
1. Check if customer email exists in system
2. If existing contact, create account from existing data
3. If new customer, create complete customer record
4. Sync customer data between PocketBase and Portaus

### Order Processing Flow
1. Validate customer and product information
2. Calculate pricing including taxes and agency fees
3. Create order in Portaus system
4. Store order reference in PocketBase
5. Generate confirmation documents

## Development Notes

### Environment Dependencies
- Requires admin credentials for PocketBase
- Needs Portaus API tokens and base URL
- Some endpoints may require Supabase configuration

### Data Models
- Customer objects include complex address and contact structures
- Orders contain detailed line items with pricing calculations
- Products have extensive metadata and categorization

### Incomplete Implementations
- Several endpoints contain placeholder implementations
- cURL examples suggest intended functionality
- Some endpoints may need completion based on business requirements

### Security Considerations
- Admin authentication required for most operations
- API tokens handled securely through environment variables
- Input validation needed for all endpoints
- Error responses should not expose sensitive information