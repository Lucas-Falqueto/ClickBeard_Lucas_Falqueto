import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BarbersService {
  constructor(private prisma: PrismaService) {}

  async getAllBarbers() {
    return this.prisma.barber.findMany({
      include: {
        specialties: {
          include: { specialty: true },
        },
      },
    });
  }

  async createBarber(data: any) {
    const { name, age, hiringDate, specialtyIds } = data;
    
    return this.prisma.barber.create({
      data: {
        name,
        age,
        hiringDate: new Date(hiringDate),
        specialties: {
          create: specialtyIds?.map((id: string) => ({
            specialty: { connect: { id } },
          })) || [],
        },
      },
    });
  }

  async updateBarber(id: string, data: any) {
    const barber = await this.prisma.barber.findUnique({ where: { id } });
    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado.');
    }

    const { name, age, hiringDate, specialtyIds } = data;
    
    return this.prisma.$transaction(async (tx) => {
      if (specialtyIds) {
        await tx.barberSpecialty.deleteMany({ where: { barberId: id } });
      }
      
      return tx.barber.update({
        where: { id },
        data: {
          name,
          age,
          ...(hiringDate && { hiringDate: new Date(hiringDate) }),
          ...(specialtyIds && {
            specialties: {
              create: specialtyIds.map((specId: string) => ({
                specialty: { connect: { id: specId } }
              }))
            }
          })
        },
      });
    });
  }

  async deleteBarber(id: string) {
    const barber = await this.prisma.barber.findUnique({ where: { id } });
    if (!barber) {
      throw new NotFoundException('Barbeiro não encontrado.');
    }

    await this.prisma.$transaction([
      this.prisma.barberSpecialty.deleteMany({ where: { barberId: id } }),
      this.prisma.appointment.deleteMany({ where: { barberId: id } }),
      this.prisma.barber.delete({ where: { id } })
    ]);
    
    return { message: 'Barbeiro removido com sucesso' };
  }
}
