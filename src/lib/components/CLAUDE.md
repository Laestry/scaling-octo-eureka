# CLAUDE.md - src/lib/components/

This file provides guidance to Claude Code when working with reusable Svelte components in this directory.

## Directory Overview

This directory contains reusable UI components used throughout the Ward & Associés wine e-commerce application.

## Component Categories

### Form Components

**`Input.svelte`**
- Custom input component with built-in validation
- Supports real-time validation with custom schemas
- Handles error states and hint messages
- Used extensively in checkout and contact forms

**`Select.svelte`**
- Custom dropdown/select component
- Supports validation and error handling
- Used for SAQ branch selection, category filters
- Includes placeholder and hint functionality

**`Toggle.svelte`**
- Custom toggle switch component
- Used for newsletter subscription, settings
- Supports custom on/off text labels

### UI Components

**`Accordion.svelte`**
- Collapsible content sections
- Used in admin panel for organizing functionality
- Supports custom titles and expandable content

**`Carousel.svelte`**
- Image carousel/slider component
- Used for product image galleries
- Supports navigation controls and indicators

**`Logo.svelte`**
- Company logo component with dynamic color support
- Accepts color prop for different brand contexts
- Used in header with responsive sizing

### Interactive Components

**`FavoriteButton.svelte`**
- Heart icon button for adding products to favorites
- Handles favorite state management
- Integrates with user preferences system

**`ImageLoader.svelte`**
- Progressive image loading component
- Handles loading states and fallback images
- Used for product images throughout the application

## Component Usage Patterns

### Import Pattern
```typescript
import ComponentName from '$lib/components/ComponentName.svelte';
```

### Form Component Integration
```svelte
<Input
    bind:value={formData.field}
    bind:this={fieldInput}
    validate={{ type: 'string', minLength: 1 }}
    hint="Field is required"
    placeholder="Enter value"
/>
```

### Validation Handling
```typescript
// Components support custom validation schemas
const errors = fieldInput.handleValidate();
if (errors !== '') {
    // Handle validation error
}
```

## Design System

### Styling Approach
- Components use Tailwind CSS for styling
- Support custom CSS classes via `class` prop
- Consistent design tokens across components
- Responsive design built into components

### Color System
- Uses CSS custom properties for brand colors
- Dynamic color support for different contexts
- Consistent with overall brand design

### Accessibility
- Components include proper ARIA attributes
- Keyboard navigation support where applicable
- Screen reader friendly implementations

## Component Dependencies

### External Libraries
- Some components may use third-party Svelte libraries
- Icons imported from `$lib/icons` collection
- Form validation uses custom schema validation

### Internal Dependencies
- Components may import utilities from `$lib/utils`
- State management through Svelte stores
- Type definitions from `$lib/models`

## Development Guidelines

### Component Props
- All components accept `class` prop for custom styling
- Use TypeScript interfaces for prop definitions
- Provide sensible defaults for optional props

### Event Handling
- Components dispatch custom events using `createEventDispatcher`
- Standard HTML events are forwarded where appropriate
- Event names follow consistent naming conventions

### State Management
- Internal component state uses Svelte's reactive declarations
- External state managed through stores or props
- Two-way binding support via `bind:` directives

### Testing Considerations
- Components are designed to be testable in isolation
- Props and events can be easily mocked
- Validation logic is separated for unit testing