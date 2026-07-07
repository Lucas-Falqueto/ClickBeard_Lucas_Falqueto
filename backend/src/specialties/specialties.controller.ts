import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/specialty.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Specialties')
@Controller('specialties')
export class SpecialtiesController {
  constructor(private specialtiesService: SpecialtiesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as especialidades' })
  async getAll() {
    return this.specialtiesService.getAllSpecialties();
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria uma nova especialidade (Apenas Admin)' })
  async create(@Body() dto: CreateSpecialtyDto) {
    return this.specialtiesService.createSpecialty(dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove uma especialidade (Apenas Admin)' })
  async delete(@Param('id') id: string) {
    return this.specialtiesService.deleteSpecialty(id);
  }
}
