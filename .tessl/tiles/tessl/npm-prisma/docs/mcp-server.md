# MCP Server

Model Context Protocol server for AI development tools integration, providing structured access to Prisma operations through standardized AI-native interfaces.

## Capabilities

### MCP Server Launch

Start Prisma MCP server to provide AI development tools with structured access to Prisma CLI operations.

```bash { .api }
/**
 * Start Prisma MCP server for AI development tools
 * Provides structured interface for AI agents to interact with Prisma
 */
prisma mcp [options]

Options:
  --early-access         Enable early access MCP features
  --help/-h              Show MCP command help
```

**Usage Examples:**

```bash
# Start MCP server with default configuration
prisma mcp

# Start MCP server with early access features
prisma mcp --early-access
```

### MCP Tool Interface

The Prisma MCP server exposes standardized tools that AI development environments can invoke for database operations.

```typescript { .api }
/**
 * MCP Tools provided by Prisma server
 * Each tool provides structured input/output for AI agent interaction
 */
interface McpTools {
  'migrate-status': MigrateStatusTool;
  'migrate-dev': MigrateDevTool;
  'migrate-reset': MigrateResetTool;
  'Prisma-Studio': PrismaStudioTool;
}

interface MigrateStatusTool {
  name: 'migrate-status';
  description: 'Check database migration status and history';
  inputSchema: {
    type: 'object';
    properties: {
      schema?: { type: 'string'; description: 'Path to schema file' };
    };
  };
}

interface MigrateDevTool {
  name: 'migrate-dev';
  description: 'Create and apply development migrations';
  inputSchema: {
    type: 'object';
    properties: {
      name?: { type: 'string'; description: 'Migration name' };
      createOnly?: { type: 'boolean'; description: 'Create migration without applying' };
      skipGenerate?: { type: 'boolean'; description: 'Skip client generation' };
      schema?: { type: 'string'; description: 'Path to schema file' };
    };
  };
}

interface MigrateResetTool {
  name: 'migrate-reset';
  description: 'Reset database and reapply all migrations';
  inputSchema: {
    type: 'object';
    properties: {
      force?: { type: 'boolean'; description: 'Skip confirmation prompt' };
      skipGenerate?: { type: 'boolean'; description: 'Skip client generation' };
      skipSeed?: { type: 'boolean'; description: 'Skip database seeding' };
      schema?: { type: 'string'; description: 'Path to schema file' };
    };
  };
}

interface PrismaStudioTool {
  name: 'Prisma-Studio';
  description: 'Launch Prisma Studio database interface';
  inputSchema: {
    type: 'object';
    properties: {
      port?: { type: 'number'; description: 'Custom port number' };
      browser?: { type: 'string'; description: 'Browser selection' };
      hostname?: { type: 'string'; description: 'Hostname binding' };
      schema?: { type: 'string'; description: 'Path to schema file' };
    };
  };
}
```

## MCP Tool Operations

### Migrate Status Tool

Check migration status and history through MCP interface with structured output for AI agents.

```json
{
  "tool": "migrate-status",
  "arguments": {
    "schema": "./prisma/schema.prisma"
  }
}
```

**Response Format:**

```json
{
  "isSuccessful": true,
  "content": [
    {
      "type": "text",
      "text": "Migration Status:\n✓ Database schema is up to date\n\nApplied migrations:\n- 20240101120000_init\n- 20240102130000_add_user_profile\n\nNo pending migrations."
    }
  ]
}
```

### Migrate Dev Tool

Create and apply development migrations through MCP with validation and error handling.

```json
{
  "tool": "migrate-dev",
  "arguments": {
    "name": "add-user-posts",
    "createOnly": false,
    "skipGenerate": false
  }
}
```

**Response Format:**

```json
{
  "isSuccessful": true,
  "content": [
    {
      "type": "text", 
      "text": "Migration created and applied successfully:\n- Created migration: 20240103140000_add_user_posts\n- Applied to database\n- Generated Prisma Client\n- Database synchronized"
    }
  ]
}
```

### Migrate Reset Tool

Reset database through MCP interface with safety confirmation and structured feedback.

```json
{
  "tool": "migrate-reset",
  "arguments": {
    "force": true,
    "skipGenerate": false,
    "skipSeed": true
  }
}
```

**Response Format:**

```json
{
  "isSuccessful": true,
  "content": [
    {
      "type": "text",
      "text": "Database reset completed:\n- Dropped all data\n- Reapplied all migrations\n- Generated Prisma Client\n- Ready for development"
    }
  ]
}
```

### Prisma Studio Tool

Launch Studio interface through MCP with configuration options and status reporting.

```json
{
  "tool": "Prisma-Studio",
  "arguments": {
    "port": 5555,
    "hostname": "localhost",
    "browser": "chrome"
  }
}
```

**Response Format:**

