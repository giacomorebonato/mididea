# Studio Interface

Web-based GUI for database visualization, data editing, and relationship exploration with real-time updates and intuitive data management capabilities.

## Capabilities

### Studio Launch

Launch Prisma Studio web interface for interactive database management and visualization.

```bash { .api }
/**
 * Launch Prisma Studio web interface
 * Opens browser-based GUI for database visualization and editing
 */
prisma studio [options]

Options:
  --port/-p <number>      Custom port (default: 5555-5600 range)
  --browser/-b <browser>  Browser selection (chrome, firefox, safari, etc.)
  --hostname/-n <host>    Hostname binding (default: localhost)
  --schema <path>         Custom schema file path
  --help/-h              Show studio command help
```

**Usage Examples:**

```bash
# Launch Studio with default settings
prisma studio

# Launch on custom port
prisma studio --port 3333

# Launch with specific browser
prisma studio --browser firefox

# Launch with custom hostname (for Docker/remote access)
prisma studio --hostname 0.0.0.0

# Launch with custom schema location
prisma studio --schema ./custom/schema.prisma

# Launch on specific port and hostname
prisma studio --port 4000 --hostname 0.0.0.0
```

### Port Configuration

Configure Studio to run on specific ports with automatic fallback for port conflicts.

```bash { .api }
/**
 * Configure Studio port binding
 * Automatically finds available port in range if default is occupied
 */
prisma studio --port <number>

Port Behavior:
  Default Range: 5555-5600
  Auto-fallback: Finds next available port if specified port is occupied
  Port Validation: Ensures port is valid and available
```

**Port Examples:**

```bash
# Specific port
prisma studio --port 8080

# Studio finds available port if 3000 is occupied
prisma studio --port 3000

# Development server alongside Studio
npm run dev &          # Starts on 3000
prisma studio --port 3001
```

### Browser Integration

Control browser launching and selection for Studio interface access.

```bash { .api }
/**
 * Browser selection and launching
 * Supports major browsers with automatic detection
 */
prisma studio --browser <browser>

Supported Browsers:
  chrome, firefox, safari, edge, opera
  Auto-detection: Uses system default browser if not specified
```

**Browser Examples:**

```bash
# Launch with Chrome
prisma studio --browser chrome

# Launch with Firefox
prisma studio --browser firefox

# Launch with system default browser (implicit)
prisma studio
```

### Network Configuration

Configure Studio for remote access and network binding in containerized environments.

```bash { .api }
/**
 * Network hostname binding
 * Configure Studio accessibility from different network locations
 */
prisma studio --hostname <host>

Hostname Options:
  localhost (default): Local access only
  0.0.0.0: Accept connections from any IP address
  specific-ip: Bind to specific network interface
```

**Network Examples:**

```bash
# Local access only (default)
prisma studio --hostname localhost

# Docker/remote access
prisma studio --hostname 0.0.0.0 --port 5555

# Specific network interface
prisma studio --hostname 192.168.1.100
```

## Studio Features

### Data Visualization

Studio provides comprehensive data visualization capabilities:

- **Table Browser**: Navigate between database tables and collections
- **Record Listing**: View paginated records with sorting and filtering
- **Relationship Visualization**: See connected records and foreign key relationships
- **Data Type Display**: Proper rendering of different data types (dates, JSON, etc.)
- **Query Results**: View results of database operations in real-time

### Data Editing

Interactive data editing with validation and error handling:

- **Inline Editing**: Edit records directly in the table view
- **Form-based Editing**: Detailed record editing with form validation
- **Relationship Management**: Create and modify record relationships
- **Data Validation**: Client-side validation based on schema constraints
- **Error Reporting**: Clear error messages for constraint violations

### Schema Explorer

Visual schema exploration and understanding:

- **Model Relationships**: Visual representation of model connections
- **Field Details**: Data types, constraints, and validation rules
- **Index Information**: View database indexes and performance hints
- **Enum Visualization**: Display enum values and options

## Development Workflows

### Local Development

```bash
# Start development stack
npm run dev &           # Application server
prisma studio &         # Database GUI
# Both running simultaneously for full development environment
```

### Database Debugging

```bash
# Quick database inspection
prisma studio

# Inspect specific changes after migration
prisma migrate dev --name add-feature
prisma studio  # Verify migration results
```

### Data Seeding Verification

```bash
# Verify seeded data
prisma db seed
prisma studio  # Check seeding results visually
```

## Production Considerations

### Security Configuration

```bash
# Production-safe Studio (internal network only)
prisma studio --hostname 127.0.0.1 --port 5555

# VPN or internal access
prisma studio --hostname 10.0.0.100 --port 5555
```

### Docker Integration

```dockerfile
# Dockerfile for Studio container
FROM node:18-alpine
COPY . .
RUN npm install
EXPOSE 5555
CMD ["npx", "prisma", "studio", "--hostname", "0.0.0.0"]
```

```yaml
# docker-compose.yml
services:
  prisma-studio:
    build: .
    ports:
      - "5555:5555"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    command: npx prisma studio --hostname 0.0.0.0
```

### Reverse Proxy Setup

```nginx
# Nginx configuration for Studio
location /studio/ {
    proxy_pass http://localhost:5555/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## Error Handling

Common Studio errors and solutions:

- **Port Conflicts**: Studio automatically tries alternative ports
- **Database Connection**: Check DATABASE_URL and database availability
- **Schema Errors**: Invalid schema prevents Studio from starting
- **Browser Issues**: Try different browser or disable extensions
- **Network Access**: Firewall or network configuration blocking access
- **Permission Errors**: Database user lacks necessary permissions

## Integration Patterns

### Development Team Workflow

```bash
# Team member workflow
git pull origin main          # Get latest schema changes
prisma migrate dev           # Apply new migrations
prisma generate             # Update client
prisma studio               # Explore data changes
```

### Testing Integration

```bash
# Testing workflow with Studio
npm run test:setup          # Setup test database
prisma studio --port 5556   # Studio for test database inspection
npm run test               # Run tests
```

### Multi-Environment Setup

```bash
# Development environment
DATABASE_URL=$DEV_DATABASE_URL prisma studio --port 5555

# Staging environment
DATABASE_URL=$STAGING_DATABASE_URL prisma studio --port 5556

# Local test database
DATABASE_URL=$TEST_DATABASE_URL prisma studio --port 5557
```

## Studio Interface Features

### Navigation

- **Sidebar**: Model/table navigation with search
- **Breadcrumbs**: Track current location in data hierarchy
- **Tabs**: Multiple table views open simultaneously
- **Search**: Global search across all tables and records

### Data Operations

- **CRUD Operations**: Create, read, update, delete records
- **Bulk Operations**: Select and modify multiple records
- **Export/Import**: Data export in various formats
- **Filtering**: Advanced filtering with multiple criteria
- **Sorting**: Sort by any column with multiple sort keys

### Performance Features

- **Pagination**: Efficient handling of large datasets
- **Lazy Loading**: Load data on demand for better performance
- **Caching**: Client-side caching for improved responsiveness
- **Connection Pooling**: Efficient database connection management

### Accessibility

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **High Contrast**: Support for high contrast themes
- **Responsive Design**: Works on various screen sizes