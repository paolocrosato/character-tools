import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import type { ApiResponse, CharacterWithImage, CharacterBookDatabaseData } from '../types/index.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { CharacterService } from '../services/characterService.js';
import { CharacterBookService } from '../services/characterBookService.js';

export class DatabaseController {
  static exportDatabase = asyncHandler(async (req: Request, res: Response) => {
    const characters = await CharacterService.getAll();
    const characterBooks = await CharacterBookService.getAll();

    const exportData = {
      characters: characters.map(c => ({
        ...c,
        image: c.image_path ? this.getImageAsBase64(c.image_path) : undefined,
      })),
      characterBooks,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=character-tools-export.json');
    res.send(JSON.stringify(exportData, null, 2));
  });

  static importDatabase = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body;
    
    // Log received data for debugging
    console.log('=== DEBUG: Import Database ===');
    console.log('Data type:', typeof body);
    console.log('Has formatName?', body?.formatName);
    console.log('body.data keys:', body?.data ? Object.keys(body.data) : 'no data');
    console.log('body.data.tables exists?', body?.data?.tables !== undefined);
    console.log('body.data.tables type:', typeof body?.data?.tables);
    console.log('body.data.tables length:', Array.isArray(body?.data?.tables) ? body.data.tables.length : 'N/A');
    console.log('body.data.data exists?', body?.data?.data !== undefined);
    console.log('body.data.data type:', typeof body?.data?.data);
    console.log('body.data.data length:', Array.isArray(body?.data?.data) ? body.data.data.length : 'N/A');
    
    if (body?.data?.tables && body.data.tables.length > 0) {
      console.log('First item in body.data.tables:', JSON.stringify(body.data.tables[0], null, 2));
    }
    if (body?.data?.data && body.data.data.length > 0) {
      console.log('First item in body.data.data:', JSON.stringify(body.data.data[0], null, 2));
    }
    
    // Handle both Dexie export format and simple format
    let characters: CharacterWithImage[] = [];
    let characterBooks: CharacterBookDatabaseData[] = [];
    
    if (body.formatName === 'dexie' && Array.isArray(body.data?.tables)) {
      // Dexie export format
      console.log('Processing Dexie export format - looking in body.data.tables');
      for (const table of body.data.data) {
        console.log(`Checking table: ${JSON.stringify(table)}`);
        if (table.tableName === 'characters' && Array.isArray(table.rows)) {
          characters = table.rows;
          console.log('Found characters in body.data.data');
        } else if (table.tableName === 'characterBooks' && Array.isArray(table.rows)) {
          characterBooks = table.rows;
          console.log('Found characterBooks in body.data.data');
        }
      }
    } else {
      // Simple format: { characters: [...], characterBooks: [...] }
      if (body && body.data && Array.isArray(body.data.characters)) {
        characters = body.data.characters;
      }
      if (body && body.data && Array.isArray(body.data.characterBooks)) {
        characterBooks = body.data.characterBooks;
      }
    }
    
    console.log('Parsed characters:', characters.length);
    console.log('Parsed characterBooks:', characterBooks.length);
    
    // Import character books first
    for (const book of characterBooks) {
      try {
        await CharacterBookService.create(book);
      } catch (error) {
        console.error(`Failed to import character book: ${book.name}`, error);
      }
    }
    
    // Import characters
    console.log(`Starting to import ${characters.length} characters...`);
    for (const character of characters) {
      try {
        console.log(`Importing character: ${character.name}`);
        const { image, ...characterData } = character;
        const created = await CharacterService.create(characterData);
        console.log(`✓ Successfully created character with ID: ${created.id}`);
        
        // Save image if exists
        if (image) {
          const imagePath = this.saveImageFromBase64(created.id, image);
          await CharacterService.updateImagePath(created.id, imagePath);
          console.log(`✓ Saved image for character: ${created.id}`);
        }
      } catch (error) {
        console.error(`✗ Failed to import character: ${character.name}`, error);
      }
    }
    console.log('Finished importing characters');
    
    // Verify characters were actually saved
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM characters');
    const countResult = countStmt.get() as { count: number };
    console.log(`Total characters in database after import: ${countResult.count}`);
    
    const response: ApiResponse<{ imported: number }> = {
      success: true,
      data: {
        imported: characters.length + characterBooks.length,
      },
    };
    res.json(response);
  });

  static clearDatabase = asyncHandler(async (req: Request, res: Response) => {
    db.exec('DELETE FROM character_book_entries');
    db.exec('DELETE FROM character_books');
    db.exec('DELETE FROM characters');

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Database cleared successfully',
      },
    };
    res.json(response);
  });

  static getDatabaseInfo = asyncHandler(async (req: Request, res: Response) => {
    const characterCount = db.prepare('SELECT COUNT(*) as count FROM characters').get() as { count: number };
    const bookCount = db.prepare('SELECT COUNT(*) as count FROM character_books').get() as { count: number };
    const entryCount = db.prepare('SELECT COUNT(*) as count FROM character_book_entries').get() as { count: number };

    const dbPath = process.env.DATABASE_PATH || './data/character-tools.db';
    const dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;

    const response: ApiResponse<any> = {
      success: true,
      data: {
        characters: characterCount.count,
        characterBooks: bookCount.count,
        entries: entryCount.count,
        databaseSize: dbSize,
        databasePath: dbPath,
      },
    };
    res.json(response);
  });

  private static getImageAsBase64(imagePath: string): string | undefined {
    if (!imagePath) return undefined;
    
    const fullPath = path.join(process.cwd(), imagePath);
    if (!fs.existsSync(fullPath)) return undefined;

    const imageBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).slice(1);
    return `data:image/${ext};base64,${imageBuffer.toString('base64')}`;
  }

  private static saveImageFromBase64(characterId: string, base64Image: string): string {
    const uploadsDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image format');
    }

    const ext = matches[1];
    const base64Data = matches[2];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const filename = `${characterId}.${ext}`;
    const imagePath = path.join(uploadsDir, filename);

    fs.writeFileSync(imagePath, imageBuffer);

    return `uploads/${filename}`;
  }
}
