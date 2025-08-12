# ShikshaWallet

## Overview

ShikshaWallet is a mobile-first learner identity wallet application that enables students to store, manage, and share verifiable credentials. The system implements Self-Sovereign Identity (SSI) principles using W3C Verifiable Credentials for secure and trustworthy credential management. The application handles digital student IDs, attendance records, transcripts, and certificates while providing QR code-based sharing and verification capabilities.

The project is built as a full-stack web application with a React frontend and Express.js backend, designed to integrate with India Stack APIs (Aadhaar, DigiLocker, Academic Bank of Credit) and simulate blockchain functionality for credential verification.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API endpoints with structured error handling
- **Credential Management**: W3C Verifiable Credentials format with JWT signatures for proof generation

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Schema**: Structured tables for users, credentials, attendance records, and verification logs
- **Development Storage**: In-memory storage implementation for development and testing

### Authentication & Authorization
- **Authentication Method**: Username/password with JWT tokens
- **Session Management**: Bearer token-based authentication for API requests
- **Role-Based Access**: Admin and student roles with different permission levels
- **Security**: Bcrypt password hashing with configurable salt rounds

### Core Features Implementation
- **Credential Issuance**: Generates W3C-compliant verifiable credentials with digital signatures
- **QR Code Generation**: Creates QR codes for credential sharing and verification
- **Attendance Tracking**: QR code scanning for attendance marking with automatic credential generation
- **Credential Verification**: JWT-based signature verification for credential authenticity
- **Mobile-First Design**: Responsive UI optimized for mobile devices

## External Dependencies

### Database & ORM
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database toolkit with migration support
- **Drizzle Kit**: Database migration and schema management tools

### Authentication & Security
- **bcrypt**: Password hashing library for secure credential storage
- **jsonwebtoken**: JWT token generation and verification
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Frontend Libraries
- **Radix UI**: Accessible component primitives (@radix-ui/react-*)
- **TanStack Query**: Server state management and data fetching
- **React Hook Form**: Form handling with validation support
- **Hookform Resolvers**: Integration between React Hook Form and validation libraries
- **Zod**: TypeScript-first schema validation
- **QRCode**: QR code generation library for credential sharing
- **Wouter**: Lightweight routing library for React

### Styling & Design
- **Tailwind CSS**: Utility-first CSS framework
- **Class Variance Authority**: Component variant management
- **clsx**: Utility for constructing className strings
- **Lucide React**: Icon library for UI components

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **ESBuild**: JavaScript bundler for production builds
- **Replit Plugins**: Development environment integration for Replit platform

### Planned Integrations
- **India Stack APIs**: Aadhaar e-KYC, DigiLocker document retrieval, Academic Bank of Credit
- **Hyperledger Fabric**: Blockchain infrastructure for credential immutability (future implementation)
- **College ERP Systems**: Integration for attendance and academic data synchronization
- **UPI Payment Gateway**: For campus utility payments and transactions