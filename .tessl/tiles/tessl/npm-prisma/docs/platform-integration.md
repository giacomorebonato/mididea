# Platform Integration

Authentication and project management for Prisma Platform services including workspace management, environment operations, and service integrations for Pulse and Accelerate.

## Capabilities

### Platform Command Group

Access Prisma Platform services and management capabilities through the platform command interface.

```bash { .api }
/**
 * Access Prisma Platform services
 * Manage authentication, projects, environments, and service integrations
 */
prisma platform <command> [options]

Commands:
  auth                    Authentication management (login, logout, show)
  workspace              Workspace operations (show)
  environment            Environment management (create, delete, show)
  project                Project operations (create, delete, show)
  serviceToken           Service token management (create, delete, show)
  pulse                  Pulse real-time events (enable, disable)
  accelerate             Accelerate connection pooling (enable, disable)

Global Options:
  --early-access         Enable early access features
  --help/-h              Show platform command help
```

### Authentication Management

Manage Prisma Platform authentication with browser-based login and credential management.

```bash { .api }
/**
 * Authentication operations for Prisma Platform
 * Supports GitHub and Google OAuth authentication
 */
prisma platform auth <command> [options]

Commands:
  login                  Authenticate via browser (GitHub/Google OAuth)
  logout                 Sign out and clear stored credentials
  show                   Display current authenticated user information
```

**Authentication Examples:**

```bash
# Login via browser OAuth
prisma platform auth login

# Check current authentication status
prisma platform auth show

# Sign out and clear credentials
prisma platform auth logout
```

**Authentication Output Example:**

```
$ prisma platform auth show
✓ Authenticated as john@example.com
  Provider: GitHub
  Workspace: acme-corp
  Expires: 2024-02-01T12:00:00Z
```

### Workspace Management

Display and manage workspace information for Prisma Platform organization.

```bash { .api }
/**
 * Workspace operations for Prisma Platform
 * View workspace details and member information
 */
prisma platform workspace <command> [options]

Commands:
  show                   Display current workspace information
```

**Workspace Examples:**

```bash
# Display workspace information
prisma platform workspace show
```

### Environment Management

Create, manage, and configure environments within Prisma Platform projects.

```bash { .api }
/**
 * Environment management operations
 * Create and manage project environments for different deployment stages
 */
prisma platform environment <command> [options]

Commands:
  create                 Create new environment
  delete                 Delete existing environment
  show                   List environments or show specific environment details

Create Options:
  --name <name>          Environment name
  --description <text>   Environment description
  --region <region>      Deployment region

Delete Options:
  --name <name>          Environment name to delete
  --force               Delete without confirmation

Show Options:
  --name <name>          Show specific environment (optional)
```

**Environment Examples:**

```bash
# List all environments
prisma platform environment show

# Show specific environment
prisma platform environment show --name production

# Create new environment
prisma platform environment create --name staging --description "Staging environment"

# Create environment with region
prisma platform environment create --name production --region us-east-1

# Delete environment
prisma platform environment delete --name old-staging

# Force delete without confirmation
prisma platform environment delete --name temp-env --force
```

### Project Management

Create, configure, and manage projects within Prisma Platform workspaces.

```bash { .api }
/**
 * Project management operations
 * Create and manage projects within workspace
 */
prisma platform project <command> [options]

Commands:
  create                 Create new project
  delete                 Delete existing project
  show                   List projects or show specific project details

Create Options:
  --name <name>          Project name
  --description <text>   Project description
  --region <region>      Default region for project resources

Delete Options:
  --name <name>          Project name to delete
  --force               Delete without confirmation

Show Options:
  --name <name>          Show specific project (optional)
```

**Project Examples:**

```bash
# List all projects
prisma platform project show

# Show specific project
prisma platform project show --name my-app

# Create new project
prisma platform project create --name my-new-app --description "New application"

# Create project with default region
prisma platform project create --name global-app --region eu-west-1

# Delete project
prisma platform project delete --name old-project

# Force delete without confirmation
prisma platform project delete --name temp-project --force
```

### Service Token Management

Generate, manage, and revoke service tokens for programmatic access to Prisma Platform APIs.

```bash { .api }
/**
 * Service token management for API access
 * Generate and manage tokens for CI/CD and programmatic access
 */
prisma platform serviceToken <command> [options]

Commands:
  create                 Generate new service token
  delete                 Revoke existing service token
  show                   List service tokens

Create Options:
  --name <name>          Token name/description
  --project <project>    Project scope for token
  --environment <env>    Environment scope for token
  --permissions <perms>  Token permissions (comma-separated)

Delete Options:
  --id <token-id>        Token ID to revoke
  --name <name>          Token name to revoke

Show Options:
  --project <project>    Filter by project (optional)
```

**Service Token Examples:**

```bash
# List all service tokens
prisma platform serviceToken show

# Create service token for project
prisma platform serviceToken create --name "CI/CD Token" --project my-app

# Create token with specific permissions
prisma platform serviceToken create \
  --name "Deploy Token" \
  --project my-app \
  --environment production \
  --permissions "deploy,read"

# Revoke token by ID
prisma platform serviceToken delete --id st-abc123def456

# Revoke token by name
prisma platform serviceToken delete --name "Old CI Token"

# List tokens for specific project
prisma platform serviceToken show --project my-app
```

