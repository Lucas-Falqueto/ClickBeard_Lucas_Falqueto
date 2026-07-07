import { prisma } from '../config/db';

export const listSpecialties = async () => {
  return await prisma.specialty.findMany();
};

export const insertSpecialty = async (data: { name: string; description?: string }) => {
  return await prisma.specialty.create({
    data
  });
};

export const removeSpecialty = async (id: string) => {
  await prisma.barberSpecialty.deleteMany({ where: { specialtyId: id } });
  await prisma.specialty.delete({ where: { id } });
};
