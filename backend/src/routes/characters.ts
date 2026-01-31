import { Router } from 'express';
import { CharacterController } from '../controllers/characterController.js';
import { validateRequest, characterSchema, characterUpdateSchema } from '../middleware/validation.js';

const router = Router();

router.get('/', CharacterController.getAll);
router.get('/:id', CharacterController.getById);
router.post('/', validateRequest(characterSchema), CharacterController.create);
router.put('/:id', validateRequest(characterUpdateSchema), CharacterController.update);
router.delete('/:id', CharacterController.delete);

export default router;
