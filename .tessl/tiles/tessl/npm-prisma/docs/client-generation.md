# Client Generation

Generate type-safe Prisma Client from schema definitions with support for multiple generators, watch mode, and specialized output configurations.

## Capabilities

### Generate Command

Creates Prisma Client and other artifacts based on schema configuration with full type safety and customization options.

```bash { .api }
/**
 * Generate Prisma Client and artifacts from schema
 * Reads prisma/schema.prisma by default or custom schema path
 */
prisma generate [options]

Options:
  --schema <path>          Custom schema file path
  --sql                    Generate typed SQL module for direct queries
  --watch                  Watch mode for continuous generation on file changes
  --generator <name>       Target specific generator by name
  --no-engine             Generate for Accelerate only (no local engine)
  --no-hints              Hide promotional hint messages
  --allow-no-models       Allow generation from schemas without models
  --require-models        Require at least one model in schema
  --help/-h               Show generate command help
```

**Usage Examples:**

```bash
# Basic generation from default schema
prisma generate

# Generate with custom schema location
prisma generate --schema ./custom/schema.prisma

# Watch mode for development
prisma generate --watch

# Generate only specific generator
prisma generate --generator client

# Generate with SQL support for typed queries
prisma generate --sql

# Generate for Accelerate deployment (no local engine)  
prisma generate --no-engine
```

### SQL Module Generation

Generate typed SQL module for direct database queries with full type safety and IntelliSense support.

```bash { .api }
/**
 * Generate typed SQL module alongside Prisma Client
 * Creates sql/ directory with typed query functions
 */
prisma generate --sql [options]
```

**Generated SQL Module Usage:**

```typescript
// Generated SQL module provides typed queries
import { sql } from './generated/sql';

// Type-safe raw queries
const users = await sql`
  SELECT id, email, name 
  FROM "User" 
  WHERE active = ${true}
`;

// Introspected query functions
const getUsersByEmail = sql.getUsersByEmail;
const result = await getUsersByEmail('test@example.com');
```

### Watch Mode

Continuous generation with file system watching for development workflows.

```bash { .api }
/**
 * Enable watch mode for continuous generation
 * Monitors schema files and automatically regenerates on changes
 */
prisma generate --watch [options]
```

**Watch Mode Features:**

- Monitors schema file and related files for changes
- Automatic regeneration on file modifications  
- Debounced updates to prevent excessive regeneration
- Console output showing generation status
- Error reporting for failed generations

### Generator Selection

Target specific generators when multiple are configured in the schema.

```bash { .api }
/**
 * Generate artifacts for specific generator only
 * Useful when schema has multiple generator blocks
 */
prisma generate --generator <name> [options]
```

**Usage with Multiple Generators:**

```prisma
// schema.prisma with multiple generators
generator client {
  provider = "prisma-client-js"
  output   = "./generated/client"
}

generator docs {
  provider = "prisma-docs-generator"  
  output   = "./generated/docs"
}
```

```bash
# Generate only client
prisma generate --generator client

# Generate only docs
prisma generate --generator docs
```

### Accelerate Integration

Generate Prisma Client optimized for Prisma Accelerate deployment without local database engines.

```bash { .api }
/**
 * Generate client for Accelerate deployment
 * Excludes binary engines for serverless environments
 */
prisma generate --no-engine [options]
```

**Accelerate Configuration:**

```typescript
// Generated client works with Accelerate connection string
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: process.env.ACCELERATE_URL, // Accelerate connection string
})
```

### Schema Validation Options

Control schema validation behavior during generation process.

```bash { .api }
/**
 * Control model requirements during generation
 */
prisma generate --allow-no-models    # Allow schemas without model definitions
prisma generate --require-models     # Require at least one model (default)
```

**Schema Examples:**

```prisma
// Valid with --allow-no-models
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  
  url      = env("DATABASE_URL")
}

// No models defined - normally fails, allowed with --allow-no-models
```

### Generation Process

The generation process includes several phases:

1. **Schema Parsing**: Validate and parse Prisma schema file
2. **Generator Resolution**: Identify and configure generators
3. **Engine Download**: Download required database engines (unless --no-engine)
4. **Artifact Generation**: Generate client code and other artifacts
5. **Type Generation**: Create TypeScript definitions
6. **File Writing**: Write generated files to output directories

### Error Handling

Common generation errors and solutions:

- **Schema Syntax Errors**: Invalid Prisma schema syntax
- **Generator Conflicts**: Multiple generators with same output path
- **Database Connection**: Issues connecting during introspection
- **Engine Download**: Network issues downloading engines
- **Permission Errors**: File system permission issues
- **Dependency Issues**: Missing generator dependencies

### Integration

Generated Prisma Client integrates with:

- **TypeScript**: Full type safety and IntelliSense
- **Node.js**: Runtime support for server applications
- **Serverless**: Optimized bundles for serverless deployment
- **Edge Runtime**: Compatible with edge computing platforms
- **Build Tools**: Integration with webpack, Vite, etc.
- **Testing**: Mock client for unit testing