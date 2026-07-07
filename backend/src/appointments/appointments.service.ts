import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addMinutes, parseISO, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async calculateAvailableSlots(barberId: string, date: string) {
    const targetDate = parseISO(date);
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    const appointments = await this.prisma.appointment.findMany({
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
  }

  async scheduleAppointment(userId: string, barberId: string, specialtyId: string, scheduledAt: string) {
    const date = new Date(scheduledAt);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        barberId,
        status: 'scheduled',
        scheduledAt: date
      }
    });

    if (conflict) {
      throw new BadRequestException('Barbeiro já possui agendamento neste horário.');
    }

    return await this.prisma.appointment.create({
      data: {
        userId,
        barberId,
        specialtyId,
        scheduledAt: date,
      }
    });
  }

  async fetchUserAppointments(userId: string) {
    return await this.prisma.appointment.findMany({
      where: { 
        userId,
        scheduledAt: { gte: new Date() }
      },
      include: { barber: true, specialty: true },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  async deactivateAppointment(id: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });

    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    if (appointment.userId !== userId) throw new ForbiddenException('Acesso negado');
    if (appointment.status !== 'scheduled') throw new BadRequestException('Agendamento não está ativo');

    const now = new Date();
    const diffInMinutes = (appointment.scheduledAt.getTime() - now.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 0) {
      throw new BadRequestException('Você não pode cancelar um agendamento que já passou.');
    }

    if (diffInMinutes < 120) {
      throw new BadRequestException('Cancelamento permitido apenas com 2 horas de antecedência.');
    }

    return await this.prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled', cancelledAt: new Date() }
    });
  }

  async fetchAdminTodayAppointments() {
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    
    return await this.prisma.appointment.findMany({
      where: { scheduledAt: { gte: start, lte: end } },
      include: { user: true, barber: true, specialty: true },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  async fetchAdminFutureAppointments() {
    const start = endOfDay(new Date());
    
    return await this.prisma.appointment.findMany({
      where: { scheduledAt: { gt: start } },
      include: { user: true, barber: true, specialty: true },
      orderBy: { scheduledAt: 'asc' }
    });
  }
}
