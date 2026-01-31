import type { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { AppError } from './errorHandler.js';

export function validateRequest<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'Invalid request data',
          error.errors
        );
      }
      next(error);
    }
  };
}

// Character validation schemas
export const characterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  personality: z.string().optional(),
  mes_example: z.string().optional(),
  scenario: z.string().optional(),
  first_mes: z.string().optional(),
  alternate_greetings: z.array(z.string()).default([]),
  creator: z.string().optional(),
  creator_notes: z.string().optional(),
  character_version: z.string().optional(),
  tags: z.array(z.string()).default([]),
  system_prompt: z.string().optional(),
  post_history_instructions: z.string().optional(),
  character_book_id: z.string().uuid().optional(),
  extensions: z.record(z.unknown()).default({}),
});

export const characterUpdateSchema = characterSchema.partial();

// Character Book validation schemas
export const characterBookSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  scan_depth: z.number().int().optional(),
  token_budget: z.number().int().optional(),
  recursive_scanning: z.boolean().optional(),
  extensions: z.record(z.unknown()).default({}),
  entries: z.array(
    z.object({
      name: z.string().optional(),
      comment: z.string().optional(),
      enabled: z.boolean().default(true),
      case_sensitive: z.boolean().default(false),
      selective: z.boolean().default(false),
      constant: z.boolean().default(false),
      position: z.enum(['before_char', 'after_char']).default('after_char'),
      keys: z.array(z.string()).default([]),
      secondary_keys: z.array(z.string()).default([]),
      content: z.string().optional(),
      insertion_order: z.number().int(),
      priority: z.number().int().optional(),
      extensions: z.record(z.unknown()).default({}),
    })
  ).default([]),
});

export const characterBookUpdateSchema = characterBookSchema.partial();

export const characterBookEntrySchema = z.object({
  name: z.string().optional(),
  comment: z.string().optional(),
  enabled: z.boolean().default(true),
  case_sensitive: z.boolean().default(false),
  selective: z.boolean().default(false),
  constant: z.boolean().default(false),
  position: z.enum(['before_char', 'after_char']).default('after_char'),
  keys: z.array(z.string()).default([]),
  secondary_keys: z.array(z.string()).default([]),
  content: z.string().optional(),
  insertion_order: z.number().int(),
  priority: z.number().int().optional(),
  extensions: z.record(z.unknown()).default({}),
});

export const characterBookEntryUpdateSchema = characterBookEntrySchema.partial();
