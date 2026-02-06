import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ReservationStatus } from '../schemas/reservation.schema';

export class UpdateReservationDto {
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  @IsString()
  refusedReason?: string;
}
