import { IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { ReservationStatus } from '../../../common/enums/reservation-status.enum';

export class QueryReservationDto {
  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;

  @IsMongoId()
  @IsOptional()
  eventId?: string;

  @IsMongoId()
  @IsOptional()
  participantId?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
