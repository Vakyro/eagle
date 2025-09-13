# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Eagle is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS v4. It's a fresh Next.js project created with `create-next-app`.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build production application with Turbopack
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint for code quality checks

### Package Management
- `npm install` - Install dependencies
- `npm ci` - Clean install (for CI/CD environments)

## Architecture Overview

### Project Structure
```
eagle/
├── src/app/                    # App Router directory (Next.js 13+ pattern)
│   ├── layout.tsx             # Root layout component
│   ├── page.tsx               # Home page component
│   └── globals.css            # Global styles with Tailwind CSS
├── public/                    # Static assets
└── Configuration files
```

### Key Technologies
- **Next.js 15** with App Router - Full-stack React framework
- **TypeScript 5** - Type safety and better development experience
- **Tailwind CSS v4** - Utility-first CSS framework with new @theme inline syntax
- **Turbopack** - Next-generation bundler (used in dev and build)
- **React 19** - Latest React with concurrent features

### Configuration Files
- `next.config.ts` - Next.js configuration (currently minimal)
- `tsconfig.json` - TypeScript configuration with `@/*` path mapping to `./src/*`
- `eslint.config.mjs` - ESLint configuration using Next.js recommended rules
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS v4
- `package.json` - Dependencies and npm scripts

### Styling Architecture
- **Tailwind CSS v4** with new inline theme syntax in `globals.css`
- **CSS Custom Properties** for theming (supports dark mode via `prefers-color-scheme`)
- **Geist fonts** - Sans and mono variants loaded via `next/font/google`
- **Color scheme variables**: `--background` and `--foreground` with automatic dark mode

### App Router Patterns
- Uses `src/app/` directory structure (not `pages/`)
- Server Components by default
- `layout.tsx` provides global layout and metadata
- Font optimization with Next.js font system
- Static asset optimization with `next/image`

## Development Notes

### Path Aliases
- `@/*` maps to `./src/*` - use for cleaner imports within the src directory

### TypeScript Configuration
- Strict mode enabled
- ES2017 target with modern features
- Incremental compilation enabled for faster builds
- Next.js plugin integrated for optimal type checking

### Build Optimization
- Turbopack enabled for both development and production builds
- Image optimization built into Next.js Image component
- Font optimization with automatic font loading and variable font support