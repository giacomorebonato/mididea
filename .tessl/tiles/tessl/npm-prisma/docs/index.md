# Prisma CLI

Prisma CLI is a next-generation ORM toolkit that provides comprehensive database management, client generation, and development workflow capabilities. It includes type-safe query builder, declarative migrations, and GUI database management with support for multiple database systems including PostgreSQL, MySQL, SQLite, SQL Server, MongoDB, and CockroachDB.

## Package Information

- **Package Name**: prisma
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install prisma`
- **Requirements**: Node.js >=18.18

## Core Imports

The Prisma CLI is primarily accessed via command line interface, but also exports types for configuration:

```typescript
import { PrismaConfig } from "prisma";
```

For configuration utilities:

```typescript
import { PrismaConfig } from "prisma/config";
```

ESM import:
```typescript
import { PrismaConfig } from "prisma";
```

CommonJS require:
```javascript
const { PrismaConfig } = require("prisma");
```

## Basic Usage

```bash
# Initialize new project
npx prisma init

# Start local development server
npx prisma dev

# Generate Prisma Client after schema changes
npx prisma generate

# Push schema changes to database
npx prisma db push

# Create and apply migrations
npx prisma migrate dev --name init

# Launch database GUI
npx prisma studio

# Format schema file
npx prisma format

# Display debug information
npx prisma debug

# Show telemetry information
npx prisma telemetry
```

With TypeScript configuration:

```typescript
// schema.prisma example
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

## Architecture

Prisma CLI is built around several key components:

- **Core Commands**: Essential operations like generate, migrate, db operations, debug, telemetry
- **Platform Integration**: Authentication, workspace, and project management for Prisma Platform
- **Migration System**: Declarative schema migration with dev and deploy workflows
- **Studio**: Web-based GUI for database visualization and editing
- **MCP Server**: Model Context Protocol server for AI development tools integration
- **Dynamic Extensions**: On-demand loading of specialized CLI packages
- **External Packages**: Integration with external CLI packages like `@prisma/cli-init`, `@prisma/cli-security-rules`
- **Type Exports**: Provides TypeScript configuration types via `PrismaConfig` from `@prisma/config`

## Capabilities

### Client Generation

Generate type-safe Prisma Client from schema definitions with support for multiple generators and custom output options.

```bash { .api }
prisma generate [options]

Options:
  --schema <path>          Custom schema file path
  --sql                    Generate typed SQL module  
  --watch                  Watch mode for continuous generation
  --generator <name>       Target specific generator
  --no-engine             Generate for Accelerate only
  --no-hints              Hide hint messages
  --allow-no-models       Allow schemas without models
  --require-models        Require models in schema
```

[Client Generation](./client-generation.md)

### Database Operations

Direct database operations including schema synchronization, raw query execution, and database introspection.

```bash { .api }
prisma db <command> [options]

Commands:
  pull                     Pull schema from database
  push                     Push schema changes to database  
  execute                  Execute raw SQL queries
  seed                     Run database seeding
```

[Database Operations](./database-operations.md)

### Migration Management

Declarative data modeling and migration system with development and production workflows.

```bash { .api }
prisma migrate <command> [options]

Commands:
  dev                      Development migrations with auto-generation
  deploy                   Deploy pending migrations to production
  status                   Check migration status
  resolve                  Mark failed migrations as resolved
  reset                    Reset database and apply all migrations
  diff                     Generate migration diffs between states
```

[Migration Management](./migration-management.md)

### Studio Interface

Web-based GUI for database visualization, data editing, and relationship exploration with real-time updates.

```bash { .api }
prisma studio [options]

Options:
  --port/-p <number>       Custom port (default: 5555-5600 range)
  --browser/-b <browser>   Browser selection
  --hostname/-n <host>     Hostname binding  
  --schema <path>          Schema file path
```

[Studio Interface](./studio-interface.md)

### Platform Integration

Authentication and project management for Prisma Platform services including Pulse, Accelerate, and workspace management.

```bash { .api }
prisma platform <command> [options]

Commands:
  auth                     Authentication management
  workspace               Workspace operations
  environment             Environment management
  project                 Project operations
  serviceToken            Service token management
  pulse                   Real-time event streaming
  accelerate              Connection pooling and caching
```

[Platform Integration](./platform-integration.md)

### MCP Server

Model Context Protocol server for AI development tools integration, providing structured access to Prisma operations.

```bash { .api }
prisma mcp [options]

Options:
  --early-access          Enable early access features

MCP Tools:
  migrate-status          Check migration status
  migrate-dev            Run development migrations
  migrate-reset          Reset database (with --force)
  Prisma-Studio          Launch Studio interface
```

[MCP Server](./mcp-server.md)

### Schema Management

Schema validation, formatting, and development utilities for maintaining clean and valid Prisma schema files.

```bash { .api }
prisma format [options]
prisma validate [options]

Format Options:
  --schema <path>         Schema file path
  --check                 Check formatting without modifying

Validate Options:  
  --schema <path>         Schema file path
  --config <path>         Configuration file path
```

[Schema Management](./schema-management.md)

### Project Initialization

Set up a new Prisma project with schema files, configuration, and development environment.

```bash { .api }
prisma init [options]

Options:
  --datasource-provider <provider>  Database provider (postgresql, mysql, sqlite, sqlserver, mongodb, cockroachdb)
  --url <url>                      Database connection URL
  --help/-h                        Show help information
```

**Note**: This command is provided by the external package `@prisma/cli-init`.

### Development Server

Start a local Prisma Postgres server for development with automatic schema synchronization.

```bash { .api }
prisma dev [options]

Options:
  --help/-h                        Show help information
```

**Note**: This command provides local development database capabilities.

### Debug Information

Display comprehensive debugging information including environment variables, paths, and configuration details.

```bash { .api }
prisma debug [options]

Options:
  --schema <path>                  Custom path to Prisma schema file
  --config <path>                  Custom path to configuration file
  --help/-h                        Show help information
```

### Telemetry Information

Display telemetry cache information and project identifiers for debugging telemetry issues.

```bash { .api }
prisma telemetry [options]

Options:
  --schema <path>                  Custom path to Prisma schema file
```

## Global Options

```bash { .api }
Global Options:
  --help/-h               Show help information
  --version/-v            Show version information
  --config <path>         Configuration file path
  --json                  JSON output format (for version)
  --experimental          Enable experimental features  
  --preview-feature       Enable preview features
  --early-access          Enable early access features
  --telemetry-information Telemetry configuration
```

## Types

```typescript { .api }
// Configuration type from @prisma/config
export type { PrismaConfig } from '@prisma/config';

// Command interface (internal)
interface Command {
  parse(argv: string[], config: PrismaConfigInternal): Promise<string | Error>;
  help(error?: string): string;
}

// CLI global arguments
interface GlobalArgs {
  '--help'?: boolean;
  '--version'?: boolean;
  '--config'?: string;
  '--json'?: boolean;
  '--experimental'?: boolean;
  '--preview-feature'?: boolean;
  '--early-access'?: boolean;
  '--telemetry-information'?: string;
}
```