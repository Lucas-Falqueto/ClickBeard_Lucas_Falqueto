import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { 
  calculateAvailableSlots, 
  scheduleAppointment, 
  fetchUserAppointments, 
  deactivateAppointment, 
  fetchAdminTodayAppointments, 
  fetchAdminFutureAppointments 
} from '../services/appointmentService';

export const getAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const barberId = req.query.barberId as string;
    const date = req.query.date as string;
    if (!barberId || !date) {
      return res.status(400).json({ error: 'barberId e date são obrigatórios' });
    }

    const slots = await calculateAvailableSlots(barberId, date);
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { barberId, specialtyId, scheduledAt } = req.body;
    const userId = req.user!.id;

    const appointment = await scheduleAppointment(userId, barberId, specialtyId, scheduledAt);
    res.status(201).json(appointment);
  } catch (error: any) {
    if (error.message === 'Barbeiro já possui agendamento neste horário.') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const appointments = await fetchUserAppointments(req.user!.id);
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    
    const cancelled = await deactivateAppointment(id, userId);
    res.json(cancelled);
  } catch (error: any) {
    if (['Agendamento não encontrado'].includes(error.message)) {
      return res.status(404).json({ error: error.message });
    }
    if (['Acesso negado'].includes(error.message)) {
      return res.status(403).json({ error: error.message });
    }
    if (['Agendamento não está ativo', 'Você não pode cancelar um agendamento que já passou.', 'Cancelamento permitido apenas com 2 horas de antecedência.'].includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const getAdminAppointmentsToday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await fetchAdminTodayAppointments();
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

export const getAdminAppointmentsFuture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await fetchAdminFutureAppointments();
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};
