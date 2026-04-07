# Database Operations

Direct database operations including schema synchronization, raw query execution, database introspection, and seeding with support for multiple database providers.

## Capabilities

### Database Pull

Pull database schema from existing database and generate Prisma schema file with models, relations, and constraints.

```bash { .api }
/**
 * Pull schema from existing database to generate Prisma schema
 * Introspects database structure and creates/updates schema.prisma
 */
prisma db pull [options]

Options:
  --schema <path>          Custom schema file path
  --url <connection>       Database connection URL
  --force                  Overwrite existing schema without confirmation
  --print                  Print schema to stdout instead of writing file
  --help/-h               Show db pull command help
```

**Usage Examples:**

```bash
# Pull schema from database specified in schema
prisma db pull

# Pull with custom schema location
prisma db pull --schema ./custom/schema.prisma

# Pull with direct connection URL
prisma db pull --url "postgresql://user:pass@localhost:5432/mydb"

# Preview schema without writing file
prisma db pull --print

# Force overwrite existing schema
prisma db pull --force
```

### Database Push

Push Prisma schema changes directly to the database without creating migration files, ideal for prototyping and development.

```bash { .api }
/**
 * Push schema changes directly to database
 * Synchronizes database with schema without migration files
 */
prisma db push [options]

Options:
  --schema <path>          Custom schema file path
  --force-reset           Reset database if schema changes cannot be applied
  --accept-data-loss      Accept potential data loss from schema changes
  --skip-generate         Skip automatic Prisma Client generation
  --help/-h               Show db push command help
```

**Usage Examples:**

```bash
# Push schema changes to database
prisma db push

# Push with potential data loss acceptance
prisma db push --accept-data-loss

# Push and reset database if needed
prisma db push --force-reset

# Push without regenerating client
prisma db push --skip-generate
```

### Database Execute

Execute raw SQL queries directly against the database with support for files and stdin input.

```bash { .api }
/**
 * Execute raw SQL queries against the database
 * Supports direct queries, files, and stdin input
 */
prisma db execute [options]

Options:
  --schema <path>          Custom schema file path
  --url <connection>       Database connection URL  
  --file <path>           SQL file to execute
  --stdin                 Read SQL from stdin
  --help/-h               Show db execute command help
```

**Usage Examples:**

```bash
# Execute SQL from file
prisma db execute --file ./scripts/seed.sql

# Execute SQL from stdin
echo "SELECT * FROM users;" | prisma db execute --stdin

# Execute with custom connection
prisma db execute --file ./query.sql --url "postgresql://..."

# Execute with custom schema
prisma db execute --file ./migration.sql --schema ./custom/schema.prisma
```

### Database Seed

Run database seeding scripts to populate database with initial or test data.

```bash { .api }
/**
 * Run database seeding scripts
 * Executes seed script defined in package.json or default locations
 */
prisma db seed [options]

Options:
  --schema <path>          Custom schema file path
  --help/-h               Show db seed command help
```

**Seed Configuration:**

```json
// package.json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Usage Examples:**

```bash
# Run seed script
prisma db seed

# Run seed with custom schema
prisma db seed --schema ./custom/schema.prisma
```

**Seed Script Example:**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create seed data
  const alice = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
      posts: {
        create: {
          title: 'Hello World',
          content: 'This is my first post',
          published: true,
        },
      },
    },
  })

  const bob = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@prisma.io',
      posts: {
        create: [
          {
            title: 'I am Bob',
            content: 'This is my bio',
            published: true,
          },
          {
            title: 'Draft Post',
            content: 'This is a draft',
            published: false,
          },
        ],
      },
    },
  })

  console.log({ alice, bob })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## Database Provider Support

### PostgreSQL Operations

```bash
# PostgreSQL-specific examples
prisma db pull --url "postgresql://user:password@localhost:5432/mydb"
prisma db push --schema ./postgresql-schema.prisma
prisma db execute --file ./postgresql-queries.sql
```

### MySQL Operations  

```bash
# MySQL-specific examples
prisma db pull --url "mysql://user:password@localhost:3306/mydb"
prisma db push --schema ./mysql-schema.prisma
prisma db execute --file ./mysql-queries.sql
```

### SQLite Operations

```bash
# SQLite-specific examples
prisma db pull --url "file:./dev.db"
prisma db push --schema ./sqlite-schema.prisma
prisma db execute --file ./sqlite-queries.sql
```

### MongoDB Operations

```bash
# MongoDB-specific examples (limited operations)
prisma db pull --url "mongodb://localhost:27017/mydb"
prisma db push --schema ./mongodb-schema.prisma
```

## Schema Synchronization Patterns

### Development Workflow

```bash
# Typical development flow
prisma db push                    # Sync schema changes quickly
prisma generate                   # Regenerate client
prisma db seed                    # Populate with test data
```

### Production Introspection

```bash
# Pull production schema for local development
prisma db pull --url $PRODUCTION_DATABASE_URL --print > production-schema.prisma
```

### Schema Migration

```bash
# Convert push-based development to migrations
prisma db push                    # Final push of current schema
prisma migrate dev --create-only  # Create migration from current state
```

## Error Handling

Common database operation errors:

- **Connection Errors**: Invalid database URL or connection issues
- **Permission Errors**: Insufficient database privileges
- **Schema Conflicts**: Conflicting schema changes during push
- **Data Loss**: Schema changes that would lose data
- **Syntax Errors**: Invalid SQL in execute operations
- **Seed Failures**: Errors during seeding process

## Integration Patterns

### CI/CD Integration

```bash
# Production deployment
prisma db push --accept-data-loss  # For staging environments
prisma migrate deploy             # For production environments
```

### Local Development

```bash
# Quick iteration cycle
prisma db push && prisma generate && prisma db seed
```

### Testing Integration

```bash
# Test database setup
DATABASE_URL="postgresql://test:test@localhost:5432/test_db" prisma db push
DATABASE_URL="postgresql://test:test@localhost:5432/test_db" prisma db seed
```