# Schema Management

Schema validation, formatting, and development utilities for maintaining clean, valid, and consistent Prisma schema files with comprehensive error checking.

## Capabilities

### Schema Formatting

Format Prisma schema files with consistent styling, proper indentation, and standardized structure.

```bash { .api }
/**
 * Format Prisma schema files with consistent styling
 * Applies standard formatting rules and validates syntax
 */
prisma format [options]

Options:
  --schema <path>         Schema file path (default: ./prisma/schema.prisma)
  --check                 Check formatting without modifying files
  --help/-h              Show format command help
```

**Usage Examples:**

```bash
# Format default schema file
prisma format

# Format custom schema location
prisma format --schema ./custom/schema.prisma

# Check formatting without making changes
prisma format --check

# Format multiple schemas in CI/CD
find . -name "*.prisma" -exec prisma format --schema {} \;
```

**Formatting Rules Applied:**

- Consistent indentation (2 spaces)
- Proper line spacing between blocks
- Standardized attribute ordering
- Comment preservation and alignment
- Field type alignment
- Relation attribute formatting

**Before/After Example:**

```prisma
// Before formatting
model User{
id Int @id @default(autoincrement())
email String@unique
name String?
posts Post[]
}

// After formatting  
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
  posts Post[]
}
```

### Schema Validation

Validate Prisma schema syntax, configuration, and database compatibility with comprehensive error reporting.

```bash { .api }
/**
 * Validate Prisma schema syntax and configuration
 * Checks schema validity, database compatibility, and configuration
 */
prisma validate [options]

Options:
  --schema <path>         Schema file path (default: ./prisma/schema.prisma)
  --config <path>         Configuration file path
  --help/-h              Show validate command help
```

**Usage Examples:**

```bash
# Validate default schema
prisma validate

# Validate custom schema location
prisma validate --schema ./custom/schema.prisma

# Validate with custom configuration
prisma validate --config ./prisma/config.json

# Validate in CI/CD pipeline
prisma validate && echo "Schema is valid"
```

**Validation Checks:**

- **Syntax Validation**: Proper Prisma schema language syntax
- **Type Checking**: Valid field types and attribute usage
- **Relation Validation**: Correct relationship definitions
- **Database Compatibility**: Provider-specific feature compatibility
- **Configuration Validation**: Valid generator and datasource configurations
- **Constraint Validation**: Database constraint compatibility
- **Naming Validation**: Valid model and field naming conventions

### Format Checking

Check schema formatting without making modifications, useful for CI/CD and code review processes.

```bash { .api }
/**
 * Check schema formatting without modifying files
 * Returns exit code indicating whether formatting is needed
 */
prisma format --check [options]

Exit Codes:
  0: Schema is properly formatted
  1: Schema needs formatting or has syntax errors
```

**CI/CD Integration:**

```bash
# Check formatting in CI pipeline
if prisma format --check; then
  echo "Schema formatting is valid"
else
  echo "Schema needs formatting" >&2
  exit 1
fi
```

**Usage in Pre-commit Hooks:**

```bash
# .git/hooks/pre-commit
#!/bin/bash
prisma format --check || {
  echo "Please run 'prisma format' before committing"
  exit 1
}
```

## Schema Development Workflows

### Development Formatting Workflow

```bash
# Development cycle with formatting
# 1. Modify schema
vim prisma/schema.prisma

# 2. Format schema
prisma format

# 3. Validate schema
prisma validate

# 4. Generate client
prisma generate
```

### Team Collaboration Workflow

```bash
# Before committing changes
prisma format                    # Format schema
prisma validate                  # Validate schema  
git add prisma/schema.prisma    # Stage formatted schema
git commit -m "Update schema"   # Commit changes
```

### Multi-Schema Project Management

```bash
# Format multiple schema files
prisma format --schema ./apps/api/prisma/schema.prisma
prisma format --schema ./apps/admin/prisma/schema.prisma

# Validate all schemas
find . -name "schema.prisma" -exec prisma validate --schema {} \;
```

## Advanced Schema Management

### Schema File Organization

```prisma
// Well-organized schema structure
generator client {
  provider = "prisma-client-js"
  output   = "../generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums first
enum UserRole {
  ADMIN
  USER
  MODERATOR
}

// Base models
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  posts     Post[]
  profile   Profile?

  @@map("users")
}

// Related models
model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  avatar String?
  userId Int    @unique
  user   User   @relation(fields: [userId], references: [id])

  @@map("profiles")
}
```

