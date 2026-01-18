# Vicband - Victoria's Musician Classifieds Platform

## Overview

Vicband is a classifieds platform designed for Victoria, Australia's music community. It serves as a local hub where musicians can connect with each other, find band members, and buy/sell music equipment. The platform features musician profiles and a marketplace for musical equipment, inspired by Craigslist's functional layout combined with modern platforms like BandMix and Airbnb's card aesthetics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript as the core frontend framework
- Vite for development server and build tooling with HMR support
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and API data fetching

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library with "new-york" style preset
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management
- Custom theme system supporting light/dark modes via React Context

**Design System**
- Mobile-first responsive design with breakpoints at 768px (tablet) and 1024px (desktop)
- Card-based layouts for musician profiles and marketplace listings
- Typography using Inter font family from Google Fonts
- Spacing based on Tailwind's spacing scale (2, 4, 6, 8, 12, 16)
- Custom CSS variables for colors and shadows supporting theme switching

**State Management**
- TanStack Query for server state with infinite stale time and disabled auto-refetching
- React Context for theme preferences (stored in localStorage)
- React Hook Form with Zod validation for form state management
- URL parameters for dashboard tab state and filter persistence

**Key Pages & Features**
- Landing page for unauthenticated users
- Home dashboard for authenticated users
- Musicians directory with filtering and search
- Marketplace directory with filtering and search
- Individual detail pages for musicians and listings
- User dashboard for managing profiles and listings

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server framework
- Node.js with ESM modules
- HTTP server created via Node's `createServer` for potential WebSocket support

**Authentication & Session Management**
- Replit Auth integration using OpenID Connect (OIDC)
- Passport.js for authentication middleware
- Express sessions with PostgreSQL-backed session store (connect-pg-simple)
- Session TTL of 7 days with httpOnly, secure cookies
- User session data includes OIDC claims, access tokens, and refresh tokens

**API Design**
- RESTful API endpoints under `/api` prefix
- Public endpoints for browsing musicians and marketplace listings
- Protected endpoints requiring authentication for user-specific operations
- CRUD operations for musician profiles and marketplace listings
- Request logging middleware tracking method, path, status code, and duration

**Request Processing**
- JSON body parsing with raw body preservation for webhook verification
- URL-encoded form data support
- Custom logging middleware with formatted timestamps
- Authentication middleware (`isAuthenticated`) protecting private routes

### Data Storage

**Database**
- PostgreSQL as the primary relational database
- Drizzle ORM for type-safe database queries and migrations
- Database connection pooling via `pg` library
- Schema-first approach with TypeScript types inferred from Drizzle schema

**Data Models**
- **Users**: Core user table storing OIDC authentication data (email, name, profile image)
- **Musician Profiles**: User-created profiles with instruments, genres, experience level, location, bio, and contact information
- **Marketplace Listings**: Equipment listings with category, condition, price, location, images, and contact details
- **Sessions**: Express session storage table for authentication state

**Schema Design Patterns**
- UUID primary keys generated via PostgreSQL's `gen_random_uuid()`
- Foreign key relationships (profiles/listings → users)
- Array columns for multi-select fields (instruments, genres, image URLs)
- Timestamp columns for creation and update tracking
- Zod schemas generated from Drizzle schemas for runtime validation

**Data Access Layer**
- Storage interface pattern (`IStorage`) abstracting database operations
- `DatabaseStorage` implementation using Drizzle ORM
- Upsert operations for user synchronization with OIDC provider
- Soft filtering capabilities for search and categorization

### External Dependencies

**Third-Party Services**
- **Replit Auth (OIDC)**: Primary authentication provider for user login/registration
- **PostgreSQL Database**: Provisioned database service (URL via `DATABASE_URL` environment variable)

**Key Libraries & Frameworks**
- **React Ecosystem**: React 18, React DOM, TanStack Query
- **Routing**: Wouter (lightweight React router)
- **Forms**: React Hook Form, Hookform Resolvers, Zod for validation
- **UI Components**: Radix UI primitives (40+ component packages)
- **Styling**: Tailwind CSS, Class Variance Authority, clsx, tailwind-merge
- **Database**: Drizzle ORM, Drizzle Zod, pg (PostgreSQL client)
- **Authentication**: Passport.js, OpenID Client, Express Session, connect-pg-simple
- **Backend**: Express, CORS support capability
- **Build Tools**: Vite, esbuild, TypeScript, tsx
- **Development**: Replit-specific Vite plugins (runtime error overlay, cartographer, dev banner)

**Environment Variables Required**
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `REPL_ID`: Replit deployment identifier
- `ISSUER_URL`: OIDC issuer URL (defaults to replit.com/oidc)
- `NODE_ENV`: Environment mode (development/production)

**Build & Deployment**
- Development: `tsx` for TypeScript execution with hot reload
- Production: esbuild bundles server code with select dependencies, Vite builds client
- Server dependencies bundled to reduce syscalls and improve cold start times
- Static file serving from `dist/public` in production