```json
{
  "isSuccessful": true,
  "content": [
    {
      "type": "text",
      "text": "Prisma Studio launched successfully:\n- URL: http://localhost:5555\n- Browser: chrome\n- Status: Running\n- Ready for database management"
    }
  ]
}
```

## MCP Integration Patterns

### AI Development Workflow

AI development tools can use the MCP server to perform database operations:

```typescript
// AI agent workflow example
const mcpClient = new McpClient('prisma-mcp-server');

// 1. Check current migration status
const status = await mcpClient.callTool('migrate-status', {});

// 2. Create migration based on schema changes
const migration = await mcpClient.callTool('migrate-dev', {
  name: 'ai-suggested-changes',
  createOnly: true // Review before applying
});

// 3. Launch Studio for verification
const studio = await mcpClient.callTool('Prisma-Studio', {
  port: 5555
});
```

### Development Environment Integration

```bash
# Start MCP server for development environment
prisma mcp &

# AI development tool connects to MCP server
# Provides structured database operations to AI agents
```

### CI/CD Integration with MCP

```typescript
// CI/CD pipeline using MCP interface
const mcpOperations = {
  checkMigrations: () => mcpClient.callTool('migrate-status', {}),
  applyMigrations: () => mcpClient.callTool('migrate-dev', { 
    skipGenerate: false 
  }),
  resetTestDb: () => mcpClient.callTool('migrate-reset', { 
    force: true,
    skipSeed: false 
  })
};
```

## MCP Server Configuration

### Server Startup Configuration

```typescript { .api }
interface McpServerConfig {
  earlyAccess?: boolean;           // Enable early access features
  schemaPath?: string;             // Default schema file path
  port?: number;                   // MCP server port (not Studio port)
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  timeout?: number;                // Tool execution timeout
}
```

### Environment Variables

```bash
# MCP server environment configuration
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
PRISMA_SCHEMA_PATH="./prisma/schema.prisma"
MCP_LOG_LEVEL="info"
MCP_TIMEOUT="30000"
```

### Security Considerations

```typescript
// MCP server security features
interface McpSecurity {
  toolWhitelist: string[];         // Allowed tools for security
  schemaValidation: boolean;       // Validate schema before operations
  confirmationRequired: boolean;   // Require confirmation for destructive ops
  auditLogging: boolean;          // Log all MCP operations
}
```

## Tool Output Formats

### Success Response

```typescript { .api }
interface McpSuccessResponse {
  isSuccessful: true;
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    uri?: string;
  }>;
}
```

### Error Response

```typescript { .api }
interface McpErrorResponse {
  isSuccessful: false;
  content: Array<{
    type: 'text';
    text: string;
  }>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Advanced MCP Features

### Early Access Features

```bash
# Enable early access MCP features
prisma mcp --early-access
```

Early access features may include:

- **Extended Tool Set**: Additional tools for schema manipulation
- **Advanced Integrations**: Integration with more AI development platforms
- **Performance Optimizations**: Improved tool execution performance
- **Enhanced Logging**: Detailed operation logging and monitoring

### Custom Tool Extensions

```typescript
// Framework for custom MCP tool development
interface CustomMcpTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: (args: any) => Promise<McpResponse>;
}
```

### Monitoring and Observability

```typescript
// MCP server monitoring capabilities
interface McpMetrics {
  toolInvocations: Record<string, number>;
  averageExecutionTime: Record<string, number>;
  errorRates: Record<string, number>;
  activeConnections: number;
}
```

## Error Handling

Common MCP server errors:

- **Tool Execution Errors**: Database operations fail or timeout
- **Schema Validation Errors**: Invalid schema prevents tool execution
- **Connection Errors**: Database connectivity issues
- **Permission Errors**: Insufficient database or file system permissions
- **Configuration Errors**: Invalid MCP server configuration
- **Protocol Errors**: MCP protocol communication issues

## Integration Examples

### VS Code Extension Integration

```typescript
// VS Code extension using Prisma MCP
const mcpProvider = new PrismaMcpProvider();

// Add database operations to command palette
vscode.commands.registerCommand('prisma.checkMigrations', async () => {
  const result = await mcpProvider.callTool('migrate-status', {});
  vscode.window.showInformationMessage(result.content[0].text);
});
```

### AI Assistant Integration

```typescript
// AI assistant using Prisma MCP for database operations
class DatabaseAssistant {
  constructor(private mcpClient: McpClient) {}
  
  async handleDatabaseQuery(userQuery: string) {
    // Analyze user intent
    const intent = this.analyzeIntent(userQuery);
    
    // Execute appropriate MCP tool
    switch (intent.operation) {
      case 'check-status':
        return await this.mcpClient.callTool('migrate-status', {});
      case 'create-migration':
        return await this.mcpClient.callTool('migrate-dev', {
          name: intent.migrationName
        });
      case 'open-studio':
        return await this.mcpClient.callTool('Prisma-Studio', {});
    }
  }
}
```