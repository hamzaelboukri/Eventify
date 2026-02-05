import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventsService, PaginatedEvents, EventStats } from './events.service';
import { CreateEventDto, UpdateEventDto, QueryEventDto } from './dto';
import { Event } from './schemas/event.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

interface JwtUser {
  userId: string;
  email: string;
  role: UserRole;
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Create a new event (Admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: JwtUser,
  ): Promise<Event> {
    return this.eventsService.create(createEventDto, user.userId);
  }

  /**
   * Get all events (Admin only - includes drafts and canceled)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() queryDto: QueryEventDto): Promise<PaginatedEvents> {
    return this.eventsService.findAll(queryDto);
  }

  /**
   * Get my events (organizer's events)
   */
  @Get('my-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findMyEvents(
    @Query() queryDto: QueryEventDto,
    @CurrentUser() user: JwtUser,
  ): Promise<PaginatedEvents> {
    return this.eventsService.findByOrganizer(user.userId, queryDto);
  }

  /**
   * Get event statistics (Admin only)
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats(): Promise<EventStats> {
    return this.eventsService.getStats();
  }

  /**
   * Get all categories with event counts (Public)
   */
  @Get('categories')
  async getCategories(): Promise<{ category: string; count: number }[]> {
    return this.eventsService.getCategories();
  }

  /**
   * Get upcoming events (Public)
   */
  @Get('upcoming')
  async getUpcoming(@Query('limit') limit?: number): Promise<Event[]> {
    return this.eventsService.getUpcoming(limit || 5);
  }

  /**
   * Get all published events (Public)
   */
  @Get()
  async findPublished(@Query() queryDto: QueryEventDto): Promise<PaginatedEvents> {
    return this.eventsService.findPublished(queryDto);
  }

  /**
   * Get one event by ID (Public - only published)
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findOnePublished(id);
  }

  /**
   * Get one event by ID (Admin - any status)
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOneAdmin(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  /**
   * Check event availability
   */
  @Get(':id/availability')
  async checkAvailability(
    @Param('id') id: string,
  ): Promise<{ available: boolean; availableSpots: number; message?: string }> {
    return this.eventsService.checkAvailability(id);
  }

  /**
   * Update an event (Admin only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: JwtUser,
  ): Promise<Event> {
    return this.eventsService.update(
      id,
      updateEventDto,
      user.userId,
      user.role === UserRole.ADMIN,
    );
  }

  /**
   * Publish an event (Admin only)
   */
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<Event> {
    return this.eventsService.publish(id, user.userId, user.role === UserRole.ADMIN);
  }

  /**
   * Cancel an event (Admin only)
   */
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<Event> {
    return this.eventsService.cancel(id, user.userId, user.role === UserRole.ADMIN);
  }

  /**
   * Delete an event (Admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    return this.eventsService.remove(id, user.userId, user.role === UserRole.ADMIN);
  }
}