**Note**: Service tokens are also available via the deprecated `apikey` alias:

```bash
# Deprecated aliases (use serviceToken instead)
prisma platform apikey create --name "Legacy Token"
prisma platform apikey show
prisma platform apikey delete --id st-xyz789
```

### Pulse Integration

Enable and manage Pulse real-time event streaming for database change notifications.

```bash { .api }
/**
 * Pulse real-time event streaming management
 * Enable database change streams and real-time notifications
 */
prisma platform pulse <command> [options]

Commands:
  enable                 Enable Pulse for project/environment
  disable                Disable Pulse streaming

Enable Options:
  --project <project>    Project to enable Pulse for
  --environment <env>    Environment to enable Pulse for
  --region <region>      Pulse processing region

Disable Options:
  --project <project>    Project to disable Pulse for
  --environment <env>    Environment to disable Pulse for
```

**Pulse Examples:**

```bash
# Enable Pulse for project
prisma platform pulse enable --project my-app --environment production

# Enable Pulse with specific region
prisma platform pulse enable \
  --project my-app \
  --environment production \
  --region us-east-1

# Disable Pulse
prisma platform pulse disable --project my-app --environment production
```

### Accelerate Integration

Enable and configure Accelerate connection pooling and caching for improved database performance.

```bash { .api }
/**
 * Accelerate connection pooling and caching management
 * Enable database connection pooling and query result caching
 */
prisma platform accelerate <command> [options]

Commands:
  enable                 Enable Accelerate for project/environment
  disable                Disable Accelerate pooling

Enable Options:
  --project <project>    Project to enable Accelerate for
  --environment <env>    Environment to enable Accelerate for
  --region <region>      Accelerate processing region
  --cache-strategy <strategy> Caching strategy configuration

Disable Options:
  --project <project>    Project to disable Accelerate for
  --environment <env>    Environment to disable Accelerate for
```

**Accelerate Examples:**

```bash
# Enable Accelerate for project
prisma platform accelerate enable --project my-app --environment production

# Enable Accelerate with specific region and caching
prisma platform accelerate enable \
  --project my-app \
  --environment production \
  --region us-east-1 \
  --cache-strategy ttl=300

# Disable Accelerate
prisma platform accelerate disable --project my-app --environment production
```

## Platform Integration Workflows

### Initial Platform Setup

```bash
# 1. Authenticate with platform
prisma platform auth login

# 2. Create project
prisma platform project create --name my-app --description "My application"

# 3. Create environments
prisma platform environment create --name development
prisma platform environment create --name staging  
prisma platform environment create --name production

# 4. Enable services
prisma platform accelerate enable --project my-app --environment production
prisma platform pulse enable --project my-app --environment production
```

### CI/CD Integration

```bash
# Generate service token for CI/CD
prisma platform serviceToken create \
  --name "GitHub Actions" \
  --project my-app \
  --permissions "deploy,read"

# Use token in CI/CD (store as secret)
export PRISMA_PLATFORM_TOKEN="st-abc123def456"
```

**CI/CD Configuration Example:**

```yaml
# GitHub Actions
- name: Deploy to Prisma Platform
  env:
    PRISMA_PLATFORM_TOKEN: ${{ secrets.PRISMA_PLATFORM_TOKEN }}
  run: |
    prisma platform auth login --token $PRISMA_PLATFORM_TOKEN
    prisma migrate deploy
```

### Multi-Environment Management

```bash
# Development environment
prisma platform environment show --name development

# Deploy to staging
prisma platform project show --name my-app
DATABASE_URL=$STAGING_DB_URL prisma migrate deploy

# Enable Accelerate for production
prisma platform accelerate enable \
  --project my-app \
  --environment production
```

## Error Handling

Common platform integration errors:

- **Authentication Errors**: Invalid credentials or expired tokens
- **Permission Errors**: Insufficient permissions for operation
- **Network Errors**: Connectivity issues with Prisma Platform
- **Resource Conflicts**: Duplicate names or conflicting configurations
- **Quota Limits**: Platform usage limits exceeded
- **Service Unavailable**: Platform services temporarily unavailable

## Integration Patterns

### Local Development with Platform Services

```bash
# Use platform services in local development
prisma platform auth login
export ACCELERATE_URL=$(prisma platform accelerate show --project my-app --environment development)
npm run dev
```

### Platform Service Configuration

```typescript
// Using platform services in application
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: process.env.ACCELERATE_URL, // From platform
})

// Pulse event subscription
const subscription = await prisma.$subscribe('User', {
  create: true,
  update: true,
})
```

### Multi-Region Deployment

```bash
# Deploy to multiple regions
prisma platform environment create --name production-us --region us-east-1
prisma platform environment create --name production-eu --region eu-west-1

prisma platform accelerate enable --project my-app --environment production-us --region us-east-1
prisma platform accelerate enable --project my-app --environment production-eu --region eu-west-1
```