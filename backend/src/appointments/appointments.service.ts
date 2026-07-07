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

  async deactivateAppointment(id: string, userId: string, role?: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });

    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    if (role !== 'ADMIN' && appointment.userId !== userId) throw new ForbiddenException('Acesso negado');
    if (appointment.status !== 'scheduled') throw new BadRequestException('Agendamento não está ativo');

    const now = new Date();
    const diffInMinutes = (appointment.scheduledAt.getTime() - now.getTime()) / (1000 * 60);
    
    if (role !== 'ADMIN' && diffInMinutes < 0) {
      throw new BadRequestException('Você não pode cancelar um agendamento que já passou.');
    }

    if (role !== 'ADMIN' && diffInMinutes < 120) {
      throw new BadRequestException('Cancelamento permitido apenas com 2 horas de antecedência.');
    }

    return await this.prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled', cancelledAt: new Date() }
    });
  }

  async completeAppointment(id: string, role?: string) {
    if (role !== 'ADMIN') throw new ForbiddenException('Apenas administradores podem concluir agendamentos');
    
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    if (appointment.status !== 'scheduled') throw new BadRequestException('Apenas agendamentos ativos podem ser concluídos');

    return await this.prisma.appointment.update({
      where: { id },
      data: { status: 'completed' }
    });
  }

  async fetchAdminTodayAppointments(page: number = 1, limit: number = 10, clientName?: string, status?: string) {
    const start = startOfDay(new Date());
    const end = endOfDay(new Date());
    
    const where: any = { scheduledAt: { gte: start, lte: end } };
    if (clientName) {
      where.user = { name: { contains: clientName, mode: 'insensitive' } };
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        include: { user: true, barber: true, specialty: true },
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit
      }),
      this.prisma.appointment.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async fetchAdminFutureAppointments(page: number = 1, limit: number = 10, clientName?: string, status?: string, date?: string) {
    const start = endOfDay(new Date());
    
    const where: any = {};
    
    if (date) {
      const targetDate = parseISO(date);
      where.scheduledAt = { 
        gte: startOfDay(targetDate), 
        lte: endOfDay(targetDate) 
      };
    } else {
      where.scheduledAt = { gt: start };
    }

    if (clientName) {
      where.user = { name: { contains: clientName, mode: 'insensitive' } };
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        include: { user: true, barber: true, specialty: true },
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit
      }),
      this.prisma.appointment.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
