# Recovered Frontend Files for Fursan CMS

## Summary
This document lists all the critical frontend files that were recovered for the Fursan CMS project.

## Task 1: API Layer

### File: `src/api/axios.js`
- Created Axios instance configured with `VITE_API_URL` environment variable
- Defaults to `localhost:8000` if env var not set
- Sets baseURL to the API base
- Includes request interceptor for auth token
- Includes response interceptor for 401 handling
- Exports the configured axios instance

### File: `src/api/pagesApi.js`
- Imported axios instance from `./axios.js`
- Created `pagesApi` object with methods:
  - `getOne(id)` - GET `/api/v1/pages/${id}` with proper unwrapping: `res.data.data || res.data`
  - `getAll()` - GET `/api/v1/pages`
  - `create(data)` - POST `/api/v1/pages`
  - `update(id, data)` - PUT `/api/v1/pages/${id}`
  - `delete(id)` - DELETE `/api/v1/pages/${id}`
- All methods properly handle the JsonResource wrapper (res.data.data)

## Task 2: Create Hooks

### File: `src/hooks/useSite.tsx` (renamed from .ts to .tsx)
- Created custom hook with `getPreviewUrl(siteDomain, pageSlug)` function
- Preview URL format: `/${import.meta.env.BASE_URL}/${siteDomain}/${pageSlug}`
- Exports the hook using useMemo for performance

## Task 3: Page Builder Structure

### Directory: `src/pages/admin/Pages/Builder/`

### File: `src/pages/admin/Pages/Builder/blockTypes.ts`
- Defined block type constants (HERO, TEXT, IMAGE, CTA, VIDEO, GALLERY, TESTIMONIAL, FEATURES, PRICING, CONTACT_FORM, SPACER, DIVIDER, HTML, BUTTON, ICON_BOX)
- Defined block categories (BASIC, MEDIA, ADVANCED, LAYOUT)
- Created BLOCK_DEFINITIONS with metadata for each block type
- Implemented helper functions:
  - `getBlockDefinition(type)` - Get block definition by type
  - `getBlocksByCategory(category)` - Get blocks by category
  - `createBlock(type, id)` - Create a new block instance

### File: `src/pages/admin/Pages/Builder/index.tsx` (Main Page Builder - ~950 lines)
- Imported and used:
  - `pagesApi` from `src/api/pagesApi.js`
  - `useSite` from `src/hooks/useSite.tsx`
  - Block types from `./blockTypes.ts`
  - Shared helpers from `../../Builder/sharedHelpers.tsx`
- State management:
  - `blocksEn` and `blocksAr` arrays for bilingual content
  - `lang` state to toggle between 'en' and 'ar'
- Loads page data in useEffect:
  - Uses `pagesApi.getOne(id)` to load
  - Unwraps with `const pageData = data.data || data` (handles double-wrap issue)
  - Sets blocksEn and blocksAr from pageData
- Integrated @dnd-kit for drag-and-drop block reordering
- Integrated TipTap 3 for rich text editing within blocks
- Includes preview functionality using `getPreviewUrl()`
- Full page builder UI with:
  - Block list with drag-and-drop
  - Block editor with TipTap rich text
  - Language toggle (English/Arabic)
  - Preview button
  - Save button
  - Block type selector modal

### File: `src/pages/admin/Builder/sharedHelpers.tsx`
- Created shared helpers for the page builder
- Integrated @dnd-kit library for drag-and-drop functionality
- Exported utility functions:
  - `createSensors()` - Create dnd-kit sensors
  - `handleDragEnd()` - Handle drag end event
  - `handleDragStart()` - Handle drag start event
  - `handleDragCancel()` - Handle drag cancel
  - `DndContextWrapper` - React component wrapper for DnD context
- Included helpers for block manipulation (`blockHelpers`):
  - `addBlock()` - Add a new block
  - `removeBlock()` - Remove a block by ID
  - `updateBlock()` - Update block content
  - `duplicateBlock()` - Duplicate a block
  - `moveBlockUp()` - Move block up
  - `moveBlockDown()` - Move block down

### File: `src/pages/admin/Builder/SortableItem.tsx`
- Created SortableItem component wrapping @dnd-kit's useSortable hook
- Provides drag-and-drop functionality for individual blocks
- Exports the SortableItem component

## Task 4: Updated Routing

### File: `src/App.jsx`
- Added import for the Page Builder: `import Builder from './pages/admin/Pages/Builder'`
- Added routes inside the AdminGuard:
  - `<Route path="/admin/pages" element={<Builder />} />`
  - `<Route path="/admin/pages/:id/edit" element={<Builder />} />`
- Kept all existing routes intact

## Dependencies Installed
The following packages were installed to support the new functionality:
- `@tiptap/react` - React integration for TipTap editor
- `@tiptap/starter-kit` - Basic TipTap extensions
- `@tiptap/extension-image` - Image extension for TipTap
- `@tiptap/extension-link` - Link extension for TipTap
- `@tiptap/extension-placeholder` - Placeholder extension for TipTap
- `@tiptap/extension-text-align` - Text alignment extension for TipTap
- `@tiptap/extension-underline` - Underline extension for TipTap
- `@tiptap/extension-color` - Color extension for TipTap
- `@tiptap/extension-text-style` - Text style extension for TipTap
- `@tiptap/extension-font-family` - Font family extension for TipTap
- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable extension for @dnd-kit
- `@dnd-kit/utilities` - Utilities for @dnd-kit

## Important Notes
- All files use plain JavaScript with JSX (no TypeScript despite .tsx extensions)
- React Compiler is enabled (babel-plugin-react-compiler)
- Tailwind 4 with @tailwindcss/vite plugin is available
- All API responses use JsonResource wrapper - always use `res.data.data || res.data`
- Preview URLs use BASE_URL from import.meta.env
- Build succeeds with a warning about chunk size (can be optimized later with code splitting)

## Build Verification
The project builds successfully:
```
✓ 186 modules transformed.
✓ built in 5.04s
```

## File Structure Created
```
src/
├── api/
│   ├── axios.js
│   └── pagesApi.js
├── hooks/
│   └── useSite.tsx
└── pages/
    └── admin/
        ├── Builder/
        │   ├── sharedHelpers.tsx
        │   └── SortableItem.tsx
        └── Pages/
            └── Builder/
                ├── blockTypes.ts
                └── index.tsx
```
