import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import type { CharacterBookData, CharacterBookDatabaseData, CharacterBookEntry } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class CharacterBookService {
  private static readonly TABLE = 'character_books';
  private static readonly ENTRIES_TABLE = 'character_book_entries';

  static async getAll(): Promise<CharacterBookDatabaseData[]> {
    const stmt = db.prepare(`
      SELECT * FROM ${this.TABLE}
      ORDER BY updated_at DESC
    `);
    const rows = stmt.all() as any[];
    return await Promise.all(rows.map(row => this.mapRowToCharacterBook(row)));
  }

  static async getById(id: string): Promise<CharacterBookDatabaseData> {
    const stmt = db.prepare(`
      SELECT * FROM ${this.TABLE}
      WHERE id = ?
    `);
    const row = stmt.get(id) as any;
    if (!row) {
      throw new AppError(404, 'NOT_FOUND', 'Character Book not found');
    }
    return await this.mapRowToCharacterBook(row);
  }

  static async create(data: CharacterBookData): Promise<CharacterBookDatabaseData> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO ${this.TABLE} (
        id, name, description, scan_depth, token_budget,
        recursive_scanning, extensions, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.name,
      data.description || null,
      data.scan_depth || null,
      data.token_budget || null,
      data.recursive_scanning ? 1 : 0,
      JSON.stringify(data.extensions || {}),
      now,
      now
    );

    // Insert entries
    for (const entry of data.entries) {
      await this.createEntry(id, entry);
    }

    return this.getById(id);
  }

  static async update(id: string, data: Partial<CharacterBookData>): Promise<CharacterBookDatabaseData> {
    const existing = await this.getById(id);
    const now = new Date().toISOString();

    const updates: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.scan_depth !== undefined) {
      updates.push('scan_depth = ?');
      values.push(data.scan_depth);
    }
    if (data.token_budget !== undefined) {
      updates.push('token_budget = ?');
      values.push(data.token_budget);
    }
    if (data.recursive_scanning !== undefined) {
      updates.push('recursive_scanning = ?');
      values.push(data.recursive_scanning ? 1 : 0);
    }
    if (data.extensions !== undefined) {
      updates.push('extensions = ?');
      values.push(JSON.stringify(data.extensions));
    }

    values.push(id);

    const stmt = db.prepare(`
      UPDATE ${this.TABLE}
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    // Update entries if provided
    if (data.entries !== undefined) {
      // Delete existing entries
      const deleteStmt = db.prepare(`DELETE FROM ${this.ENTRIES_TABLE} WHERE character_book_id = ?`);
      deleteStmt.run(id);

      // Insert new entries
      for (const entry of data.entries) {
        await this.createEntry(id, entry);
      }
    }

    return this.getById(id);
  }

  static async delete(id: string): Promise<void> {
    const stmt = db.prepare(`DELETE FROM ${this.TABLE} WHERE id = ?`);
    const result = stmt.run(id);
    if (result.changes === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Character Book not found');
    }
  }

  static async getEntries(id: string): Promise<CharacterBookEntry[]> {
    const stmt = db.prepare(`
      SELECT * FROM ${this.ENTRIES_TABLE}
      WHERE character_book_id = ?
      ORDER BY insertion_order ASC
    `);
    const rows = stmt.all(id) as any[];
    return rows.map(this.mapRowToEntry);
  }

  static async createEntry(characterBookId: string, data: CharacterBookEntry): Promise<CharacterBookEntry> {
    const stmt = db.prepare(`
      INSERT INTO ${this.ENTRIES_TABLE} (
        character_book_id, name, comment, enabled, case_sensitive,
        selective, constant, position, keys, secondary_keys,
        content, insertion_order, priority, extensions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      characterBookId,
      data.name || null,
      data.comment || null,
      data.enabled ? 1 : 0,
      data.case_sensitive ? 1 : 0,
      data.selective ? 1 : 0,
      data.constant ? 1 : 0,
      data.position || 'after_char',
      JSON.stringify(data.keys || []),
      JSON.stringify(data.secondary_keys || []),
      data.content || null,
      data.insertion_order,
      data.priority || null,
      JSON.stringify(data.extensions || {})
    );

    return this.getEntryById(result.lastInsertRowid as number);
  }

  static async updateEntry(entryId: number, data: Partial<CharacterBookEntry>): Promise<CharacterBookEntry> {
    const existing = await this.getEntryById(entryId);
    const now = new Date().toISOString();

    const updates: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.comment !== undefined) {
      updates.push('comment = ?');
      values.push(data.comment);
    }
    if (data.enabled !== undefined) {
      updates.push('enabled = ?');
      values.push(data.enabled ? 1 : 0);
    }
    if (data.case_sensitive !== undefined) {
      updates.push('case_sensitive = ?');
      values.push(data.case_sensitive ? 1 : 0);
    }
    if (data.selective !== undefined) {
      updates.push('selective = ?');
      values.push(data.selective ? 1 : 0);
    }
    if (data.constant !== undefined) {
      updates.push('constant = ?');
      values.push(data.constant ? 1 : 0);
    }
    if (data.position !== undefined) {
      updates.push('position = ?');
      values.push(data.position);
    }
    if (data.keys !== undefined) {
      updates.push('keys = ?');
      values.push(JSON.stringify(data.keys));
    }
    if (data.secondary_keys !== undefined) {
      updates.push('secondary_keys = ?');
      values.push(JSON.stringify(data.secondary_keys));
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(data.content);
    }
    if (data.insertion_order !== undefined) {
      updates.push('insertion_order = ?');
      values.push(data.insertion_order);
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      values.push(data.priority);
    }
    if (data.extensions !== undefined) {
      updates.push('extensions = ?');
      values.push(JSON.stringify(data.extensions));
    }

    values.push(entryId);

    const stmt = db.prepare(`
      UPDATE ${this.ENTRIES_TABLE}
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.getEntryById(entryId);
  }

  static async deleteEntry(entryId: number): Promise<void> {
    const stmt = db.prepare(`DELETE FROM ${this.ENTRIES_TABLE} WHERE id = ?`);
    const result = stmt.run(entryId);
    if (result.changes === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Entry not found');
    }
  }

  private static async getEntryById(id: number): Promise<CharacterBookEntry> {
    const stmt = db.prepare(`SELECT * FROM ${this.ENTRIES_TABLE} WHERE id = ?`);
    const row = stmt.get(id) as any;
    if (!row) {
      throw new AppError(404, 'NOT_FOUND', 'Entry not found');
    }
    return this.mapRowToEntry(row);
  }

  private static async mapRowToCharacterBook(row: any): Promise<CharacterBookDatabaseData> {
    const entries = await this.getEntries(row.id);
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      scan_depth: row.scan_depth || undefined,
      token_budget: row.token_budget || undefined,
      recursive_scanning: row.recursive_scanning === 1,
      extensions: JSON.parse(row.extensions || '{}'),
      entries,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private static mapRowToEntry(row: any): CharacterBookEntry {
    return {
      id: row.id,
      name: row.name || undefined,
      comment: row.comment || undefined,
      enabled: row.enabled === 1,
      case_sensitive: row.case_sensitive === 1,
      selective: row.selective === 1,
      constant: row.constant === 1,
      position: row.position || 'after_char',
      keys: JSON.parse(row.keys || '[]'),
      secondary_keys: JSON.parse(row.secondary_keys || '[]'),
      content: row.content || '',
      insertion_order: row.insertion_order,
      priority: row.priority || undefined,
      extensions: JSON.parse(row.extensions || '{}'),
    };
  }
}
