import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReservationsService } from './reservations.service';
import { PdfService } from './pdf.service';
import { CreateReservationDto, QueryReservationDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly pdfService: PdfService,
  ) {}

  // Participant: Create reservation
  @Post()
  create(@Body() createReservationDto: CreateReservationDto, @CurrentUser() user: UserDocument) {
    return this.reservationsService.create(createReservationDto, user._id.toString());
  }

  // Participant: Get own reservations
  @Get('my-reservations')
  findMyReservations(@CurrentUser() user: UserDocument, @Query() query: QueryReservationDto) {
    return this.reservationsService.findByParticipant(user._id.toString(), query);
  }

  // Admin: Get all reservations
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Query() query: QueryReservationDto) {
    return this.reservationsService.findAll(query);
  }

  // Admin: Get statistics
  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getStatistics() {
    return this.reservationsService.getStatistics();
  }

  // Admin: Get reservations by event
  @Get('event/:eventId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findByEvent(@Param('eventId') eventId: string, @Query() query: QueryReservationDto) {
    return this.reservationsService.findByEvent(eventId, query);
  }

  // Admin: Get reservations by participant
  @Get('participant/:participantId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findByParticipant(
    @Param('participantId') participantId: string,
    @Query() query: QueryReservationDto,
  ) {
    return this.reservationsService.findByParticipant(participantId, query);
  }

  // Get single reservation
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  // Admin: Confirm reservation
  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  confirm(@Param('id') id: string) {
    return this.reservationsService.confirm(id);
  }

  // Admin: Refuse reservation
  @Patch(':id/refuse')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  refuse(@Param('id') id: string) {
    return this.reservationsService.refuse(id);
  }

  // Cancel reservation (participant can cancel own, admin can cancel any)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    const isAdmin = user.role === Role.ADMIN;
    return this.reservationsService.cancel(id, user._id.toString(), isAdmin);
  }

  // Download ticket PDF
  @Get(':id/ticket')
  async downloadTicket(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ) {
    const isAdmin = user.role === Role.ADMIN;
    const reservation = await this.reservationsService.getTicketData(
      id,
      user._id.toString(),
      isAdmin,
    );

    this.pdfService.generateTicketPdf(reservation, res);
  }
}
