import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpecialtiesService {
  constructor(private prisma: PrismaService) {}

  async getAllSpecialties() {
    return this.prisma.specialty.findMany();
  }

  async createSpecialty(data: any) {
    return this.prisma.specialty.create({ data });
  }

  async deleteSpecialty(id: string) {
    const specialty = await this.prisma.specialty.findUnique({ where: { id } });
    if (!specialty) {
      throw new NotFoundException('Especialidade não encontrada.');
    }

    await this.prisma.$transaction([
      this.prisma.barberSpecialty.deleteMany({ where: { specialtyId: id } }),
      this.prisma.appointment.deleteMany({ where: { specialtyId: id } }),
      this.prisma.specialty.delete({ where: { id } })
    ]);

    return { message: 'Especialidade removida com sucesso' };
  }
}
