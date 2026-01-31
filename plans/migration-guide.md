# Migration Guide: IndexedDB to SQLite

This guide explains how to migrate the Character Tools application from browser-based IndexedDB storage to persistent SQLite filesystem storage.

---

## Overview

The migration involves:
1. **Backend Setup** - Install and run the new Node.js/Express backend with SQLite
2. **Frontend Configuration** - Update the frontend to use the new API
3. **Data Migration** - Export existing data and import to SQLite
4. **Testing** - Verify everything works correctly

---

## Prerequisites

- Node.js 20+ installed
- Bun or npm package manager
- Existing Character Tools application with data in IndexedDB

---

## Step 1: Backend Setup

### 1.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 1.2 Configure Environment

Copy `.env.example` to `.env`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` if needed (defaults should work for development):

```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/character-tools.db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:5173
```

### 1.3 Start the Backend Server

```bash
cd backend
npm run dev
```

The server should start on `http://localhost:3000`

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

---

## Step 2: Frontend Setup

### 2.1 Install Frontend Dependencies

```bash
# From project root
bun install
```

### 2.2 Configure Environment

Create `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` to point to the backend API:

```env
VITE_API_URL=http://localhost:3000/api
```

### 2.3 Start the Frontend

```bash
bun run dev
```

The frontend should start on `http://localhost:5173`

---

## Step 3: Data Migration

### 3.1 Export Data from IndexedDB

1. Open the Character Tools application in your browser
2. Navigate to **Manage Database**
3. Click **Export Database**
4. Save the exported file as `indexeddb-export.json`

### 3.2 Import Data to SQLite

Run the migration script:

```bash
cd backend
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

Expected output:
```
Starting migration from IndexedDB export...
Found 5 characters and 3 character books

Migrating character books...
  ✓ Migrated: Fantasy World
  ✓ Migrated: Sci-Fi Universe
  ✓ Migrated: Medieval Setting

Migrating characters...
  ✓ Migrated: Alice
  ✓ Migrated: Bob
  ✓ Migrated: Charlie
  ✓ Migrated: Diana
  ✓ Migrated: Eve

✅ Migration completed successfully!

Summary:
  - Character books migrated: 3
  - Characters migrated: 5
```

---

## Step 4: Verify Migration

### 4.1 Check Backend Data

Visit `http://localhost:3000/api/database/info` to see statistics:

```json
{
  "success": true,
  "data": {
    "characters": 5,
    "characterBooks": 3,
    "entries": 15,
    "databaseSize": 24576,
    "databasePath": "./data/character-tools.db"
  }
}
```

### 4.2 Check Frontend

1. Navigate to **Character Library**
2. Verify all characters are displayed
3. Navigate to **CharacterBook Library**
4. Verify all character books are displayed
5. Open a character and verify all data is correct
6. Open a character book and verify entries are correct

---

## Step 5: Update Frontend Code (Optional)

The API client layer is already created in `src/services/api/`. To fully migrate the frontend, you need to replace Dexie calls with API calls in the following files:

### Files to Update

| File | Current Implementation | New Implementation |
|-------|---------------------|-------------------|
| `src/services/character.ts` | Dexie calls | `characterApi` from `@/services/api` |
| `src/services/characterBooks.ts` | Dexie calls | `characterBookApi` from `@/services/api` |
| `src/services/database.ts` | Dexie export/import | `databaseApi` from `@/services/api` |

### Example Migration

**Before (Dexie):**
```typescript
import { dataBase } from '@/lib/dexie'

export const getAllCharacters = async () => {
  return await dataBase.characters.toArray()
}
```

**After (API):**
```typescript
import { characterApi } from '@/services/api'

export const getAllCharacters = async () => {
  return await characterApi.getAll()
}
```

---

## Step 6: Production Deployment

### 6.1 Build Backend

```bash
cd backend
npm run build
npm start
```

### 6.2 Build Frontend

```bash
bun run build
```

### 6.3 Serve with Reverse Proxy

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name character-tools.example.com;

    # Frontend
    location / {
        root /path/to/character-tools/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded images
    location /uploads/ {
        root /path/to/character-tools/backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Backup and Restore

### Backup Database

```bash
# Via API
curl http://localhost:3000/api/database/export -o backup.json

# Via file system
cp backend/data/character-tools.db backup.db
```

### Restore Database

```bash
# Via API
curl -X POST http://localhost:3000/api/database/import \
  -H "Content-Type: application/json" \
  -d @backup.json

# Via file system
cp backup.db backend/data/character-tools.db
```

---

## Troubleshooting

### Backend Won't Start

**Problem:** `EADDRINUSE: address already in use`

**Solution:** Another process is using port 3000. Either:
- Stop the other process
- Change the PORT in `backend/.env`

### CORS Errors

**Problem:** Browser console shows CORS errors

**Solution:** Check `CORS_ORIGIN` in `backend/.env` matches your frontend URL:
- Development: `http://localhost:5173`
- Production: Your actual domain

### Migration Fails

**Problem:** Migration script fails with errors

**Solution:**
1. Verify the export file is valid JSON
2. Check the backend server is running
3. Review the error messages for specific issues

### Images Not Loading

**Problem:** Character images show as broken

**Solution:**
1. Check images exist in `backend/uploads/`
2. Verify `uploads/` directory permissions
3. Check image paths in database are correct

---

## Rollback Plan

If you need to rollback to IndexedDB:

1. Stop the backend server
2. Remove the `.env` file (or set `VITE_API_URL` to empty)
3. The frontend will fall back to using Dexie/IndexedDB
4. Your data is still in the browser's IndexedDB

---

## Next Steps

After successful migration:

1. **Remove Dexie dependencies** (optional):
   ```bash
   bun remove dexie dexie-react-hooks dexie-export-import
   ```

2. **Update documentation** to reflect the new architecture

3. **Set up automated backups** of the SQLite database

4. **Consider adding authentication** for multi-user scenarios

---

## Support

For issues or questions:
- Check the backend logs for errors
- Review the migration plan at `plans/migration-to-sqlite.md`
- Open an issue on GitHub
