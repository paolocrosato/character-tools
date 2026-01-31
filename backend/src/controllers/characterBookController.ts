import type { Request, Response } from 'express';
import { CharacterBookService } from '../services/characterBookService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import type { ApiResponse } from '../types/index.js';

export class CharacterBookController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const books = await CharacterBookService.getAll();
    const response: ApiResponse<typeof books> = {
      success: true,
      data: books,
    };
    res.json(response);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const book = await CharacterBookService.getById(id);
    const response: ApiResponse<typeof book> = {
      success: true,
      data: book,
    };
    res.json(response);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const book = await CharacterBookService.create(req.body);
    const response: ApiResponse<typeof book> = {
      success: true,
      data: book,
    };
    res.status(201).json(response);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const book = await CharacterBookService.update(id, req.body);
    const response: ApiResponse<typeof book> = {
      success: true,
      data: book,
    };
    res.json(response);
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await CharacterBookService.delete(id);
    res.status(204).send();
  });

  static getEntries = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const entries = await CharacterBookService.getEntries(id);
    const response: ApiResponse<typeof entries> = {
      success: true,
      data: entries,
    };
    res.json(response);
  });

  static createEntry = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const entry = await CharacterBookService.createEntry(id, req.body);
    const response: ApiResponse<typeof entry> = {
      success: true,
      data: entry,
    };
    res.status(201).json(response);
  });

  static updateEntry = asyncHandler(async (req: Request, res: Response) => {
    const { entryId } = req.params;
    const entry = await CharacterBookService.updateEntry(parseInt(entryId, 10), req.body);
    const response: ApiResponse<typeof entry> = {
      success: true,
      data: entry,
    };
    res.json(response);
  });

  static deleteEntry = asyncHandler(async (req: Request, res: Response) => {
    const { entryId } = req.params;
    await CharacterBookService.deleteEntry(parseInt(entryId, 10));
    res.status(204).send();
  });
}
