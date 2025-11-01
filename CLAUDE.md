# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
pnpm install          # Install dependencies
pnpm run build        # Build the library (outputs to dist/)
pnpm run build:watch  # Build in watch mode
```

### Quality Checks

```bash
pnpm run validate     # Run all checks (lint, typecheck, test, format)
pnpm run lint         # Run Biome linter
pnpm run typecheck    # TypeScript type checking
pnpm run test         # Run Vitest tests
pnpm run format       # Check Prettier formatting
pnpm run format:fix   # Fix Prettier formatting
```

### Release

This project uses **release-please** for automated versioning and npm publishing.

**IMPORTANT**: Always use Conventional Commits format for commit messages:

- `feat: description` - minor version bump (0.5.0 → 0.6.0)
- `fix: description` - patch version bump (0.5.0 → 0.5.1)
- `feat!: description` - major version bump (0.5.0 → 1.0.0)
- `chore:`, `docs:`, `test:`, `refactor:` - no version bump

**Release Workflow**:

1. Develop and commit using Conventional Commits
2. Create Pull Request
3. Merge PR using "Create a merge commit" (not squash merge)
4. release-please creates Release PR automatically
5. Review Release PR (version bump and CHANGELOG.md)
6. Merge Release PR - triggers automatic:
   - GitHub Release creation
   - npm publish with OIDC provenance (no secrets required)

**npm Trusted Publishing (OIDC)**:

This package uses npm trusted publishing with OIDC for secure publishing:

- No `NPM_TOKEN` secrets required
- Cryptographic proof of package origin
- Verifiable build attestation on npm package page

### Testing Individual Files

```bash
pnpm vitest src/parsers.test.ts  # Run specific test file
pnpm vitest --watch              # Run tests in watch mode
```

## Architecture

### Library Purpose

Zodix is a TypeScript library providing Zod utilities for Remix applications. It simplifies parsing and validation of FormData and URLSearchParams in Remix loaders and actions while maintaining type safety.

### Core API Design

The library provides two API styles:

1. **Throwing functions** (`parseParams`, `parseForm`, `parseQuery`) - Throw 400 Response on validation failure for Remix CatchBoundary
2. **Safe functions** (`parseParamsSafe`, `parseFormSafe`, `parseQuerySafe`) - Return success/error objects for custom error handling

### Module Structure

```
src/
├── index.ts      # Main exports with zx namespace
├── parsers.ts    # Core parsing functions (FormData, URLSearchParams, Params)
├── schemas.ts    # Helper Zod schemas (BoolAsString, CheckboxAsString, IntAsString, NumAsString)
└── errors.ts     # Error handling utilities
```

### Key Implementation Details

- **Dual module format**: Outputs both ESM (dist/index.js) and CommonJS (dist/index.cjs)
- **Pure ESM package**: Uses `"type": "module"` in package.json
- **Zod compatibility**: Supports both Zod v3 and v4 as peer dependency
- **Schema flexibility**: Accepts both Zod object shapes and full Zod schemas
- **Custom parsers**: Supports custom URLSearchParams parser functions for non-standard query strings

### Testing Approach

- Unit tests use Vitest with global test functions enabled
- Tests cover all parsing functions, helper schemas, and error cases
- Type-level testing ensures API type correctness
- Test files are colocated with source files (\*.test.ts)

### Build Configuration

- **tsup**: Primary bundler for library output with TypeScript declarations
- **TypeScript**: Strict mode enabled with Node20 module resolution
- **Biome**: Linting with Git integration and recommended rules (noExplicitAny disabled)
- **Target**: Node.js 20+ with ES2022 features
