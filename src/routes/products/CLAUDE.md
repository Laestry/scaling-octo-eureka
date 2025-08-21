# CLAUDE.md - src/routes/products/

This file provides guidance to Claude Code when working with the product catalog functionality in this directory.

## Directory Overview

This directory contains the complete product browsing, filtering, and display system for the Ward & Associés wine e-commerce application.

## Core Route Files

### Main Product Listing
**`+page.svelte`**
- **Purpose**: Main product catalog page with grid/list view and filters
- **Features**: 
  - Responsive product grid layout
  - Integrated filtering sidebar
  - Search functionality
  - Pagination and sorting options
- **Components Used**: ProductGrid, Filters, SearchResults

**`+page.server.ts`**
- **Purpose**: Server-side data loading with complex filtering logic
- **Features**:
  - URL parameter parsing for all filter types
  - Dynamic PocketBase query building
  - Filter validation and sanitization
  - Product and category data loading
- **Filter Types**: producer, region, color, format, vintage, uvc, priceRange, sorting, nameSearch, tag

**`+layout.svelte`**
- **Purpose**: Layout wrapper for products section
- **Features**: Consistent styling and navigation for product pages

## Product Display Components

### Core Display Components
**`ProductCard.svelte`**
- **Purpose**: Individual product card component
- **Features**: 
  - Multiple size variants (s, m, l)
  - Product image, name, price display
  - Add to cart functionality
  - Responsive design

**`ProductGrid.svelte`**
- **Purpose**: Grid layout for product cards
- **Features**: Responsive grid with different layouts per screen size

**`ProductList.svelte`**
- **Purpose**: Alternative list view for products
- **Features**: Compact product display for mobile/preference

**`ProductRow.svelte`**
- **Purpose**: Horizontal product row layout
- **Features**: Used in homepage and related products sections

### Filtering System

**`Filters/`** - Complete filtering subsystem
- **`Filters.svelte`** - Main filter container component
- **`Filter.svelte`** - Individual filter component (dropdown, checkbox, etc.)
- **`PriceRange.svelte`** - Price range slider/selector
- **`SearchBar.svelte`** - Text search input with suggestions

### Additional Components
**`SearchResults.svelte`**
- **Purpose**: Display search results and active filters
- **Features**: Shows applied filters, result counts, clear filters

**`Tag.svelte`**
- **Purpose**: Product tag display component
- **Features**: Clickable tags for filtering, category navigation

## Filtering Logic

### URL Parameter Structure
The filtering system uses URL parameters to maintain state:
```typescript
// Example URL: /products?producer=Domaine&color=Rouge&priceRange=mid&sorting=Prix+croissant
const filterObj: TFilters = {
    producer: ['Domaine'],
    region: ['Bordeaux'],
    color: ['Rouge'],
    uvc: [12],
    format: ['750ml'],
    vintage: ['2020'],
    priceRange: 'mid', // 'low' | 'mid' | 'high'
    sorting: 'Prix croissant', // 'Prix décroissant' | 'Alphabétique'
    nameSearch: 'search term',
    tag: 'category tag'
};
```

### PocketBase Query Building
```typescript
// Dynamic filter building
let filterParts: string[] = [];
if (filterObj.producer) filterParts.push(`providerName="${filterObj.producer}"`);
if (filterObj.region) filterParts.push(`originRegion="${filterObj.region}"`);
if (filterObj.color) filterParts.push(`specificCategory="${filterObj.color}"`);

// Price range logic
if (filterObj.priceRange === 'low') {
    filterParts.push(`price>=20 && price<=30`);
} else if (filterObj.priceRange === 'mid') {
    filterParts.push(`price>=30 && price<=40`);
} else if (filterObj.priceRange === 'high') {
    filterParts.push(`price>=40`);
}

const filter = filterParts.join(' && ');
```

## Product Data Model

### Product Properties
Products are stored in PocketBase `alcohol_products` collection:
- **Basic Info**: name, description, providerName, vintage
- **Categorization**: specificCategory, originRegion, tags
- **Pricing**: price, priceTaxIn, pricing object with agency fees
- **Physical**: uvc (units per case), lblFormat (bottle size)
- **Images**: product images and carousel data

### Related Data
- **Categories**: Separate collection for product categorization
- **Producers**: Filtered from product data
- **Regions**: Wine regions for filtering

## User Experience Features

### Responsive Design
- **Desktop**: Full grid layout with sidebar filters
- **Tablet**: Condensed grid with collapsible filters
- **Mobile**: Stacked layout with modal filters

### Performance Optimizations
- Pagination to limit products per page
- Image lazy loading in product cards
- URL-based state management for back button support
- Server-side filtering reduces client-side processing

### Shopping Integration
- Add to cart functionality in all product displays
- Cart state management through Svelte stores
- Price display with tax calculations
- Quantity selection and validation

## Development Patterns

### Component Reusability
- ProductCard component used throughout application
- Consistent styling via Tailwind CSS classes
- Props-based customization for different contexts

### State Management
- URL parameters for filter state
- Svelte stores for cart and user preferences
- Server-side data loading for initial page state

### Error Handling
- Graceful fallbacks for missing product data
- Loading states during filtering operations
- Input validation for search and filters