import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import type { CharacterData, CharacterDatabaseData, CharacterWithImage } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class CharacterService {
  private static readonly TABLE = 'characters';

  static async getAll(): Promise<CharacterDatabaseData[]> {
    const stmt = db.prepare(`
      SELECT * FROM ${this.TABLE}
      ORDER BY updated_at DESC
    `);
    const rows = stmt.all() as any[];
    return rows.map(this.mapRowToCharacter);
  }

  static async getById(id: string): Promise<CharacterDatabaseData> {
    const stmt = db.prepare(`
      SELECT * FROM ${this.TABLE}
      WHERE id = ?
    `);
    const row = stmt.get(id) as any;
    if (!row) {
      throw new AppError(404, 'NOT_FOUND', 'Character not found');
    }
    return this.mapRowToCharacter(row);
  }

  static async create(data: CharacterData): Promise<CharacterDatabaseData> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO ${this.TABLE} (
        id, name, description, personality, mes_example, scenario,
        first_mes, alternate_greetings, creator, creator_notes,
        character_version, tags, system_prompt, post_history_instructions,
        character_book_id, extensions, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.name,
      data.description || null,
      data.personality || null,
      data.mes_example || null,
      data.scenario || null,
      data.first_mes || null,
      JSON.stringify(data.alternate_greetings || []),
      data.creator || null,
      data.creator_notes || null,
      data.character_version || null,
      JSON.stringify(data.tags || []),
      data.system_prompt || null,
      data.post_history_instructions || null,
      data.character_book_id || null,
      JSON.stringify(data.extensions || {}),
      now,
      now
    );

    return this.getById(id);
  }

  static async update(id: string, data: Partial<CharacterData>): Promise<CharacterDatabaseData> {
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
    if (data.personality !== undefined) {
      updates.push('personality = ?');
      values.push(data.personality);
    }
    if (data.mes_example !== undefined) {
      updates.push('mes_example = ?');
      values.push(data.mes_example);
    }
    if (data.scenario !== undefined) {
      updates.push('scenario = ?');
      values.push(data.scenario);
    }
    if (data.first_mes !== undefined) {
      updates.push('first_mes = ?');
      values.push(data.first_mes);
    }
    if (data.alternate_greetings !== undefined) {
      updates.push('alternate_greetings = ?');
      values.push(JSON.stringify(data.alternate_greetings));
    }
    if (data.creator !== undefined) {
      updates.push('creator = ?');
      values.push(data.creator);
    }
    if (data.creator_notes !== undefined) {
      updates.push('creator_notes = ?');
      values.push(data.creator_notes);
    }
    if (data.character_version !== undefined) {
      updates.push('character_version = ?');
      values.push(data.character_version);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(data.tags));
    }
    if (data.system_prompt !== undefined) {
      updates.push('system_prompt = ?');
      values.push(data.system_prompt);
    }
    if (data.post_history_instructions !== undefined) {
      updates.push('post_history_instructions = ?');
      values.push(data.post_history_instructions);
    }
    if (data.character_book_id !== undefined) {
      updates.push('character_book_id = ?');
      values.push(data.character_book_id);
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

    return this.getById(id);
  }

  static async delete(id: string): Promise<void> {
    const stmt = db.prepare(`DELETE FROM ${this.TABLE} WHERE id = ?`);
    const result = stmt.run(id);
    if (result.changes === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Character not found');
    }
  }

  static async updateImagePath(id: string, imagePath: string | null): Promise<void> {
    const stmt = db.prepare(`
      UPDATE ${this.TABLE}
      SET image_path = ?, updated_at = ?
      WHERE id = ?
    `);
    const now = new Date().toISOString();
    const result = stmt.run(imagePath, now, id);
    if (result.changes === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Character not found');
    }
  }

  static async getImagePath(id: string): Promise<string | null> {
    const stmt = db.prepare(`SELECT image_path FROM ${this.TABLE} WHERE id = ?`);
    const row = stmt.get(id) as any;
    if (!row) {
      throw new AppError(404, 'NOT_FOUND', 'Character not found');
    }
    return row.image_path;
  }

  private static mapRowToCharacter(row: any): CharacterDatabaseData {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      personality: row.personality || '',
      mes_example: row.mes_example || '',
      scenario: row.scenario || '',
      first_mes: row.first_mes || '',
      alternate_greetings: JSON.parse(row.alternate_greetings || '[]'),
      creator: row.creator || '',
      creator_notes: row.creator_notes || '',
      character_version: row.character_version || '',
      tags: JSON.parse(row.tags || '[]'),
      system_prompt: row.system_prompt || '',
      post_history_instructions: row.post_history_instructions || '',
      character_book_id: row.character_book_id || undefined,
      extensions: JSON.parse(row.extensions || '{}'),
      image_path: row.image_path || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
