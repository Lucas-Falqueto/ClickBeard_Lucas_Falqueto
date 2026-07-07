import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/appointment.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get('available')
  @ApiOperation({ summary: 'Retorna slots de horários livres para um barbeiro' })
  async getAvailableSlots(@Query('barberId') barberId: string, @Query('date') date: string) {
    return this.appointmentsService.calculateAvailableSlots(barberId, date);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo agendamento' })
  async create(@Request() req: any, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.scheduleAppointment(
      req.user.id,
      dto.barberId,
      dto.specialtyId,
      dto.scheduledAt
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Lista agendamentos futuros do usuário logado' })
  async getMyLib(@Request() req: any) {
    return this.appointmentsService.fetchUserAppointments(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancela um agendamento' })
  async deactivate(@Request() req: any, @Param('id') id: string) {
    return this.appointmentsService.deactivateAppointment(id, req.user.id, req.user.role);
  }

  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Marca um agendamento como concluído (Apenas Admin)' })
  async complete(@Request() req: any, @Param('id') id: string) {
    return this.appointmentsService.completeAppointment(id, req.user.role);
  }

  @Get('admin/today')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lista agendamentos de hoje de todos os clientes (Apenas Admin)' })
  async getAdminToday(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('clientName') clientName?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.appointmentsService.fetchAdminTodayAppointments(pageNum, limitNum, clientName, status);
  }

  @Get('admin/future')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lista agendamentos futuros de todos os clientes (Apenas Admin)' })
  async getAdminFuture(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('clientName') clientName?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.appointmentsService.fetchAdminFutureAppointments(pageNum, limitNum, clientName, status, date);
  }
}
