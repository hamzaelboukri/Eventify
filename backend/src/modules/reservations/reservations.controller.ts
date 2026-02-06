import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService, PaginatedReservations, ReservationStats } from './reservations.service';
import { CreateReservationDto } from './dto';
import { Reservation } from './schemas/reservation.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, User } from '../users/schemas/user.schema';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * Create a new reservation (Participant)
   */
  @Post()
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: User,
  ): Promise<Reservation> {
    return this.reservationsService.create(createReservationDto, user._id.toString());
  }

  /**
   * Get all reservations (Admin only)
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('status') status?: string,
    @Query('eventId') eventId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedReservations> {
    return this.reservationsService.findAll({ status, eventId, page, limit });
  }

  /**
   * Get my reservations (Current user)
   */
  @Get('my-reservations')
  async findMyReservations(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedReservations> {
    return this.reservationsService.findByUser(user._id.toString(), { status, page, limit });
  }

  /**
   * Get reservation statistics (Admin only)
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats(): Promise<ReservationStats> {
    return this.reservationsService.getStats();
  }

  /**
   * Get one reservation by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Reservation> {
    return this.reservationsService.findOne(id);
  }

  /**
   * Confirm a reservation (Admin only)
   */
  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async confirm(@Param('id') id: string): Promise<Reservation> {
    return this.reservationsService.confirm(id);
  }

  /**
   * Refuse a reservation (Admin only)
   */
  @Patch(':id/refuse')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async refuse(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<Reservation> {
    return this.reservationsService.refuse(id, reason);
  }

  /**
   * Cancel a reservation (Owner only)
   */
  @Patch(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Reservation> {
    return this.reservationsService.cancel(id, user._id.toString());
  }
}
