# LexAI - AI Legal Intelligence Platform

## Overview

LexAI is a full-stack web application that provides AI-powered legal assistance and document analysis. The platform offers both free and premium tiers, featuring real-time chat with AI legal assistants, document analysis capabilities, and comprehensive usage tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with custom design system
- **Component Library**: shadcn/ui with Radix UI primitives
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket support for real-time features
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)

### Authentication & Authorization
- Currently using demo user system
- Designed for future integration with proper authentication providers
- Session-based approach with user identification

## Key Components

### 1. AI Service Layer
- **Dual AI Provider Support**: OpenAI (premium) and OpenRouter (free tier)
- **Model Configuration**: GPT-4o for premium users, Mistral Small for free users
- **Legal Specialization**: Custom legal prompts and context handling
- **Response Processing**: Structured AI responses with metadata tracking

### 2. Database Schema
- **Users**: User profile and authentication data
- **Usage Tracking**: Monthly/yearly usage limits with plan-based restrictions
- **Conversations**: Chat history with categorization and metadata
- **Messages**: Individual chat messages with role-based structure
- **Document Analyses**: File upload and analysis results storage

### 3. Real-time Communication
- **WebSocket Integration**: Real-time chat updates and notifications
- **Connection Management**: Automatic reconnection and error handling
- **Message Streaming**: Live AI response streaming for better UX

### 4. Usage Tracking System
- **Plan-based Limits**: Free (50 questions/month) vs Premium (150 questions/month)
- **Real-time Monitoring**: Live usage updates and limit enforcement
- **Billing Integration**: Prepared for Stripe payment processing

### 5. Document Processing
- **File Upload**: Drag-and-drop interface with validation
- **Analysis Pipeline**: AI-powered document analysis and summarization
- **Result Storage**: Persistent storage of analysis results

## Data Flow

1. **User Interaction**: Frontend sends requests through React Query
2. **API Processing**: Express server validates and processes requests
3. **AI Integration**: Routes to appropriate AI service based on user plan
4. **Database Operations**: Drizzle ORM handles all database interactions
5. **Real-time Updates**: WebSocket connections push live updates
6. **Response Delivery**: Structured responses returned to frontend

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **OpenAI SDK**: Premium AI model integration
- **Stripe**: Payment processing (configured but not fully implemented)
- **WebSocket (ws)**: Real-time communication
- **Drizzle ORM**: Type-safe database operations

### UI/UX Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **React Hook Form**: Form state management

### Development Dependencies
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Production bundling for server code

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with HMR
- **Type Checking**: Real-time TypeScript validation
- **Database**: Development connection to Neon PostgreSQL

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Assets**: Served through Express in production mode
- **Environment Variables**: DATABASE_URL, API keys for AI services

### Database Management
- **Migrations**: Drizzle Kit handles schema migrations
- **Schema Sharing**: Shared schema definitions between client and server
- **Connection Pooling**: Neon serverless with connection pooling

The architecture prioritizes type safety, developer experience, and scalability while maintaining clear separation of concerns between frontend, backend, and external services.