### Schema Validation Rules

```prisma
// Valid schema patterns
model Product {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(255)
  price       Decimal  @db.Decimal(10, 2)
  inStock     Boolean  @default(true)
  categoryId  Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Proper relation definition
  category    Category? @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]

  // Proper indexes
  @@index([categoryId])
  @@index([createdAt])
  @@map("products")
}
```

### Configuration Validation

```prisma
// Valid generator configuration
generator client {
  provider        = "prisma-client-js"
  output          = "./generated/client"
  previewFeatures = ["jsonProtocol", "metrics"]
  binaryTargets   = ["native", "linux-musl"]
}

// Valid datasource configuration
datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")
  directUrl    = env("DIRECT_URL")
  relationMode = "foreignKeys"
}
```

## Error Handling and Debugging

### Common Validation Errors

**Syntax Errors:**

```bash
$ prisma validate
Error: Schema parsing failed:
  --> schema.prisma:15:3
   |
15 |   posts Post[]
   |   ^^^^^ Type "Post" referenced but not defined
```

**Type Errors:**

```bash
Error: Relation field "posts" must specify both `fields` and `references` 
or be a list and have a back-relation field with both `fields` and `references`.
```

**Database Compatibility:**

```bash
Error: The preview feature "extendedWhereUnique" is not supported 
with the current database provider "sqlite".
```

### Formatting Issues

**Formatting Check Output:**

```bash
$ prisma format --check
The following files are not formatted:
  - prisma/schema.prisma

Run 'prisma format' to fix formatting issues.
```

**Auto-fixing Common Issues:**

```bash
# Fix formatting automatically
prisma format

# Validate after formatting
prisma validate
```

## Integration Patterns

### Editor Integration

```json
// VS Code settings.json
{
  "prisma.format.enable": true,
  "editor.formatOnSave": true,
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

### Git Hooks Integration

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Format and validate schema
prisma format
prisma validate

# Add formatted schema to commit
git add prisma/schema.prisma
```

### CI/CD Pipeline Integration

```yaml
# GitHub Actions workflow
name: Schema Validation
on: [push, pull_request]

jobs:
  validate-schema:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Check schema formatting
        run: prisma format --check
        
      - name: Validate schema
        run: prisma validate
```

### Docker Integration

```dockerfile
# Dockerfile with schema validation
FROM node:18-alpine
COPY . .
RUN npm install

# Validate schema during build
RUN npx prisma validate

# Format schema and build
RUN npx prisma format
RUN npx prisma generate
```

## Automated Schema Management

### Format on Save

```typescript
// VS Code extension configuration
{
  "prisma.format.enable": true,
  "editor.codeActionsOnSave": {
    "source.format.prisma": true
  }
}
```

### Batch Processing

```bash
# Script for batch schema management
#!/bin/bash
for schema in $(find . -name "*.prisma"); do
  echo "Processing $schema"
  prisma format --schema "$schema"
  prisma validate --schema "$schema"
done
```

### Quality Gates

```bash
# Quality gate script
#!/bin/bash
set -e

echo "Checking schema formatting..."
prisma format --check || {
  echo "Schema formatting check failed"
  exit 1
}

echo "Validating schema..."
prisma validate || {
  echo "Schema validation failed"
  exit 1
}

echo "All schema checks passed!"
```

## Best Practices

### Schema Organization

- **Consistent Formatting**: Always use `prisma format`
- **Logical Grouping**: Group related models together
- **Clear Naming**: Use descriptive model and field names
- **Comment Usage**: Add comments for complex business logic
- **Index Strategy**: Define appropriate database indexes

### Development Workflow

- **Format Before Commit**: Always format schemas before committing
- **Validate Regularly**: Run validation during development
- **Team Standards**: Establish team formatting conventions
- **CI Integration**: Include validation in CI/CD pipelines
- **Documentation**: Keep schema documentation up to date

### Error Prevention

- **Regular Validation**: Validate schemas frequently during development
- **Type Safety**: Use proper Prisma types and attributes
- **Relation Integrity**: Ensure correct relationship definitions
- **Provider Compatibility**: Check database provider compatibility
- **Preview Features**: Use preview features cautiously in production