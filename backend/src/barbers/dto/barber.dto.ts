import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateBarberSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  age: z.number().min(18, 'Barbeiro deve ser maior de idade'),
  hiringDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data de contratação inválida',
  }),
  specialtyIds: z.array(z.string()).optional(),
});

export class CreateBarberDto extends createZodDto(CreateBarberSchema) {}

export const UpdateBarberSchema = CreateBarberSchema.partial();

export class UpdateBarberDto extends createZodDto(UpdateBarberSchema) {}
