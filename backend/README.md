# Character Tools Backend

Backend API for Character Tools application, providing persistent storage using SQLite database.

## Overview

This backend provides a RESTful API for managing characters and character books with persistent SQLite filesystem storage.

## Features

- **RESTful API** for characters and character books
- **SQLite database** for persistent filesystem storage
- **Image upload** support for character avatars
- **Database export/import** for backup and migration
- **TypeScript** for type safety
- **Zod validation** for request validation

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # SQLite connection and schema
│   ├── controllers/
│   │   ├── characterController.ts
│   │   ├── characterBookController.ts
│   │   └── databaseController.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/
│   │   ├── characters.ts
│   │   ├── characterBooks.ts
│   │   └── database.ts
│   ├── services/
│   │   ├── characterService.ts
│   │   └── characterBookService.ts
│   ├── types/
│   │   └── index.ts
│   ├── scripts/
│   │   └── migrateFromIndexedDB.ts
│   └── index.ts                 # Server entry point
├── data/                        # SQLite database files
├── uploads/                     # Uploaded character images
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` to configure:

```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/character-tools.db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:5173
```

## Development

```bash
npm run dev
```

The server will start on `http://localhost:3000`

Verify it's running:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-31T16:00:00.000Z"
}
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## API Endpoints

### Characters

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/api/characters` | List all characters |
| GET | `/api/characters/:id` | Get single character |
| POST | `/api/characters` | Create character |
| PUT | `/api/characters/:id` | Update character |
| DELETE | `/api/characters/:id` | Delete character |

### Character Books

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/api/character-books` | List all character books |
| GET | `/api/character-books/:id` | Get single character book |
| POST | `/api/character-books` | Create character book |
| PUT | `/api/character-books/:id` | Update character book |
| DELETE | `/api/character-books/:id` | Delete character book |
| GET | `/api/character-books/:id/entries` | Get book entries |
| POST | `/api/character-books/:id/entries` | Add entry to book |
| PUT | `/api/character-books/entries/:entryId` | Update entry |
| DELETE | `/api/character-books/entries/:entryId` | Delete entry |

### Database Management

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/api/database/export` | Export entire database |
| POST | `/api/database/import` | Import database |
| DELETE | `/api/database` | Clear all data |
| GET | `/api/database/info` | Get database statistics |

### Health Check

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/api/health` | Health check endpoint |

## Database Schema

### characters
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `description` (TEXT)
- `personality` (TEXT)
- `mes_example` (TEXT)
- `scenario` (TEXT)
- `first_mes` (TEXT)
- `alternate_greetings` (TEXT, JSON array)
- `creator` (TEXT)
- `creator_notes` (TEXT)
- `character_version` (TEXT)
- `tags` (TEXT, JSON array)
- `system_prompt` (TEXT)
- `post_history_instructions` (TEXT)
- `character_book_id` (TEXT, FOREIGN KEY)
- `extensions` (TEXT, JSON object)
- `image_path` (TEXT)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### character_books
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `description` (TEXT)
- `scan_depth` (INTEGER)
- `token_budget` (INTEGER)
- `recursive_scanning` (INTEGER, boolean as 0/1)
- `extensions` (TEXT, JSON object)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### character_book_entries
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `character_book_id` (TEXT, NOT NULL, FOREIGN KEY)
- `name` (TEXT)
- `comment` (TEXT)
- `enabled` (INTEGER, boolean as 0/1)
- `case_sensitive` (INTEGER, boolean as 0/1)
- `selective` (INTEGER, boolean as 0/1)
- `constant` (INTEGER, boolean as 0/1)
- `position` (TEXT, 'before_char' or 'after_char')
- `keys` (TEXT, JSON array)
- `secondary_keys` (TEXT, JSON array)
- `content` (TEXT)
- `insertion_order` (INTEGER)
- `priority` (INTEGER)
- `extensions` (TEXT, JSON object)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

## Migration from IndexedDB

To migrate existing data from the frontend's IndexedDB:

1. Export data from the frontend app (Manage Database → Export)
2. Run migration script:

```bash
npm run migrate <path-to-export-file>
```

Example:
```bash
npm run migrate ../indexeddb-export.json
```

The script will:
- Create new IDs for all data
- Migrate character books first
- Migrate characters with their images
- Show progress for each item

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## Troubleshooting

### Backend won't start
**Problem:** `EADDRINUSE: address already in use`

**Solution:** Another process is using port 3000. Either:
- Stop the other process
- Change `PORT` in `.env`

### CORS errors
**Problem:** Browser console shows CORS errors

**Solution:** Check `CORS_ORIGIN` in `.env` matches your frontend URL:
- Development: `http://localhost:5173`
- Production: Your actual domain

### Migration fails
**Problem:** Migration script fails with errors

**Solution:**
1. Verify export file is valid JSON
2. Check that backend server is running
3. Review error messages for specific issues

### Images not loading
**Problem:** Character images show as broken

**Solution:**
1. Check images exist in `uploads/` directory
2. Verify `uploads/` directory permissions
3. Check image paths in database are correct

## Development Tips

- Use `npm run dev` for hot-reloading during development
- Check console logs for debugging
- Use `curl` or Postman to test API endpoints
- SQLite database file is at `data/character-tools.db`
- Images are stored in `uploads/` directory
