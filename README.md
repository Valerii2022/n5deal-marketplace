# N5Deal Marketplace

A full-stack M&A marketplace prototype for businesses, investment opportunities, and financial assets. Built as a technical assignment to demonstrate end-to-end product development, focusing on working user flows rather than production-scale infrastructure.

The platform connects three types of users:
- **Buyers** - Investors and acquirers seeking opportunities
- **Sellers** - Business owners and asset holders
- **Platform Managers** - Administrators moderating marketplace quality

---

## Features

### Buyer Capabilities

- **Authentication** - Secure login with role-based access
- **Dashboard** - Overview of activity and unread messages
- **Profile Management** - Maintain company information and bio
- **Investment Preferences** - Define industries, acquisition types, and investment range
- **Marketplace Browsing** - View all active assets
- **Search & Filtering** - Find assets by keyword, type, industry, location, and price
- **Asset Details** - View comprehensive asset information including seller details
- **Contact Sellers** - Send messages to asset owners with optional asset reference
- **Message Inbox** - View received and sent messages with read/unread status
- **Message Detail** - Read full message threads with asset context

### Seller Capabilities

- **Authentication** - Secure login with role-based access
- **Dashboard** - Overview of listings and activity
- **Profile Management** - Maintain company information and bio
- **Create Assets** - Publish business listings, real estate, equity stakes, or other opportunities
- **Manage Listings** - View and suspend own assets
- **Browse Buyers** - Access buyer directory with investment profiles
- **Search & Filter Buyers** - Find buyers by industry, location, investment range, and acquisition type
- **Contact Buyers** - Send messages to potential investors with optional asset reference
- **Message Inbox** - View received and sent messages with read/unread status
- **Message Detail** - Read full message threads with asset context

### Platform Manager Capabilities

- **Authentication** - Secure login with administrative access
- **Platform Dashboard** - Overview of users, assets, and platform metrics
- **User Management** - View all buyers and sellers
- **User Search & Filtering** - Find users by name, email, role, and status
- **User Moderation** - Suspend or activate user accounts
- **Asset Management** - View all marketplace listings
- **Asset Search & Filtering** - Find assets by title, type, industry, and status
- **Asset Moderation** - Suspend or activate listings
- **Detail Views** - Access comprehensive user and asset information

---

## User Roles & Permissions

| Capability | Buyer | Seller | Manager |
|-----------|-------|--------|---------|
| Browse marketplace | ✅ | ✅ | ✅ |
| Search/filter assets | ✅ | ✅ | ✅ |
| View asset details | ✅ | ✅ | ✅ |
| Contact sellers | ✅ | ❌ | ❌ |
| Create assets | ❌ | ✅ | ❌ |
| Manage own listings | ❌ | ✅ | ❌ |
| Browse buyers | ❌ | ✅ | ❌ |
| Search/filter buyers | ❌ | ✅ | ❌ |
| Contact buyers | ❌ | ✅ | ❌ |
| View all users | ❌ | ❌ | ✅ |
| Moderate users | ❌ | ❌ | ✅ |
| Moderate assets | ❌ | ❌ | ✅ |
| Send/receive messages | ✅ | ✅ | ❌ |

---

## Main User Flows

### 1. Buyer Discovery Flow
1. Buyer logs in and navigates to marketplace
2. Buyer searches/filters assets by criteria (e.g., "Technology", $1M-$5M)
3. Buyer opens asset detail page to view full information
4. Buyer clicks "Contact Seller" and sends inquiry
5. Seller receives message in inbox with asset context
6. Both parties can view message history

### 2. Seller Outreach Flow
1. Seller logs in and navigates to buyer directory
2. Seller searches/filters buyers by investment profile (e.g., "Healthcare", $2M-$10M)
3. Seller clicks "Contact Buyer" on matching profile
4. Seller optionally references one of their own assets
5. Buyer receives message in inbox
6. Both parties can view message history

