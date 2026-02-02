import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { EventStatus } from '../../../common/enums/event-status.enum';

export class QueryEventDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsString()
  @IsOptional()
  category?: string;

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
