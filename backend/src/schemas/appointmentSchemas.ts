import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    barberId: z.string().uuid('ID de barbeiro inválido'),
    specialtyId: z.string().uuid('ID de especialidade inválido'),
    scheduledAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Data inválida')
  })
});
