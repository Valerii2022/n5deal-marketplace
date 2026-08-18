# N5Deal Marketplace - Architecture Overview

## Project Structure

This document describes the foundational architecture established for the N5Deal Marketplace technical assignment.

### Technology Stack

- **Framework**: Next.js 16.3.1 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Runtime**: React 19.2.8
- **Deployment Target**: Vercel

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
│
├── components/            # React components organized by domain
│   ├── ui/               # Reusable UI components (buttons, inputs, cards, etc.)
│   ├── layout/           # Layout components (header, footer, navigation)
│   ├── assets/           # Asset-related components (listings, details, forms)
│   ├── buyers/           # Buyer-specific components (dashboard, purchases)
│   ├── messages/         # Messaging system components
│   └── manager/          # Manager/admin components (analytics, moderation)
│
├── lib/                   # Utility functions and shared logic
│                          # (database connection, helpers, constants)
│
├── models/               # MongoDB/Mongoose data models
│                          # (User, Asset, Message schemas)
│
├── services/             # Business logic layer
│                          # (separated from API routes and UI)
│
└── types/                # TypeScript type definitions and interfaces
                           # (shared types, API contracts, domain models)
```

### Architectural Decisions

#### 1. Full-Stack Next.js Architecture
- **Decision**: Use Next.js as the full-stack framework (no separate Express backend)
- **Rationale**: 
  - Simplified deployment to Vercel
  - Built-in API routes with Route Handlers
  - Better TypeScript integration across frontend and backend
  - Reduced complexity and maintenance overhead

#### 2. Separation of Concerns
- **Models**: Database schemas and data access logic
- **Services**: Business logic independent of HTTP/UI concerns
- **Components**: UI presentation organized by domain
- **Types**: Shared TypeScript contracts across all layers

#### 3. Component Organization
Components are organized by domain/feature rather than by type:
- `ui/`: Generic, reusable components
- `layout/`: App-wide layout components
- `assets/`, `buyers/`, `messages/`, `manager/`: Domain-specific components

This structure supports:
- Easy feature location
- Clear ownership boundaries
- Scalability as features grow

### Future Implementation Phases

The following will be implemented in subsequent phases:

1. **Database Layer**
   - MongoDB connection setup in `lib/`
   - Mongoose models in `models/`
   - User, Asset, Message schemas

2. **Authentication & Authorization**
   - Role-based access control (BUYER, SELLER, MANAGER)
   - Session management
   - Protected routes

3. **API Layer**
   - Next.js Route Handlers in `app/api/`
   - Service layer integration
   - Input validation

4. **Core Features**
   - Asset marketplace functionality
   - Messaging system
   - User dashboards
   - Manager analytics

5. **AI Integration**
   - Asset recommendations
   - Smart search
   - Content moderation

### Current Status

✅ **Completed**:
- Project initialization with Next.js 16
- TypeScript configuration
- Tailwind CSS setup
- Foundational folder structure
- Professional landing page
- Build verification
- Type checking setup

❌ **Not Yet Implemented**:
- Database models
- API endpoints
- Authentication
- Business logic
- Feature components
- Testing infrastructure

### Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npx tsc --noEmit # Type checking
```

### Design Principles

1. **No Premature Abstraction**: Folders exist but are empty until needed
2. **Type Safety**: Strict TypeScript throughout
3. **Separation of Concerns**: Clear boundaries between layers
4. **Scalability**: Structure supports growth without refactoring
5. **Vercel-Ready**: Optimized for serverless deployment

---

**Last Updated**: 2026-08-18
**Status**: Foundation Complete - Ready for Feature Implementation
