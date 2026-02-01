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
    
    // Simple format: { characters: [...], characterBooks: [...] }
    let characters: CharacterWithImage[] = [];
    let characterBooks: CharacterBookDatabaseData[] = [];
    
    if (body && body.data && Array.isArray(body.data.characters)) {
      characters = body.data.characters;
    }
    if (body && body.data && Array.isArray(body.data.characterBooks)) {
      characterBooks = body.data.characterBooks;
    }
    
    // Import character books first
    for (const book of characterBooks) {
      try {
        await CharacterBookService.create(book);
      } catch (error) {
        console.error(`Failed to import character book: ${book.name}`, error);
      }
    }
    
    // Import characters
    for (const character of characters) {
      try {
        const { image, ...characterData } = character;
        const created = await CharacterService.create(characterData);
        
        // Save image if exists
        if (image) {
          const imagePath = this.saveImageFromBase64(created.id, image);
          await CharacterService.updateImagePath(created.id, imagePath);
        }
      } catch (error) {
        console.error(`Failed to import character: ${character.name}`, error);
      }
    }
    
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
