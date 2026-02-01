# Font Awesome to Lucide React - Remaining Migration Plan

## Overview
This document outlines the migration strategy for the **last remaining file** that still uses Font Awesome icons. The migration is nearly complete, with only one file requiring updates.

---

## Current Status

### Files Still Using Font Awesome
| File | Issue | Status |
|------|-------|--------|
| [`src/routes/CharacterBookLibrary.tsx`](src/routes/CharacterBookLibrary.tsx:1) | Uses `FontAwesomeIcon` from `@fortawesome/react-fontawesome` | **Needs Migration** |

### Files with Unused Icon Imports
| File | Unused Import | Action |
|------|---------------|--------|
| [`src/Layouts/Header/NavigationMenu.tsx`](src/Layouts/Header/NavigationMenu.tsx:22) | `Books` from `@/components/icons/books` | Remove unused import |
| [`src/routes/CharacterBookEditorPage.tsx`](src/routes/CharacterBookEditorPage.tsx:10) | `BookFont` from `@/components/icons/bookFont` | Remove unused import |

---

## Icon Mapping for CharacterBookLibrary.tsx

The file uses two icon types wrapped in `FontAwesomeIcon`:

| Current Usage | Icon Component | Lucide Equivalent |
|---------------|----------------|-------------------|
| `<FontAwesomeIcon icon={Books} />` | Custom `Books` icon | `BookOpen` or `Book` |
| `<FontAwesomeIcon icon={bookArrowUp} />` | Custom `bookArrowUp` icon | `BookUp` or `Upload` |

**Note**: The custom icon components (`Books` and `bookArrowUp`) imported from `@/components/icons/` do not exist in the codebase. These should be replaced directly with Lucide icons.

---

## Migration Steps

### Step 1: Update CharacterBookLibrary.tsx

**Changes needed:**

1. **Remove Font Awesome import:**
   ```tsx
   // Remove this line:
   import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
   ```

2. **Remove non-existent icon imports:**
   ```tsx
   // Remove these lines:
   import bookArrowUp from '@/components/icons/bookArrowUp'
   import Books from '@/components/icons/books'
   ```

3. **Add Lucide imports:**
   ```tsx
   // Add this line:
   import { Book, BookOpen, Upload } from 'lucide-react'
   ```

4. **Update icon usages:**
   ```tsx
   // Line 48 - Change from:
   icon={<FontAwesomeIcon icon={Books} />}
   // To:
   icon={<BookOpen size={20} />}

   // Line 53 - Change from:
   icon={<FontAwesomeIcon icon={bookArrowUp} />}
   // To:
   icon={<Upload size={20} />}

   // Line 58 - Change from:
   icon={<FontAwesomeIcon icon={Books} />}
   // To:
   icon={<Book size={20} />}
   ```

### Step 2: Remove Unused Imports

**File: [`src/Layouts/Header/NavigationMenu.tsx`](src/Layouts/Header/NavigationMenu.tsx:22)**

```tsx
// Remove line 22:
import Books from '@/components/icons/books'
```

**File: [`src/routes/CharacterBookEditorPage.tsx`](src/routes/CharacterBookEditorPage.tsx:10)**

```tsx
// Remove line 10:
import BookFont from '@/components/icons/bookFont'
```

---

## Complete File Changes

### CharacterBookLibrary.tsx - Before & After

**Before:**
```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, type Theme, Typography, useMediaQuery } from '@mui/material'
import { type FC, useState } from 'react'
import CharacterBookTable from '@/components/characterBookLibrary/CharacterBookTable'
import ImportCharacterBooks from '@/components/characterBookLibrary/ImportCharacterBooks'
import ManageLibrary from '@/components/characterBookLibrary/ManageLibrary'
import bookArrowUp from '@/components/icons/bookArrowUp'
import Books from '@/components/icons/books'
import Fluid from '@/Layouts/FluidLayout'
```

**After:**
```tsx
import { Book, BookOpen, Upload } from 'lucide-react'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Box, Tab, type Theme, Typography, useMediaQuery } from '@mui/material'
import { type FC, useState } from 'react'
import CharacterBookTable from '@/components/characterBookLibrary/CharacterBookTable'
import ImportCharacterBooks from '@/components/characterBookLibrary/ImportCharacterBooks'
import ManageLibrary from '@/components/characterBookLibrary/ManageLibrary'
import Fluid from '@/Layouts/FluidLayout'
```

---

## Testing Checklist

After migration, verify:

- [ ] Build completes without errors (`bun run build`)
- [ ] Development server starts successfully (`bun run dev`)
- [ ] Character Book Library page displays correctly
- [ ] All three tabs (Library, Import, Manage) show their icons
- [ ] Icons are properly aligned and sized
- [ ] No console errors related to icons
- [ ] Icons are visually consistent with other pages using Lucide

---

## Summary

**Files to modify:** 3
- [`src/routes/CharacterBookLibrary.tsx`](src/routes/CharacterBookLibrary.tsx:1) - Migrate icons
- [`src/Layouts/Header/NavigationMenu.tsx`](src/Layouts/Header/NavigationMenu.tsx:22) - Remove unused import
- [`src/routes/CharacterBookEditorPage.tsx`](src/routes/CharacterBookEditorPage.tsx:10) - Remove unused import

**Icons to replace:** 3 instances of `FontAwesomeIcon` with Lucide equivalents

**Estimated complexity:** Low - straightforward icon replacement

**Dependencies:** Lucide React is already installed (`lucide-react@^0.400.0`)

---

## Post-Migration Cleanup

After successful migration and testing:

1. Verify no Font Awesome packages remain in [`package.json`](package.json)
2. Remove Font Awesome dependencies from [`bun.lock`](bun.lock) (via `bun install`)
3. Delete or archive migration scripts in [`scripts/`](scripts/) directory:
   - `migrate-icons.js`
   - `migrate-icons-v2.js`
   - `migrate-icons-v3.js`
4. Update or archive migration plan documents:
   - [`plans/fontawesome-to-lucide-migration-plan.md`](plans/fontawesome-to-lucide-migration-plan.md)
   - [`plans/fontawesome-to-lucide-migration-summary.md`](plans/fontawesome-to-lucide-migration-summary.md)
