# Smart Village Connect - replit.md

## Overview

Smart Village Connect is a comprehensive people management system designed to track village residents' locations, activities, and maintain community connections regardless of where people are located (village, cities, or abroad). The application is built as a full-stack web application with a React frontend and Express.js backend, using PostgreSQL for data persistence and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend, backend, and database layers:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit Auth with OpenID Connect
- **Database ORM**: Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with JSON responses

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Connection pooling via Neon serverless driver

## Key Components

### Authentication System
- Uses Replit's OpenID Connect authentication
- Session-based authentication with PostgreSQL session storage
- Role-based access control (admin/user roles)
- Mandatory user and session tables for Replit Auth compatibility

### Resident Management System
- Complete CRUD operations for resident profiles
- Location tracking (village, city, abroad)
- Occupation and employment details
- Privacy controls for profile visibility
- Filtering and search capabilities

### Analytics Dashboard
- Location distribution statistics
- Occupation breakdown analytics
- Real-time resident counts and demographics
- Visual charts using Recharts library

### Admin Panel
- User management capabilities
- Role assignment functionality
- System-wide administration tools

## Data Flow

1. **Authentication Flow**:
   - User initiates login through Replit Auth
   - OpenID Connect handles authentication
   - Session created and stored in PostgreSQL
   - User profile synchronized with local database

2. **Resident Data Flow**:
   - Frontend forms collect resident information
   - Validation using Zod schemas
   - API endpoints process CRUD operations
   - Drizzle ORM manages database interactions
   - Real-time updates via TanStack Query

3. **Analytics Flow**:
   - Backend aggregates data from residents table
   - Statistics computed on-demand
   - Charts rendered on frontend using processed data

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components foundation
- **openid-client**: OpenID Connect authentication
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Production build bundling
- **vite**: Development server and frontend bundling

### UI Dependencies
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components
- **recharts**: Chart visualization library
- **lucide-react**: Icon library

## Deployment Strategy

### Development Environment
- Vite development server for frontend hot reloading
- TSX for backend TypeScript execution
- Integrated development experience in Replit environment

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: ESBuild bundles server code into single file
- Static assets served from Express in production
- Environment-aware configuration handling

### Database Management
- Drizzle Kit handles schema migrations
- Environment-based database URL configuration
- Automatic table creation for sessions and users

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OpenID Connect issuer endpoint
- `REPLIT_DOMAINS`: Allowed domains for authentication

The application is designed to be deployment-ready on Replit with minimal configuration, leveraging Replit's built-in database provisioning and authentication systems while maintaining the flexibility to deploy elsewhere with appropriate environment variable configuration.