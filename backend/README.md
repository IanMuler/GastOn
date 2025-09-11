# GastOn Backend API

Backend API for the GastOn expense tracking mobile application. Built with Express.js, PostgreSQL, and following clean architecture principles.

## Features

- 🏗️ **Clean Architecture**: Separation of concerns with Models, Services, Controllers
- 🔒 **Security**: Helmet, CORS, rate limiting, input validation
- ⚡ **Performance**: Database connection pooling, optimized queries
- 🛡️ **Error Handling**: Centralized error handling with consistent responses
- 📝 **Validation**: Comprehensive input validation with express-validator
- 🎯 **TypeScript Ready**: Structured for easy TypeScript migration
- 📊 **Database**: PostgreSQL with optimized indexes and views

## Quick Start

### Prerequisites

- Node.js 16+ 
- PostgreSQL 13+
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
Copy the `.env` file from the root directory with the Neon PostgreSQL configuration.

3. **Setup database**
```bash
# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

4. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/stats` - Get categories with usage statistics

### Expense Names
- `GET /api/expense-names` - Get all expense names
- `POST /api/expense-names` - Create new expense name
- `PUT /api/expense-names/:id` - Update expense name
- `DELETE /api/expense-names/:id` - Delete expense name
- `GET /api/expense-names/by-category/:categoryId` - Get names by category

### Expenses
- `GET /api/expenses/weekly/:date` - Get weekly expenses
- `GET /api/expenses/weekly/current` - Get current week expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD` - Get expenses by date range

## Architecture

```
src/
├── config/           # Database and environment configuration
├── models/           # Data models with CRUD operations
│   └── base/         # Base model for DRY principles
├── services/         # Business logic layer
├── controllers/      # HTTP request handlers
├── routes/           # API route definitions
├── middleware/       # Validation and error handling
├── utils/            # Utility classes and helpers
└── db/migrations/    # Database schema and seeds
```

## Database Schema

### Tables
- `categorias` - Expense categories with colors
- `nombres_gastos` - Predefined expense names with suggested categories
- `gastos` - Individual expense records

### Key Features
- Optimized indexes for query performance
- Automatic timestamp updates
- Data integrity constraints
- Useful views for common queries

## Development

### Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run db:migrate  # Run database migrations
npm run db:seed     # Seed database with initial data
npm test           # Run tests (when implemented)
npm run lint       # Lint code
```

### Environment Variables

Required environment variables (already configured in root `.env`):

```env
DATABASE_URL=postgresql://user:password@host:port/database
DB_HOST=host
DB_PORT=5432
DB_NAME=database
DB_USER=user
DB_PASSWORD=password
DB_SSL=true
API_PORT=3000
NODE_ENV=development
```

## API Usage Examples

### Create a Category
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Comida", "color": "#EF4444"}'
```

### Create an Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 850.50,
    "fecha": "2025-01-10",
    "categoria_id": 1,
    "nombre_gasto_id": 1,
    "descripcion": "Almuerzo en el trabajo"
  }'
```

### Get Weekly Expenses
```bash
curl http://localhost:3000/api/expenses/weekly/2025-01-10
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "monto",
      "message": "Amount must be a positive number",
      "value": -10
    }
  ],
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up proper CORS origins
4. Use a process manager like PM2
5. Set up reverse proxy (nginx)
6. Configure logging and monitoring

## Health Checks

- `GET /health` - Application health status
- `GET /api/expenses/health` - Database connectivity check

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- Error information sanitization in production

## Performance Optimizations

- Database connection pooling
- Optimized database indexes
- Query result caching (model level)
- Request timeout handling
- Efficient date range queries

## Support

For questions or issues, refer to the main project documentation or create an issue in the repository.