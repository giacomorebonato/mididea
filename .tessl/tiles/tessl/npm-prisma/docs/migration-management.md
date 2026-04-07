# Migration Management

Declarative data modeling and migration system with development and production workflows, providing version control for database schema changes.

## Capabilities

### Migration Development

Create and apply migrations during development with automatic migration generation and database synchronization.

```bash { .api }
/**
 * Create and apply development migrations
 * Generates migration files and applies them to development database
 */
prisma migrate dev [options]

Options:
  --name <name>           Migration name (required for first migration)
  --schema <path>         Custom schema file path
  --create-only          Create migration file without applying
  --skip-generate        Skip automatic Prisma Client generation
  --skip-seed            Skip automatic seeding after migration
  --help/-h              Show migrate dev command help
```

**Usage Examples:**

```bash
# Create and apply initial migration
prisma migrate dev --name init

# Create and apply named migration
prisma migrate dev --name add-user-profile

# Create migration file only (review before applying)
prisma migrate dev --create-only --name add-indexes

# Apply pending migrations without generating new ones
prisma migrate dev

# Skip client generation after migration
prisma migrate dev --skip-generate
```

### Migration Deployment

Deploy pending migrations to production environments with safety checks and rollback capabilities.

```bash { .api }
/**
 * Deploy pending migrations to production
 * Applies only unapplied migrations with safety checks
 */
prisma migrate deploy [options]

Options:
  --schema <path>         Custom schema file path
  --help/-h              Show migrate deploy command help
```

**Usage Examples:**

```bash
# Deploy all pending migrations
prisma migrate deploy

# Deploy with custom schema location
prisma migrate deploy --schema ./custom/schema.prisma
```

### Migration Status

Check migration status and view pending, applied, and failed migrations.

```bash { .api }
/**
 * Check migration status and history
 * Shows applied, pending, and failed migrations
 */
prisma migrate status [options]

Options:
  --schema <path>         Custom schema file path
  --help/-h              Show migrate status command help
```

**Usage Examples:**

```bash
# Check migration status
prisma migrate status

# Check status with custom schema
prisma migrate status --schema ./custom/schema.prisma
```

**Status Output Example:**

```
Database schema is up to date!

The following migrations have been applied:
✓ 20240101120000_init
✓ 20240102130000_add_user_profile  
✓ 20240103140000_add_indexes

No pending migrations found.
```

### Migration Reset

Reset database by dropping all data and reapplying all migrations from the beginning.

```bash { .api }
/**
 * Reset database and reapply all migrations
 * Drops all data and recreates database from migrations
 */
prisma migrate reset [options]

Options:
  --schema <path>         Custom schema file path
  --force                Skip confirmation prompt
  --skip-generate        Skip automatic Prisma Client generation
  --skip-seed            Skip automatic seeding after reset
  --help/-h              Show migrate reset command help
```

**Usage Examples:**

```bash
# Reset database (with confirmation)
prisma migrate reset

# Reset without confirmation prompt
prisma migrate reset --force

# Reset without regenerating client or seeding
prisma migrate reset --force --skip-generate --skip-seed
```

### Migration Resolution

Resolve failed migrations by marking them as applied without executing them.

```bash { .api }
/**
 * Mark failed migrations as resolved
 * Useful for fixing migration history after manual intervention
 */
prisma migrate resolve [options]

Options:
  --applied <migration>   Mark specific migration as applied
  --rolled-back <migration> Mark specific migration as rolled back
  --schema <path>         Custom schema file path
  --help/-h              Show migrate resolve command help
```

**Usage Examples:**

```bash
# Mark migration as applied
prisma migrate resolve --applied 20240101120000_failed_migration

# Mark migration as rolled back
prisma migrate resolve --rolled-back 20240101120000_problematic_migration
```

### Migration Diff

Generate migration diffs between different schema states for preview and review.

