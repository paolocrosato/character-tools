import { Router } from 'express';
import { DatabaseController } from '../controllers/databaseController.js';

const router = Router();

router.get('/export', DatabaseController.exportDatabase);
router.post('/import', DatabaseController.importDatabase);
router.delete('/', DatabaseController.clearDatabase);
router.get('/info', DatabaseController.getDatabaseInfo);

export default router;
