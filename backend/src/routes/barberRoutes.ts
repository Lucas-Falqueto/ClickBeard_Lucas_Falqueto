import { Router } from 'express';
import { getBarbers, getBarber, createBarber, deleteBarber, updateBarber } from '../controllers/barberController';
import { authenticate } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createBarberSchema, updateBarberSchema } from '../schemas/barberSchemas';

const router = Router();

router.get('/', getBarbers);
router.get('/:id', getBarber);
router.post('/', authenticate, adminMiddleware, validateRequest(createBarberSchema), createBarber);
router.put('/:id', authenticate, adminMiddleware, validateRequest(updateBarberSchema), updateBarber);
router.delete('/:id', authenticate, adminMiddleware, deleteBarber);

export default router;