### 3. Asset Listing Flow
1. Seller creates new asset via "New Listing" form
2. Seller provides title, description, type, industry, location, pricing, and financials
3. Asset is saved and appears in seller's listings dashboard
4. Asset becomes immediately available in marketplace for buyers
5. Asset can be suspended by seller or platform manager if needed

### 4. Platform Moderation Flow
1. Manager reviews users or assets via search/filter tools
2. Manager opens detail page to view full information
3. Manager identifies policy violation or quality issue
4. Manager suspends user account or asset listing
5. Suspended entities are hidden from marketplace
6. Manager can reactivate if issue is resolved

---

## Tech Stack

### Core Framework
- **Next.js 16.3.1** - Full-stack React framework with App Router
- **React 19.2.8** - UI library
- **TypeScript 5** - Type-safe development

### Backend & Database
- **MongoDB** - Document database for marketplace data
- **Mongoose 9.9.3** - ODM for schema validation and queries
- **Next.js API Routes** - Server-side API handlers

### Authentication & Security
- **jose 6.2.9** - JWT creation and verification
- **bcrypt** (via custom implementation) - Password hashing
- **HTTP-only cookies** - Secure session storage

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Responsive design** - Mobile, tablet, and desktop support

### Development Tools
- **tsx** - TypeScript execution for seed scripts
- **ESLint** - Code linting

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Browser (Client)                    │
│  • React components                              │
│  • Role-specific dashboards                      │
│  • Search/filter UI                              │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│         Next.js App Router (Pages)               │
│  • /buyer/*    - Buyer pages                     │
│  • /seller/*   - Seller pages                    │
│  • /manager/*  - Manager pages                   │
│  • /marketplace - Public marketplace             │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│         Next.js API Routes (Backend)             │
│  • /api/auth/*     - Authentication              │
│  • /api/buyers/*   - Buyer operations            │
│  • /api/sellers/*  - Seller operations           │
│  • /api/manager/*  - Manager operations          │
│  • /api/assets/*   - Asset CRUD                  │
│  • /api/messages/* - Messaging                   │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│            Service Layer (Business Logic)        │
│  • buyer.service.ts                              │
│  • seller.service.ts                             │
│  • manager.service.ts                            │
│  • asset.service.ts                              │
│  • message.service.ts                            │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│         MongoDB + Mongoose (Persistence)         │
│  • User model (buyers, sellers, managers)        │
│  • Asset model (listings)                        │
│  • Message model (communications)                │
└─────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API route handlers
│   ├── buyer/             # Buyer-specific pages
│   ├── seller/            # Seller-specific pages
│   ├── manager/           # Manager-specific pages
│   ├── marketplace/       # Public marketplace
│   └── login/             # Authentication
├── components/            # React components
│   ├── buyer/            # Buyer components
│   ├── seller/           # Seller components
│   ├── manager/          # Manager components
│   └── marketplace/      # Marketplace components
├── lib/                   # Utilities
│   ├── auth.ts           # JWT operations
│   ├── authorization.ts  # RBAC helpers
│   ├── db.ts             # MongoDB connection
│   └── password.ts       # Password hashing
├── models/               # Mongoose schemas
│   ├── User.ts
│   ├── Asset.ts
│   └── Message.ts
├── services/             # Business logic layer
│   ├── buyer.service.ts
│   ├── seller.service.ts
│   ├── manager.service.ts
│   ├── asset.service.ts
│   └── message.service.ts
├── types/                # TypeScript definitions
└── scripts/              # Utility scripts
    └── seed.ts           # Database seeding
```

---

## Authentication & Authorization

### Authentication Mechanism

The application uses **JWT-based authentication** with HTTP-only cookies:

1. **Login** - User submits credentials to `/api/auth/login`
2. **Password Verification** - bcrypt compares hashed password
3. **JWT Creation** - Server creates JWT containing user ID, email, name, and role
4. **Cookie Storage** - JWT stored in HTTP-only cookie (7-day expiration)
5. **Session Verification** - Each request validates JWT and checks user status in database
6. **Logout** - `/api/auth/logout` clears the session cookie

### Authorization Strategy

**Server-Side Protection** (primary security layer):
- `requireAuth()` - Validates JWT and returns authenticated user
- `requireRole(role)` - Enforces specific role (BUYER, SELLER, or MANAGER)
- `requireRoles([roles])` - Allows multiple roles
- Applied to all protected API endpoints

**Client-Side Protection** (UX layer):
- Pages check authentication via `/api/auth/me`
- Redirect to `/login` if unauthenticated
- Show access denied if wrong role
- Prevent UI rendering of unauthorized actions

### Role-Based Access Control

- **BUYER** - Can access buyer dashboard, profile, marketplace, and buyer-to-seller messaging
- **SELLER** - Can access seller dashboard, profile, asset management, buyer directory, and seller-to-buyer messaging
- **MANAGER** - Can access manager dashboard, user management, asset moderation (cannot send messages)

### Security Features

- ✅ Passwords hashed with bcrypt
- ✅ JWT secrets from environment variables
- ✅ HTTP-only cookies prevent client-side JavaScript access to session tokens
- ✅ Secure flag in production
- ✅ Database verification on each request (checks user still exists and is ACTIVE)
- ✅ Authorization checks on all sensitive operations
- ✅ Ownership validation (sellers can only modify their own assets)

---

## Data Persistence

All application state persists in **MongoDB** using **Mongoose** schemas.

### Data Models

#### User
- **Fields**: name, email, passwordHash, role, status, company, location, bio, industries, investmentRange, acquisitionTypes
- **Roles**: BUYER, SELLER, MANAGER
- **Status**: ACTIVE, SUSPENDED
- **Relationships**: One-to-many with Assets (as seller), one-to-many with Messages (as sender/recipient)

#### Asset
- **Fields**: sellerId, title, description, assetType, industry, location, askingPrice, revenue, ebitda, status
- **Types**: BUSINESS, REAL_ESTATE, EQUITY, OTHER
- **Status**: ACTIVE, SUSPENDED
- **Relationships**: Belongs to User (seller), referenced by Messages
- **Indexes**: sellerId, askingPrice, status/type/created, status/industry/created

#### Message
- **Fields**: senderId, recipientId, assetId (optional), subject, body, read, timestamps
- **Relationships**: Belongs to User (sender), belongs to User (recipient), optionally references Asset
- **Indexes**: recipientId/read/created, senderId/created
- **Validation**: Enforces BUYER↔SELLER communication only, prevents manager messaging

### Persistence Behavior

- **Profile Updates** - Changes saved to MongoDB immediately, visible after refresh
- **Asset Creation** - New listings persist and appear in seller dashboard and marketplace
- **Message Sending** - Messages stored in database, visible in both sender and recipient inboxes
- **Status Changes** - Manager moderation actions (suspend/activate) persist across sessions
- **URL State** - Search/filter parameters stored in URL query params, preserved on refresh
- **Session State** - JWT cookie maintains authentication across browser sessions (7 days)

---

## API Overview

### Authentication
- `POST /api/auth/login` - Authenticate user, create session
- `POST /api/auth/logout` - Clear session cookie
- `GET /api/auth/me` - Get current authenticated user

### Buyer Operations
- `GET /api/buyers/me` - Get buyer profile
- `PATCH /api/buyers/me` - Update buyer profile (industries, investment range, acquisition types)

### Seller Operations
- `GET /api/sellers/me` - Get seller profile
- `PATCH /api/sellers/me` - Update seller profile
- `GET /api/sellers/buyers` - List buyers with search/filter (seller-only)

### Assets (Marketplace)
- `GET /api/assets` - List assets with search/filter/pagination
- `GET /api/assets/[id]` - Get single asset details
- `POST /api/assets` - Create new asset (seller-only)
- `PATCH /api/assets/[id]` - Update asset (owner-only)
- `DELETE /api/assets/[id]` - Suspend asset (owner-only)

### Messaging
- `GET /api/messages` - List messages (inbox/sent, with filters)
- `POST /api/messages` - Send message (buyer-to-seller or seller-to-buyer)
- `GET /api/messages/[id]` - Get message detail
- `PATCH /api/messages/[id]/read` - Mark message as read (recipient-only)

### Manager Operations
- `GET /api/manager/users` - List all users with search/filter
- `PATCH /api/manager/users/[id]` - Update user status (suspend/activate)
- `GET /api/manager/assets` - List all assets with search/filter
- `PATCH /api/manager/assets/[id]` - Update asset status (suspend/activate)

---

## Search, Filtering & URL State

### Marketplace (Asset Search)
- **Search** - Debounced text search (400ms) across title, description, industry, location
- **Filters** - Asset type, industry, location, status, min/max price
- **Sorting** - Newest, price ascending, price descending
- **Pagination** - Server-side pagination with configurable page size
- **URL Sync** - All search/filter/sort/page state stored in URL query parameters
- **Persistence** - Refresh preserves search state, browser back/forward works correctly

### Buyer Directory (Seller View)
- **Search** - Debounced text search (400ms) across buyer name, email, company, bio, industries
- **Filters** - Industry, location, min/max investment, acquisition type
- **Pagination** - Server-side pagination (20 buyers per page)
- **URL Sync** - All search/filter/page state stored in URL query parameters
- **Persistence** - Refresh preserves search state

### Manager Views
- **User Search** - Text search across name, email
- **User Filters** - Role (BUYER/SELLER/MANAGER), status (ACTIVE/SUSPENDED)
- **Asset Search** - Text search across title, description, industry, location
- **Asset Filters** - Asset type, industry, status
- **Pagination** - Server-side pagination with page controls

### Implementation Details
- **Debouncing** - Custom `useDebounce` hook prevents excessive API calls
- **URL Management** - `router.replace()` updates URL without creating history entries
- **Filter Chips** - Active filters displayed as removable chips
- **Reset Functionality** - Clear all filters with single action
- **Empty States** - Helpful messages when no results match filters

---

## Messaging

### Communication Rules
- **Buyer → Seller** - Allowed (e.g., inquiring about an asset)
- **Seller → Buyer** - Allowed (e.g., reaching out to potential investor)
- **Buyer → Buyer** - Blocked
- **Seller → Seller** - Blocked
- **Manager → Anyone** - Blocked (managers cannot send messages)
- **Self-messaging** - Blocked

### Message Features
- **Subject & Body** - Required fields with length validation
- **Asset Reference** - Optional link to specific listing (validated for ownership)
- **Read/Unread Status** - Recipients can mark messages as read
- **Inbox/Sent Folders** - Filter messages by direction
- **Unread Filter** - Show only unread messages
- **Pagination** - Server-side pagination for message lists
- **Sender/Recipient Info** - Populated with name and company
- **Timestamps** - Creation and update times tracked

### Message Validation
- Backend enforces all communication rules
- Asset references validated (buyer must message asset owner, seller can reference own assets)
- Recipient must be ACTIVE user
- Cannot message suspended users
- Role compatibility checked on every message send

### Message Persistence
- All messages stored in MongoDB
- Defensive null checks for populated references
- Handles edge cases (deleted users, deleted assets)
- Messages survive user status changes

---

## Responsive Design

The application is fully responsive across device sizes:

- **Desktop** (1024px+) - Full sidebar navigation, multi-column layouts
- **Tablet** (768px-1023px) - Adaptive layouts, collapsible navigation
- **Mobile** (320px-767px) - Single-column layouts, hamburger menus, touch-friendly buttons

### Responsive Features
- Flexible grid layouts (1-2 columns based on screen size)
- Mobile-optimized navigation with collapsible sidebars
- Touch-friendly button sizes and spacing
- Responsive modals with proper mobile scrolling
- Layouts designed to prevent horizontal overflow
- Readable text sizes across devices

---

## Demo Accounts

The project includes seed data with demo accounts for local evaluation.

**⚠️ DEMO ONLY - FOR LOCAL DEVELOPMENT/EVALUATION**

All demo accounts use the password: `Demo123!`

### Demo Users

**Manager**:
- Email: `sarah.mitchell@n5deal.com`
- Role: Platform Manager

**Buyers**:
- `michael.chen@techventures.com` - Tech Ventures Capital
- `j.rodriguez@horizonequity.com` - Horizon Equity Partners
- `david.t@realestatecapital.com` - Real Estate Capital Group
- `amanda.foster@growthpartners.com` - Growth Partners LLC
- `robert.kim@familyoffice.com` - Kim Family Office

**Sellers**:
- `james.patterson@cloudtech.com` - CloudTech Solutions
- `maria.gonzalez@precisionmfg.com` - Precision Manufacturing Inc
- `thomas.wright@wrightcommercial.com` - Wright Commercial Properties
- `lisa.anderson@andersonwellness.com` - Anderson Wellness Clinics
- `kevin.obrien@obrienretail.com` - O'Brien Retail Ventures

### Demo Data
- 12 sample assets across various industries
- Sample messages demonstrating buyer-seller communication
- Diverse investment profiles and acquisition types

---

## Local Development

### Prerequisites
- Node.js 18+ 
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd n5deal-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` in the project root:
   ```bash
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/n5deal-marketplace
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/n5deal-marketplace

   # Node Environment
   NODE_ENV=development

   # Authentication Secret (generate with: openssl rand -base64 32)
   AUTH_SECRET=your-secret-key-here
   ```

4. **Seed the database**
   ```bash
   npm run db:seed
   ```
   This creates demo users, assets, and messages.

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed database with demo data

---

## Production Build

### Build Verification

```bash
# TypeScript compilation check
npx tsc --noEmit

# Production build
npm run build
```

Both commands should complete without errors. The build generates 28 routes total (20 page routes + 8 API route handlers serving 15 API endpoints).

### Build Output
- Static pages pre-rendered at build time
- Dynamic API routes generated
- Optimized JavaScript bundles
- CSS extracted and minified

---

## Technical Decisions

### Why Next.js + TypeScript?
- **Full-stack in one framework** - Simplified development with unified React frontend and API backend
- **Type safety** - TypeScript catches errors at compile time, improving code quality
- **App Router** - Modern Next.js architecture with server components and streaming
- **API Routes** - Built-in backend without separate server setup
- **Deployment-ready** - Optimized for Vercel but deployable anywhere

### Why MongoDB + Mongoose?
- **Flexible schema** - Marketplace data varies by asset type; document model fits naturally
- **Rapid prototyping** - Quick iteration on data models without migrations
- **Mongoose validation** - Schema-level validation and type safety
- **Indexing** - Optimized queries for search/filter operations
- **Embedded relationships** - Denormalized data (e.g., investment range) improves read performance

### Why Server-Side Authorization?
- **Security first** - Client-side checks are UX only; server enforces all rules
- **Centralized logic** - `requireRole()` helper used across all protected endpoints
- **Database verification** - Each request checks user still exists and is ACTIVE
- **Ownership validation** - Sellers can only modify their own assets

### Why HTTP-Only Cookies?
- **XSS protection** - JavaScript cannot access session tokens
- **Automatic transmission** - Browser sends cookie with every request
- **Secure by default** - Secure flag in production prevents transmission over HTTP

### Why URL-Synchronized State?
- **Shareable searches** - Users can bookmark or share filtered marketplace views
- **Browser navigation** - Back/forward buttons work intuitively
- **Refresh persistence** - Search state survives page reload
- **No state management library** - URL is the source of truth

### Why Service Layer?
- **Testable business logic** - Services can be unit tested independently
- **Reusable operations** - Same service methods used by multiple API routes
- **Separation of concerns** - API routes handle HTTP, services handle business rules
- **Consistent validation** - Centralized validation logic

---

## Product & UX Decisions

### Role-Specific Dashboards
Each role sees a tailored experience focused on their primary workflows:
- **Buyers** - Quick access to marketplace, messages, and profile
- **Sellers** - Emphasis on listings, buyer directory, and messages
- **Managers** - Platform-wide visibility with moderation tools

### Clear State Feedback
- **Loading states** - Spinners during data fetching
- **Empty states** - Helpful messages with suggested actions
- **Error states** - User-friendly error messages (no stack traces)
- **Success feedback** - Confirmation alerts after actions
- **Disabled states** - Buttons disabled during submission to prevent duplicates

### Confirmation Dialogs
Destructive actions (suspend user, suspend asset) require explicit confirmation to prevent accidental moderation.

### Debounced Search
Search inputs wait 400ms after typing stops before querying, reducing unnecessary API calls and improving performance.

### Filter Chips
Active filters displayed as removable chips provide clear visibility into current search state and easy one-click removal.

### Optional Asset Reference
When sellers contact buyers, they can optionally reference one of their own assets, providing context for the outreach.

### Defensive Null Handling
Message components gracefully handle missing populated references (e.g., deleted users) with fallback text like "Unknown".

### No Fake Analytics
Dashboard metrics show real counts from the database rather than placeholder numbers.

### Pagination Controls
Simple Previous/Next buttons with current page indicator—no complex pagination UI needed for demo scale.

---

## Assumptions

This prototype was built with several reasonable assumptions given the assignment's open-ended nature:

### Scope Assumptions
- **Prototype, not production** - Focus on demonstrating working flows rather than production-scale infrastructure
- **Demo data** - Marketplace contains sample data for evaluation purposes
- **Internal messaging** - Communication happens within the platform (no external email integration)
- **Status-based moderation** - Managers suspend/activate rather than permanently delete
- **No payment processing** - Marketplace facilitates discovery and communication, not transactions
- **No legal workflows** - No M&A due diligence, contracts, or compliance processes
- **No real-time features** - No WebSocket notifications or live updates

### Product Assumptions
- **Buyer profiles are visible to sellers** - Enables seller outreach to potential investors
- **Asset references are optional** - Messages can be sent with or without asset context
- **Managers cannot message** - Platform administrators focus on moderation, not deal-making
- **Suspended users cannot log in** - Status check happens on every request
- **Search is case-insensitive** - Improves discoverability
- **Filters are additive** - Multiple filters narrow results (AND logic)

### Technical Assumptions
- **MongoDB available** - Local or Atlas instance required
- **Environment variables configured** - `.env.local` must be set up
- **Demo password acceptable** - All demo accounts use `Demo123!` for easy evaluation
- **HTTP-only cookies sufficient** - No need for refresh tokens at demo scale
- **Client-side filtering acceptable** - Some operations (e.g., seller listings) filter after fetch
- **No CDN required** - Static assets served directly by Next.js

---

## AI Development Tools

This project was developed with **AI-assisted development** using tools like Windsurf/Cascade and Claude.

### How AI Was Used

**Implementation Assistance**:
- Generating boilerplate code for API routes, services, and components
- Creating consistent UI patterns across buyer/seller/manager dashboards
- Implementing search/filter functionality with URL state management
- Building responsive layouts and navigation components

**Architecture & Design**:
- Structuring the service layer and separation of concerns
- Designing the authorization strategy and RBAC helpers
- Planning the data model and Mongoose schemas
- Organizing the component hierarchy

**Debugging & Validation**:
- Identifying type mismatches (ObjectId vs string comparisons)
- Catching missing fields in API responses
- Reviewing security patterns and authorization logic
- Performing integration audits to find runtime issues

**Code Quality**:
- Ensuring consistent error handling patterns
- Implementing defensive null checks
- Maintaining TypeScript type safety
- Following Next.js and React best practices

### Developer Oversight

While AI accelerated development significantly, **all code was reviewed, tested, and validated by the developer**:
- Manual end-to-end testing of all user flows
- TypeScript compilation verification
- Production build validation
- Security review of authentication and authorization
- Integration testing across buyer/seller/manager roles
- Bug fixes for discovered issues (e.g., ObjectId comparison bugs, missing email field)

AI was a **productivity multiplier**, not a replacement for engineering judgment.

---

## Testing & Verification

### Automated Verification
- ✅ **TypeScript Compilation** - `npx tsc --noEmit` passes without errors
- ✅ **Production Build** - `npm run build` succeeds, generates all 28 routes

### Manual Testing
The following flows were manually verified:

**Buyer Flow**:
- ✅ Login with buyer credentials
- ✅ Update profile with investment preferences
- ✅ Browse marketplace and filter assets
- ✅ View asset details
- ✅ Send message to seller
- ✅ View sent message in outbox
- ✅ Receive message from seller in inbox
- ✅ Mark message as read

**Seller Flow**:
- ✅ Login with seller credentials
- ✅ Create new asset listing
- ✅ View asset in seller listings dashboard
- ✅ Browse buyer directory and filter buyers
- ✅ Send message to buyer with asset reference
- ✅ View sent message in outbox
- ✅ Receive message from buyer in inbox

**Manager Flow**:
- ✅ Login with manager credentials
- ✅ View platform dashboard with metrics
- ✅ Search and filter users
- ✅ View user detail page
- ✅ Suspend and reactivate user
- ✅ Search and filter assets
- ✅ View asset detail page
- ✅ Suspend and reactivate asset

**Cross-Role Verification**:
- ✅ Suspended users cannot log in
- ✅ Suspended assets hidden from marketplace
- ✅ Buyer cannot access seller pages
- ✅ Seller cannot access buyer pages
- ✅ Manager cannot send messages
- ✅ URL state persists on refresh
- ✅ Browser back/forward works correctly

### Known Test Gaps
- ❌ No automated E2E tests (Playwright, Cypress)
- ❌ No unit tests for services
- ❌ No API integration tests
- ❌ No component tests (React Testing Library)

Manual testing was sufficient for the assignment scope, but automated tests would be essential for production.

---

## Known Limitations

### Scale Limitations
- **Demo dataset** - 5 buyers, 5 sellers, 12 assets (not production scale)
- **Client-side filtering** - Some operations filter after fetching (e.g., seller listings by owner)
- **Limited query optimization** - Basic indexes exist but not tuned for production scale
- **No caching** - Every page load fetches fresh data
- **No rate limiting** - APIs unprotected from abuse

### Feature Limitations
- **No message replies** - Each message is standalone (no threading)
- **No message deletion** - Messages persist indefinitely
- **No asset editing** - Assets can only be suspended, not updated
- **No user registration** - Demo accounts only (no signup flow)
- **No password reset** - Demo accounts use fixed password
- **No email notifications** - No external communication
- **No file uploads** - No asset images or documents
- **No favorites/watchlist** - No saved searches or bookmarks
- **No analytics** - Basic counts only, no charts or trends

### Technical Limitations
- **No automated tests** - Manual testing only
- **No error monitoring** - No Sentry or similar
- **No logging** - Console logs only
- **No CI/CD** - Manual deployment
- **No staging environment** - Development and production only

These limitations are **intentional** for a prototype assignment and do not indicate bugs or incomplete work.

---

## What I Would Improve With More Time

### Engineering Improvements

**Testing Infrastructure**:
- Automated E2E tests with Playwright covering all user flows
- Unit tests for service layer business logic
- API integration tests for all endpoints
- Component tests with React Testing Library
- Test coverage reporting

**Performance Optimization**:
- Dedicated API endpoints for filtered queries (avoid client-side filtering)
- Database query optimization and compound indexes
- Response caching with Redis or similar
- Pagination improvements (cursor-based for large datasets)
- Image optimization and CDN for asset photos

**Code Quality**:
- Centralized API response types (eliminate `any` types)
- Zod or Yup for request validation
- Consistent error handling with custom error classes
- API documentation with OpenAPI/Swagger
- Storybook for component documentation

**Observability**:
- Structured logging with Winston or Pino
- Error monitoring with Sentry
- Performance monitoring with New Relic or similar
- Database query monitoring
- API metrics and alerting

### Product Improvements

**Discovery & Matching**:
- Smart buyer-seller matching based on investment profiles
- Recommended assets for buyers based on preferences
- Trending assets and popular searches
- Saved searches with email alerts
- Favorites/watchlist functionality

**Communication**:
- Message threading and replies
- Rich text editor for messages
- File attachments (pitch decks, financials)
- Read receipts and typing indicators
- Email notifications for new messages

**Asset Management**:
- Edit asset details after creation
- Asset photos and gallery
- Document attachments (NDAs, financials)
- Asset status history
- Draft assets (save before publishing)

**User Experience**:
- Advanced search with boolean operators
- Bulk actions for managers
- Export data to CSV
- Dark mode support
- Keyboard shortcuts

### Platform Improvements

**Moderation & Compliance**:
- Moderation audit logs
- Automated content moderation (profanity, spam)
- User reporting system
- Manager notes on users/assets
- Suspension reason tracking
- Appeal workflow

**Analytics & Insights**:
- Platform dashboard with charts
- User activity tracking
- Asset performance metrics
- Search analytics
- Conversion funnel analysis

**Security Enhancements**:
- Two-factor authentication
- Password strength requirements
- Rate limiting per user/IP
- CSRF protection
- Security headers (CSP, HSTS)
- Audit logs for sensitive actions

### Production Readiness

**Infrastructure**:
- CI/CD pipeline (GitHub Actions, CircleCI)
- Staging environment
- Database backups and disaster recovery
- Load balancing and horizontal scaling
- CDN for static assets
- Environment-specific configurations

**Deployment**:
- Docker containerization
- Kubernetes orchestration
- Blue-green deployments
- Automated rollbacks
- Health checks and monitoring

**Compliance**:
- GDPR compliance (data export, deletion)
- Privacy policy and terms of service
- Cookie consent management
- Data retention policies
- Security audit trail

---

## Assignment Scope

This project was developed as a **24-hour technical assignment** to demonstrate full-stack development capabilities. The focus was on:

✅ **Working product flows** - All core buyer, seller, and manager journeys are functional  
✅ **Clean architecture** - Separation of concerns with service layer and RBAC  
✅ **Type safety** - Strict TypeScript throughout  
✅ **Persistent data** - MongoDB with proper schemas and relationships  
✅ **Security** - Server-side authorization and secure authentication  
✅ **Professional UX** - Responsive design, clear states, and thoughtful interactions  

The assignment explicitly stated that the goal is **not** to build a production-ready M&A platform, but to demonstrate:
- Technical competence across the full stack
- Product thinking and user flow design
- Code organization and architecture
- Ability to deliver working software quickly

**Not every possible feature was implemented** because the assignment prioritizes depth over breadth—showing mastery of core concepts rather than superficial coverage of every edge case.

---

## License

This project was created as a technical assignment and is not licensed for commercial use.

---

## Contact

For questions about this technical assignment, please contact the repository owner.
