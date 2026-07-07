import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateAppointmentSchema = z.object({
  barberId: z.string(),
  specialtyId: z.string(),
  scheduledAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data de agendamento inválida',
  }),
});

export class CreateAppointmentDto extends createZodDto(CreateAppointmentSchema) {}
