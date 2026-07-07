import { Router } from 'express';
import { getSpecialties, createSpecialty, deleteSpecialty } from '../controllers/specialtyController';
import { authenticate } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createSpecialtySchema } from '../schemas/specialtySchemas';

const router = Router();

router.get('/', getSpecialties);
router.post('/', authenticate, adminMiddleware, validateRequest(createSpecialtySchema), createSpecialty);
router.delete('/:id', authenticate, adminMiddleware, deleteSpecialty);

export default router;
