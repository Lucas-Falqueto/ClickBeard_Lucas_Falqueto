import { prisma } from '../config/db';

export const listBarbers = async () => {
  return await prisma.barber.findMany({
    include: {
      specialties: {
        include: { specialty: true }
      }
    }
  });
};

export const getBarberById = async (id: string) => {
  return await prisma.barber.findUnique({
    where: { id },
    include: {
      specialties: { include: { specialty: true } }
    }
  });
};

export const insertBarber = async (data: any) => {
  const { name, age, hiringDate, specialtyIds } = data;
  
  const specialtiesData = specialtyIds ? specialtyIds.map((id: string) => ({
    specialty: { connect: { id } }
  })) : [];

  return await prisma.barber.create({
    data: {
      name,
      age: parseInt(age, 10),
      hiringDate: new Date(hiringDate),
      specialties: {
        create: specialtiesData
      }
    },
    include: { specialties: { include: { specialty: true } } }
  });
};

export const removeBarber = async (id: string) => {
  await prisma.barberSpecialty.deleteMany({ where: { barberId: id } });
  await prisma.barber.delete({ where: { id } });
};

export const editBarber = async (id: string, data: any) => {
  const { name, age, hiringDate, specialtyIds } = data;
  
  await prisma.barberSpecialty.deleteMany({ where: { barberId: id } });

  const specialtiesData = specialtyIds ? specialtyIds.map((specId: string) => ({
    specialty: { connect: { id: specId } }
  })) : [];

  return await prisma.barber.update({
    where: { id },
    data: {
      name,
      age: parseInt(age, 10),
      hiringDate: new Date(hiringDate),
      specialties: {
        create: specialtiesData
      }
    },
    include: { specialties: { include: { specialty: true } } }
  });
};
