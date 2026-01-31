import type { Request, Response } from 'express';
import { CharacterService } from '../services/characterService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import type { ApiResponse } from '../types/index.js';

export class CharacterController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const characters = await CharacterService.getAll();
    const response: ApiResponse<typeof characters> = {
      success: true,
      data: characters,
    };
    res.json(response);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const character = await CharacterService.getById(id);
    const response: ApiResponse<typeof character> = {
      success: true,
      data: character,
    };
    res.json(response);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const character = await CharacterService.create(req.body);
    const response: ApiResponse<typeof character> = {
      success: true,
      data: character,
    };
    res.status(201).json(response);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const character = await CharacterService.update(id, req.body);
    const response: ApiResponse<typeof character> = {
      success: true,
      data: character,
    };
    res.json(response);
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await CharacterService.delete(id);
    res.status(204).send();
  });
}
