# Backend API

A Node.js backend with CRUD operations using MySQL database.

## Prerequisites

- Node.js installed
- MySQL server installed and running

## Installation

1. Navigate to the backend directory
2. Run `npm install`

## Database Setup

1. Create a MySQL database named `crud_app` (or update `.env` with your database name)
2. Update the database credentials in `.env` file if needed

## Running the Server

- Development: `npm run dev` (uses nodemon)
- Production: `npm start`

The server will run on port 5000 by default, or use the PORT environment variable.

## API Endpoints

### Items

- **GET /api/items** - Get all items
- **GET /api/items/:id** - Get a specific item by ID
- **POST /api/items** - Create a new item (send JSON in body)
- **PUT /api/items/:id** - Update an item by ID (send JSON in body)
- **DELETE /api/items/:id** - Delete an item by ID

### Example Usage

Create an item:
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Example Item", "description": "This is an example"}'
```

Get all items:
```bash
curl http://localhost:5000/api/items
```

## Dependencies

- Express: Web framework
- MySQL2: MySQL database driver
- CORS: Cross-origin resource sharing
- Dotenv: Environment variables
- Nodemon: Development tool for auto-restart