import { z } from 'zod';

export const createSpecialtySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
    description: z.string().optional()
  })
});
