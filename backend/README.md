# Shopping List Backend API

Backend API server for the Shopping List mobile application. Built with Express, TypeScript, and SQLite.

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
cd backend
npm install
```

### Development

```bash
# Start dev server with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Run linter with auto-fix
npm run lint:fix
```

### Build & Production

```bash
# Build TypeScript to JavaScript
npm run build

# Run production server
npm start
```

## Configuration

Environment variables (optional):

```bash
PORT=3001                    # Server port (default: 3001)
NODE_ENV=development         # Environment (development|production)
DATABASE_PATH=./data/shopping-list.db  # SQLite database path
CORS_ORIGINS=http://localhost:8081,http://localhost:19000  # Allowed origins
```

## API Documentation

**Base URL:** `http://localhost:3001`

### Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T19:00:00.000Z",
  "version": "1.0.0"
}
```

### Shopping Lists

#### Create Shopping List

```bash
POST /api/v1/shopping-lists
Content-Type: application/json

{
  "name": "Weekend Shopping",
  "items": [
    {
      "name": "Chicken Breast",
      "quantity": "2 lbs",
      "notes": "Organic if available"
    },
    {
      "name": "Olive Oil",
      "quantity": "1 bottle"
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Weekend Shopping",
  "status": "active",
  "items": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "shopping_list_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Chicken Breast",
      "quantity": "2 lbs",
      "notes": "Organic if available",
      "created_at": "2025-11-02T19:00:00.000Z",
      "updated_at": "2025-11-02T19:00:00.000Z"
    }
  ],
  "created_at": "2025-11-02T19:00:00.000Z",
  "updated_at": "2025-11-02T19:00:00.000Z"
}
```

#### Get All Shopping Lists

```bash
GET /api/v1/shopping-lists?status=active
```

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `sent`, `completed`)

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Weekend Shopping",
    "status": "active",
    "item_count": 2,
    "created_at": "2025-11-02T19:00:00.000Z",
    "updated_at": "2025-11-02T19:00:00.000Z"
  }
]
```

#### Get Single Shopping List

```bash
GET /api/v1/shopping-lists/:id
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Weekend Shopping",
  "status": "active",
  "items": [...],
  "created_at": "2025-11-02T19:00:00.000Z",
  "updated_at": "2025-11-02T19:00:00.000Z"
}
```

#### Update Shopping List

```bash
PUT /api/v1/shopping-lists/:id
Content-Type: application/json

{
  "name": "Updated Shopping List",
  "status": "completed"
}
```

**Response (200):** Updated shopping list object

#### Delete Shopping List

```bash
DELETE /api/v1/shopping-lists/:id
```

**Response (204):** No content

#### Send/Complete Shopping List

```bash
POST /api/v1/shopping-lists/:id/send
Content-Type: application/json

{
  "action": "complete"
}
```

**Actions:**
- `send`: Marks list as `sent`
- `complete`: Marks list as `completed`

**Response (200):** Updated shopping list object

### Shopping List Items

#### Add Item to List

```bash
POST /api/v1/shopping-lists/:listId/items
Content-Type: application/json

{
  "name": "Tomatoes",
  "quantity": "4",
  "notes": "Roma preferred"
}
```

**Response (201):** Created item object

#### Update Item

```bash
PUT /api/v1/shopping-lists/:listId/items/:itemId
Content-Type: application/json

{
  "name": "Cherry Tomatoes",
  "quantity": "1 pint",
  "notes": "Fresh"
}
```

**Response (200):** Updated item object

#### Delete Item

```bash
DELETE /api/v1/shopping-lists/:listId/items/:itemId
```

**Response (204):** No content

### Reminders

#### Create Reminder

```bash
POST /api/v1/reminders
Content-Type: application/json

{
  "shopping_list_id": "550e8400-e29b-41d4-a716-446655440000",
  "scheduled_at": "2025-11-03T10:00:00.000Z"
}
```

**Response (201):** Created reminder object

#### Update Reminder

```bash
PUT /api/v1/reminders/:id
Content-Type: application/json

{
  "scheduled_at": "2025-11-03T14:00:00.000Z",
  "status": "cancelled"
}
```

**Response (200):** Updated reminder object

#### Delete Reminder

```bash
DELETE /api/v1/reminders/:id
```

**Response (204):** No content

## Error Responses

All errors follow this format:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

**Status Codes:**
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Architecture

### Layered Design

```
Controllers (Express adapters)
    ↓
Services (business logic)
    ↓
Database (data access)
```

### Key Principles

- **Services contain all business logic** - Testable, framework-agnostic
- **Controllers are thin** - Just validate and delegate
- **Database is pure data access** - No validation, no logic
- **Dependency injection** - Services receive IDatabase interface
- **Strict TypeScript** - All code is type-safe

### Testing Strategy

- **Unit tests only** - No integration tests to avoid mocking complexity
- **Mock database** - Isolated testing with in-memory arrays
- **100% service coverage** - Business logic fully tested
- **TDD approach** - RED-GREEN-REFACTOR cycle

**Test Results:**
```
Test Suites: 7 passed, 7 total
Tests:       62 passed, 62 total
Coverage:    100% statements, 100% branches, 100% functions, 100% lines
```

## Database Schema

See [TECHNICAL_DOCUMENTATION.md](../.docs/TECHNICAL_DOCUMENTATION.md#database-schema) for detailed schema documentation.

**Tables:**
- `shopping_lists` - List metadata
- `shopping_list_items` - Items in lists
- `reminders` - Scheduled reminders (stub)

**Location:** `backend/data/shopping-list.db`

## Development Notes

### Code Quality

- **ESLint** configured with TypeScript support and strict rules
- **Pino logger** for structured JSON logging
- **Zod validation** for request validation
- **UUID v4** for all primary keys
- **ISO 8601** timestamps

### Future Enhancements

- Swagger/OpenAPI documentation (Task 4)
- JWT authentication (Task 8)
- PostgreSQL migration (production)
- Rate limiting & security headers
- Request tracing & monitoring

## License

ISC
