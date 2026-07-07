import { z } from 'zod';

export const createBarberSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
    age: z.number().min(16, 'Idade mínima é 16 anos').max(100, 'Idade inválida').or(z.string().regex(/^\d+$/).transform(Number)),
    hiringDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Data inválida'),
    specialtyIds: z.array(z.string().uuid('ID de especialidade inválido')).min(1, 'Selecione pelo menos uma especialidade')
  })
});

export const updateBarberSchema = createBarberSchema;
