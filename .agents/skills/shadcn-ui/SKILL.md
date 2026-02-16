---
name: shadcn-ui
description: Provides complete shadcn/ui component library patterns including installation, configuration, and implementation of accessible React components. Use when setting up shadcn/ui, installing components, building forms with React Hook Form and Zod, customizing themes with Tailwind CSS, or implementing UI patterns like buttons, dialogs, dropdowns, tables, and complex form layouts.
---

# shadcn/ui

Copy-paste component library built on Radix UI + Tailwind CSS. You own the code.

## Setup

```bash
npx shadcn@latest init
```

Select: TypeScript, Default style, CSS variables, `@/components` path alias.

## Adding Components

```bash
npx shadcn@latest add <component>       # Single component
npx shadcn@latest add button input form  # Multiple
npx shadcn@latest add --all             # Everything
```

## Key Concepts

- Components install to `src/components/ui/` — modify them directly.
- Theming via CSS variables in `globals.css` (see tailwind-v4-shadcn skill for Tailwind v4 setup).
- Most interactive components need `'use client'` directive.
- Forms use React Hook Form + Zod via the `form` component.

## Component Reference

Before implementing a component, fetch its docs page for current API and examples.

### Layout & Structure
- **Accordion**: https://ui.shadcn.com/docs/components/accordion
- **Card**: https://ui.shadcn.com/docs/components/card
- **Collapsible**: https://ui.shadcn.com/docs/components/collapsible
- **Resizable**: https://ui.shadcn.com/docs/components/resizable
- **Scroll Area**: https://ui.shadcn.com/docs/components/scroll-area
- **Separator**: https://ui.shadcn.com/docs/components/separator
- **Tabs**: https://ui.shadcn.com/docs/components/tabs

### Forms & Inputs
- **Button**: https://ui.shadcn.com/docs/components/button
- **Checkbox**: https://ui.shadcn.com/docs/components/checkbox
- **Combobox**: https://ui.shadcn.com/docs/components/combobox
- **Date Picker**: https://ui.shadcn.com/docs/components/date-picker
- **Form**: https://ui.shadcn.com/docs/components/form
- **Input**: https://ui.shadcn.com/docs/components/input
- **Input OTP**: https://ui.shadcn.com/docs/components/input-otp
- **Label**: https://ui.shadcn.com/docs/components/label
- **Radio Group**: https://ui.shadcn.com/docs/components/radio-group
- **Select**: https://ui.shadcn.com/docs/components/select
- **Slider**: https://ui.shadcn.com/docs/components/slider
- **Switch**: https://ui.shadcn.com/docs/components/switch
- **Textarea**: https://ui.shadcn.com/docs/components/textarea
- **Toggle**: https://ui.shadcn.com/docs/components/toggle
- **Toggle Group**: https://ui.shadcn.com/docs/components/toggle-group

### Data Display
- **Avatar**: https://ui.shadcn.com/docs/components/avatar
- **Badge**: https://ui.shadcn.com/docs/components/badge
- **Calendar**: https://ui.shadcn.com/docs/components/calendar
- **Carousel**: https://ui.shadcn.com/docs/components/carousel
- **Chart**: https://ui.shadcn.com/docs/components/chart
- **Data Table**: https://ui.shadcn.com/docs/components/data-table
- **Table**: https://ui.shadcn.com/docs/components/table

### Overlays & Feedback
- **Alert**: https://ui.shadcn.com/docs/components/alert
- **Alert Dialog**: https://ui.shadcn.com/docs/components/alert-dialog
- **Dialog**: https://ui.shadcn.com/docs/components/dialog
- **Drawer**: https://ui.shadcn.com/docs/components/drawer
- **Hover Card**: https://ui.shadcn.com/docs/components/hover-card
- **Popover**: https://ui.shadcn.com/docs/components/popover
- **Sheet**: https://ui.shadcn.com/docs/components/sheet
- **Sonner (Toast)**: https://ui.shadcn.com/docs/components/sonner
- **Toast**: https://ui.shadcn.com/docs/components/toast
- **Tooltip**: https://ui.shadcn.com/docs/components/tooltip

### Navigation
- **Breadcrumb**: https://ui.shadcn.com/docs/components/breadcrumb
- **Command**: https://ui.shadcn.com/docs/components/command
- **Context Menu**: https://ui.shadcn.com/docs/components/context-menu
- **Dropdown Menu**: https://ui.shadcn.com/docs/components/dropdown-menu
- **Menubar**: https://ui.shadcn.com/docs/components/menubar
- **Navigation Menu**: https://ui.shadcn.com/docs/components/navigation-menu
- **Pagination**: https://ui.shadcn.com/docs/components/pagination
- **Sidebar**: https://ui.shadcn.com/docs/components/sidebar

### Utilities
- **Aspect Ratio**: https://ui.shadcn.com/docs/components/aspect-ratio
- **Progress**: https://ui.shadcn.com/docs/components/progress
- **Skeleton**: https://ui.shadcn.com/docs/components/skeleton

## Theming
- **Theming guide**: https://ui.shadcn.com/docs/theming
- **Dark mode**: https://ui.shadcn.com/docs/dark-mode
- **Typography**: https://ui.shadcn.com/docs/components/typography
- **Figma**: https://ui.shadcn.com/docs/figma

## References
- Docs: https://ui.shadcn.com/docs
- Examples: https://ui.shadcn.com/examples
- Blocks (full page templates): https://ui.shadcn.com/blocks
