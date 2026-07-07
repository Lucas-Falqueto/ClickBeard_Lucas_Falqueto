import { prisma } from '../config/db';
import { addMinutes, parseISO, startOfDay, endOfDay } from 'date-fns';

export const calculateAvailableSlots = async (barberId: string, date: string) => {
  const targetDate = parseISO(date);
  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const appointments = await prisma.appointment.findMany({
    where: {
      barberId,
      status: 'scheduled',
      scheduledAt: { gte: start, lte: end }
    }
  });

  const busyTimes = appointments.map(app => app.scheduledAt.getTime());

  const slots = [];
  const openTime = new Date(start);
  openTime.setHours(8, 0, 0, 0);
  const closeTime = new Date(start);
  closeTime.setHours(18, 0, 0, 0);
  const now = new Date();

  let currentTime = openTime;
  while (currentTime < closeTime) {
    const slotTime = currentTime.getTime();
    if (slotTime > now.getTime() && !busyTimes.includes(slotTime)) {
      slots.push(new Date(slotTime));
    }
    currentTime = addMinutes(currentTime, 30);
  }

  return slots;
};

export const scheduleAppointment = async (userId: string, barberId: string, specialtyId: string, scheduledAt: string) => {
  const date = new Date(scheduledAt);

  const conflict = await prisma.appointment.findFirst({
    where: {
      barberId,
      status: 'scheduled',
      scheduledAt: date
    }
  });

  if (conflict) {
    throw new Error('Barbeiro já possui agendamento neste horário.');
  }

  return await prisma.appointment.create({
    data: {
      userId,
      barberId,
      specialtyId,
      scheduledAt: date,
    }
  });
};

export const fetchUserAppointments = async (userId: string) => {
  return await prisma.appointment.findMany({
    where: { 
      userId,
      scheduledAt: { gte: new Date() }
    },
    include: { barber: true, specialty: true },
    orderBy: { scheduledAt: 'asc' }
  });
};

export const deactivateAppointment = async (id: string, userId: string) => {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) throw new Error('Agendamento não encontrado');
  if (appointment.userId !== userId) throw new Error('Acesso negado');
  if (appointment.status !== 'scheduled') throw new Error('Agendamento não está ativo');

  const now = new Date();
  const diffInMinutes = (appointment.scheduledAt.getTime() - now.getTime()) / (1000 * 60);
  
  if (diffInMinutes < 0) {
    throw new Error('Você não pode cancelar um agendamento que já passou.');
  }

  if (diffInMinutes < 120) {
    throw new Error('Cancelamento permitido apenas com 2 horas de antecedência.');
  }

  return await prisma.appointment.update({
    where: { id },
    data: { status: 'cancelled', cancelledAt: new Date() }
  });
};

export const fetchAdminTodayAppointments = async () => {
  const start = startOfDay(new Date());
  const end = endOfDay(new Date());
  
  return await prisma.appointment.findMany({
    where: { scheduledAt: { gte: start, lte: end } },
    include: { user: true, barber: true, specialty: true },
    orderBy: { scheduledAt: 'asc' }
  });
};

export const fetchAdminFutureAppointments = async () => {
  const start = endOfDay(new Date());
  
  return await prisma.appointment.findMany({
    where: { scheduledAt: { gt: start } },
    include: { user: true, barber: true, specialty: true },
    orderBy: { scheduledAt: 'asc' }
  });
};
