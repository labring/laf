# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

laf is an open-source serverless cloud development platform that provides cloud functions, cloud databases, and cloud storage out of the box. It enables developers to focus on business development without worrying about server management.

The platform consists of:

- **Web IDE**: Browser-based development environment for writing cloud functions
- **Cloud Functions**: Serverless function execution (Node.js/Python)
- **Cloud Database**: MongoDB-based database with access control
- **Cloud Storage**: S3-compatible object storage (MinIO)
- **Website Hosting**: Static site deployment

## Repository Structure

This is a monorepo managed by Lerna. Key workspaces:

### Core Services

- **`server/`** - NestJS-based API server that manages the entire laf platform

  - Handles auth, applications, functions, database, storage, logs, billing, domains, certificates, and metrics
  - Uses MongoDB for system database
  - Runs on port 3000

- **`runtimes/nodejs/`** - Node.js runtime engine that executes user cloud functions

  - Express-based runtime that executes cloud functions
  - Provides database access proxy
  - Includes TypeScript language server for IDE support
  - Each application instance runs its own runtime pod in Kubernetes

- **`web/`** - React-based web console UI
  - Built with Vite, React 18, Chakra UI, TailwindCSS
  - Monaco editor integration for code editing
  - Uses React Query for state management and Zustand for local state
  - Runs on port 3001 (dev)

### Packages

- **`packages/client-sdk/`** - Client SDK for accessing laf from frontend applications
- **`packages/cloud-sdk/`** (`@lafjs/cloud`) - SDK provided to cloud functions at runtime
- **`packages/database-proxy/`** - Database access layer with ACL support (MongoDB/MySQL)
- **`packages/database-ql/`** - Query language abstraction
- **`packages/node-modules-utils/`** - Utilities for managing npm dependencies
- **`packages/eslint-config-laf/`** - Shared ESLint configuration

### Other

- **`cli/`** - Command-line tool for laf
- **`e2e/`** - End-to-end tests using Jest
- **`docs/`** - VitePress documentation
- **`deploy/`** - Kubernetes deployment manifests
- **`services/runtime-exporter/`** - Prometheus exporter for runtime metrics

## Development Commands

### Root Level (Monorepo)

```bash
# Install all dependencies across workspaces
npm install
# Or with lerna
lerna exec npm install --parallel

# Build all packages
npm run build
# Or
lerna run build --parallel

# Lint all packages
npm run lint
# Or
lerna run lint --parallel

# Run lint-staged (pre-commit)
npm run lint-staged
```

### Server Development

```bash
cd server/

# Install dependencies
npm install

# Development with watch mode
npm run dev
# Or
npm run watch

# Build
npm run build

# Start production
npm run start:prod

# Run tests
npm test
npm run test:watch
npm run test:cov
npm run test:e2e

# Lint
npm run lint
```

**Local development with Telepresence** (connects to Kubernetes cluster):

```bash
cd server/

# Install traffic manager
telepresence helm install

# Connect to cluster
telepresence connect -n laf-system

# Intercept traffic (creates .env file)
telepresence intercept laf-server -p 3000:3000 -e $(pwd)/.env

# Start dev server
npm run dev

# Clean up
telepresence leave laf-server
```

### Web Development

```bash
cd web/

# Install dependencies (uses pnpm or npm)
npm install
# Or
pnpm install

# Development server
npm run dev

# Build for production
npm run build

# Type check
npm run tsc

# Preview production build
npm run preview

# Lint
npm run lint
```

### Runtime Development

```bash
cd runtimes/nodejs/

# Install and build
npm install
npm run build

# Development
npm run dev
npm run watch

# Start
npm start

# Lint
npm run lint
```

**Local development with Telepresence**:

```bash
cd runtimes/nodejs/

# Connect to cluster
telepresence connect -n laf-system

# Set your test app ID
export appid=your-app-id

# Intercept app traffic
telepresence intercept $appid -p 8000:8000 -e $(pwd)/.env

# Start runtime
npm run build
npm start

# Clean up
telepresence leave $appid
```

### Package Development

```bash
# Example: database-proxy
cd packages/database-proxy/

npm install
npm run build
npm run watch  # Watch mode
npm test       # Run tests
npm run lint
```

### E2E Tests

```bash
cd e2e/

# Run all tests
npm test

# Or use the shell script
./e2e.sh
```

### CLI Development

```bash
cd cli/

npm install
npm run build
npm run watch

# Use locally
node dist/main.js
```

## Architecture Overview

### Request Flow

