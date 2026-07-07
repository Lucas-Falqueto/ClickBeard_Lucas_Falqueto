import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { BarbersService } from './barbers.service';
import { CreateBarberDto, UpdateBarberDto } from './dto/barber.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Barbers')
@Controller('barbers')
export class BarbersController {
  constructor(private barbersService: BarbersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os barbeiros' })
  async getAll() {
    return this.barbersService.getAllBarbers();
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria um novo barbeiro (Apenas Admin)' })
  async create(@Body() dto: CreateBarberDto) {
    return this.barbersService.createBarber(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza um barbeiro (Apenas Admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateBarberDto) {
    return this.barbersService.updateBarber(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove um barbeiro (Apenas Admin)' })
  async delete(@Param('id') id: string) {
    return this.barbersService.deleteBarber(id);
  }
}
