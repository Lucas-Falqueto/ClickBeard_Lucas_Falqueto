import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateSpecialtySchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
});

export class CreateSpecialtyDto extends createZodDto(CreateSpecialtySchema) {}
