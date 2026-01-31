import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { CharacterService } from '../services/characterService.js';
import { CharacterBookService } from '../services/characterBookService.js';
import type { CharacterWithImage, CharacterBookDatabaseData } from '../types/index.js';

interface IndexedDBExport {
  characters: CharacterWithImage[];
  characterBooks: CharacterBookDatabaseData[];
}

async function migrateData(exportFilePath: string) {
  console.log('Starting migration from IndexedDB export...');

  // Read export file
  if (!fs.existsSync(exportFilePath)) {
    console.error(`Export file not found: ${exportFilePath}`);
    process.exit(1);
  }

  const exportData: IndexedDBExport = JSON.parse(fs.readFileSync(exportFilePath, 'utf-8'));
  console.log(`Found ${exportData.characters.length} characters and ${exportData.characterBooks.length} character books`);

  // Map to track old ID to new ID
  const bookIdMap = new Map<string, string>();

  // Migrate character books first
  console.log('\nMigrating character books...');
  for (const book of exportData.characterBooks) {
    try {
      const newId = uuidv4();
      bookIdMap.set(book.id, newId);

      const bookData = {
        name: book.name,
        description: book.description || undefined,
        scan_depth: book.scan_depth || undefined,
        token_budget: book.token_budget || undefined,
        recursive_scanning: book.recursive_scanning || false,
        extensions: book.extensions || {},
        entries: book.entries || [],
      };

      await CharacterBookService.create(bookData);
      console.log(`  ✓ Migrated: ${book.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate character book: ${book.name}`, error);
    }
  }

  // Migrate characters
  console.log('\nMigrating characters...');
  for (const character of exportData.characters) {
    try {
      const newId = uuidv4();
      const bookId = character.character_book_id ? bookIdMap.get(character.character_book_id) : undefined;

      const characterData = {
        name: character.name,
        description: character.description || '',
        personality: character.personality || '',
        mes_example: character.mes_example || '',
        scenario: character.scenario || '',
        first_mes: character.first_mes || '',
        alternate_greetings: character.alternate_greetings || [],
        creator: character.creator || '',
        creator_notes: character.creator_notes || '',
        character_version: character.character_version || '',
        tags: character.tags || [],
        system_prompt: character.system_prompt || '',
        post_history_instructions: character.post_history_instructions || '',
        character_book_id: bookId,
        extensions: character.extensions || {},
      };

      const created = await CharacterService.create(characterData);

      // Save image if exists
      if (character.image) {
        const imagePath = saveImageFromBase64(created.id, character.image);
        await CharacterService.updateImagePath(created.id, imagePath);
      }

      console.log(`  ✓ Migrated: ${character.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate character: ${character.name}`, error);
    }
  }

  console.log('\n✅ Migration completed successfully!');
  console.log(`\nSummary:`);
  console.log(`  - Character books migrated: ${bookIdMap.size}`);
  console.log(`  - Characters migrated: ${exportData.characters.length}`);
}

function saveImageFromBase64(characterId: string, base64Image: string): string {
  const uploadsDir = process.env.UPLOAD_DIR || './uploads';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    console.warn(`  ⚠ Invalid base64 image format for character ${characterId}`);
    return '';
  }

  const ext = matches[1];
  const base64Data = matches[2];
  const imageBuffer = Buffer.from(base64Data, 'base64');
  
  const filename = `${characterId}.${ext}`;
  const imagePath = path.join(uploadsDir, filename);
  
  fs.writeFileSync(imagePath, imageBuffer);
  
  return `uploads/${filename}`;
}

// Main execution
const exportFilePath = process.argv[2];
if (!exportFilePath) {
  console.error('Usage: npm run migrate <path-to-export-file>');
  console.error('Example: npm run migrate ./indexeddb-export.json');
  process.exit(1);
}

migrateData(exportFilePath).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