1. User accesses web console (`web/`) to manage applications and write functions
2. Web console communicates with API server (`server/`) via REST APIs
3. API server manages Kubernetes resources to create application instances
4. Each application gets its own runtime pod (`runtimes/nodejs/`)
5. Runtime pods execute user-defined cloud functions
6. Cloud functions use `cloud-sdk` to access database (via `database-proxy`) and storage

### Key Architecture Patterns

**Serverless Isolation**: Each laf application runs in its own Kubernetes pod with isolated resources, database credentials, and storage buckets.

**Database Access Control**: The `database-proxy` package provides MongoDB/MySQL access with ACL rules. Cloud functions don't connect directly to databases; they use the proxy with permission validation.

**Function Execution**: Cloud functions are TypeScript/JavaScript code stored in MongoDB. The runtime loads function code dynamically and executes it in isolated contexts with injected globals (`cloud`, `fetch`, etc.).

**WebIDE Integration**: Monaco editor in web console connects to TypeScript language server running in the runtime pod via WebSocket for IntelliSense and type checking.

### Technology Stack

**Backend**:

- NestJS 9 (server)
- Express 4 (runtime)
- MongoDB 5 (database)
- Kubernetes client-node
- Passport JWT (authentication)

**Frontend**:

- React 18
- Chakra UI + TailwindCSS
- Monaco Editor
- React Query (TanStack Query)
- Zustand + Immer (state management)
- i18next (internationalization)
- Vite 4

**Infrastructure**:

- Kubernetes (orchestration)
- MinIO (object storage)
- Telepresence (local development)

## Important Conventions

### Code Organization

- Server uses NestJS modules - each feature has its own module in `server/src/`
- Runtime handlers are in `runtimes/nodejs/src/handler/`
- Web pages follow feature-based organization in `web/src/pages/`
- Shared types and utilities should go in appropriate packages

### TypeScript

- All packages use TypeScript
- Server uses TypeScript 4.9
- Web and newer packages use TypeScript 5.0
- Build target varies by package (check individual `tsconfig.json`)

### Testing

- Server uses Jest with NestJS testing utilities
- E2E tests use Jest with custom sequencer for test ordering
- Package tests use Mocha
- Test files use `*.spec.ts` (server) or `*test.js` (packages)

### Linting

- Shared ESLint config in `packages/eslint-config-laf/`
- Husky pre-commit hooks run lint-staged
- Run `npm run lint` to fix issues automatically

### Building

- Most packages require `npm run build` before use
- Lerna can build all packages in parallel
- Runtime requires build before starting
- Web uses Vite for hot module replacement in dev

## Working with the Codebase

### Adding a New API Endpoint

1. Create or modify a controller in `server/src/{module}/`
2. Add DTOs with class-validator decorators
3. Add Swagger decorators for API documentation
4. Update module's service and inject dependencies
5. Add authentication guards if needed (`@UseGuards(JwtAuthGuard)`)
6. Test endpoint manually or add e2e tests in `e2e/`

### Adding a New Cloud Function API

1. Add handler in `runtimes/nodejs/src/handler/`
2. Export from cloud-sdk (`packages/cloud-sdk/src/`)
3. Update TypeScript definitions for IDE autocomplete
4. Rebuild cloud-sdk and runtime

### Modifying Database Access Rules

1. Edit policies in `packages/database-proxy/src/`
2. Database proxy validates all database operations against ACL rules
3. Rules are defined per-application in the application's configuration

### Adding Web UI Features

1. Create components in `web/src/components/` or `web/src/pages/`
2. Use Chakra UI components for consistency
3. Add API calls using axios and React Query
4. Use Zustand stores for global state (`web/src/pages/{page}/store.ts`)
5. Add i18n strings in `web/public/locales/`

## Deployment

The project deploys to Kubernetes. See `deploy/README.md` for deployment instructions.

## Prerequisites for Development

- Node.js 18+ (runtime requires >=18.0.0)
- Kubernetes cluster (for local development with Telepresence)
- Telepresence CLI (for local development that connects to cluster)
- MongoDB (for system database)
- MinIO or S3-compatible storage

## Common Issues

**Telepresence intercept fails**: Ensure you're connected to the cluster and the target pod exists in the namespace.

**Runtime crashes on start**: Check that all environment variables in `.env` are set correctly (created by telepresence intercept).

**Web build fails with memory error**: Use `--max_old_space_size=32768` flag (already in package.json build script).

**Type errors in web/**: Run `npm run tsc` first to check types, Monaco editor requires proper TypeScript setup.

**Lerna command not found**: Install lerna globally or use npx: `npx lerna <command>`.
