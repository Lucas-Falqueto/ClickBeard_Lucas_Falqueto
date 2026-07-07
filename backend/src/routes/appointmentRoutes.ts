import { Router } from 'express';
import { 
  getAvailableSlots, 
  createAppointment, 
  getMyAppointments, 
  cancelAppointment, 
  getAdminAppointmentsToday, 
  getAdminAppointmentsFuture 
} from '../controllers/appointmentController';
import { authenticate } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createAppointmentSchema } from '../schemas/appointmentSchemas';

const router = Router();

router.get('/available', getAvailableSlots);
router.post('/', authenticate, validateRequest(createAppointmentSchema), createAppointment);
router.get('/me', authenticate, getMyAppointments);
router.delete('/:id', authenticate, cancelAppointment);
router.get('/admin/today', authenticate, adminMiddleware, getAdminAppointmentsToday);
router.get('/admin/future', authenticate, adminMiddleware, getAdminAppointmentsFuture);

export default router;