```bash { .api }
/**
 * Generate migration diffs between schema states
 * Compare schemas and show required database changes
 */
prisma migrate diff [options]

Options:
  --from-empty           Compare from empty schema
  --from-schema-datamodel <path> Compare from schema file
  --from-schema-datasource <path> Compare from schema datasource
  --from-url <url>       Compare from database URL
  --from-migrations <path> Compare from migrations directory
  --to-schema-datamodel <path> Compare to schema file
  --to-schema-datasource <path> Compare to schema datasource  
  --to-url <url>         Compare to database URL
  --to-migrations <path> Compare to migrations directory
  --script               Output executable SQL script
  --exit-code            Return non-zero exit code if differences found
  --help/-h              Show migrate diff command help
```

**Usage Examples:**

```bash
# Compare current schema to database
prisma migrate diff \
  --from-url $DATABASE_URL \
  --to-schema-datamodel ./prisma/schema.prisma

# Generate SQL script for differences
prisma migrate diff \
  --from-url $DATABASE_URL \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script

# Compare two database states
prisma migrate diff \
  --from-url $STAGING_DATABASE_URL \
  --to-url $PRODUCTION_DATABASE_URL

# Compare schema to empty state
prisma migrate diff \
  --from-empty \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script
```

## Migration Files

### Migration File Structure

```
prisma/
├── schema.prisma
└── migrations/
    ├── 20240101120000_init/
    │   └── migration.sql
    ├── 20240102130000_add_user_profile/
    │   └── migration.sql
    └── migration_lock.toml
```

### Migration SQL Example

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

### Migration Lock File

```toml
# migration_lock.toml
provider = "postgresql"
```

## Development Workflows

### Feature Development

```bash
# 1. Modify schema
# 2. Create migration
prisma migrate dev --name add-feature-x

# 3. Review generated migration
cat prisma/migrations/*/migration.sql

# 4. Test migration
npm run test
```

### Collaborative Development

```bash
# Pull latest migrations from team
git pull origin main

# Apply new migrations locally
prisma migrate dev

# Create your feature migration
prisma migrate dev --name your-feature
```

### Production Deployment

```bash
# CI/CD pipeline deployment
prisma migrate deploy

# Manual deployment with checks
prisma migrate status  # Check pending migrations
prisma migrate deploy  # Apply migrations
```

## Advanced Migration Patterns

### Custom Migration SQL

```sql
-- Custom business logic in migration
BEGIN;

-- Generated schema changes
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- Custom data migration
INSERT INTO "Order" (userId, total)
SELECT id, 0.00 FROM "User" WHERE "User"."createdAt" < '2024-01-01';

-- Add foreign key constraint  
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
```

### Migration Rollback Strategy

```bash
# Create rollback migration
prisma migrate dev --name rollback-feature-x --create-only

# Edit migration to reverse changes
# Apply rollback
prisma migrate dev
```

### Environment-Specific Migrations

```bash
# Staging deployment
DATABASE_URL=$STAGING_DATABASE_URL prisma migrate deploy

# Production deployment  
DATABASE_URL=$PRODUCTION_DATABASE_URL prisma migrate deploy
```

## Error Handling

Common migration errors:

- **Schema Drift**: Database schema differs from migration history
- **Failed Migrations**: SQL errors during migration execution
- **Conflicting Changes**: Multiple developers creating conflicting migrations
- **Data Loss**: Migrations that would destroy data
- **Constraint Violations**: Migrations violating database constraints
- **Lock Conflicts**: Concurrent migration attempts

## Integration

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Run migrations
  run: prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

- name: Generate client
  run: prisma generate
```

### Docker Integration

```dockerfile
# Dockerfile
COPY prisma ./prisma/
RUN npx prisma generate
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

### Testing Integration

```bash
# Test database migrations
DATABASE_URL="postgresql://test:test@localhost:5432/test" prisma migrate reset --force
DATABASE_URL="postgresql://test:test@localhost:5432/test" npm run test
```