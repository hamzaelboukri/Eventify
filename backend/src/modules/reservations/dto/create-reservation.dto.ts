import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsMongoId()
  eventId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
