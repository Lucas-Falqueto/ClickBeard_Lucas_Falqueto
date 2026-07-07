import { Router } from 'express';
import authRoutes from './authRoutes';
import barberRoutes from './barberRoutes';
import specialtyRoutes from './specialtyRoutes';
import appointmentRoutes from './appointmentRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/barbers', barberRoutes);
router.use('/specialties', specialtyRoutes);
router.use('/appointments', appointmentRoutes);

export default router;
