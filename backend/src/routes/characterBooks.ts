import { Router } from 'express';
import { CharacterBookController } from '../controllers/characterBookController.js';
import {
  validateRequest,
  characterBookSchema,
  characterBookUpdateSchema,
  characterBookEntrySchema,
  characterBookEntryUpdateSchema,
} from '../middleware/validation.js';

const router = Router();

// Character Book routes
router.get('/', CharacterBookController.getAll);
router.get('/:id', CharacterBookController.getById);
router.post('/', validateRequest(characterBookSchema), CharacterBookController.create);
router.put('/:id', validateRequest(characterBookUpdateSchema), CharacterBookController.update);
router.delete('/:id', CharacterBookController.delete);

// Entry routes
router.get('/:id/entries', CharacterBookController.getEntries);
router.post('/:id/entries', validateRequest(characterBookEntrySchema), CharacterBookController.createEntry);
router.put('/entries/:entryId', validateRequest(characterBookEntryUpdateSchema), CharacterBookController.updateEntry);
router.delete('/entries/:entryId', CharacterBookController.deleteEntry);

export default router;
