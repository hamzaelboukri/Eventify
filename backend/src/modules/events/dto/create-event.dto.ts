import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EventStatus } from '../schemas/event.schema';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  @MaxLength(100, { message: 'Le titre ne peut pas dépasser 100 caractères' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'La description est obligatoire' })
  @MinLength(10, { message: 'La description doit contenir au moins 10 caractères' })
  @MaxLength(2000, { message: 'La description ne peut pas dépasser 2000 caractères' })
  description: string;

  @IsDateString({}, { message: 'La date doit être une date valide' })
  @IsNotEmpty({ message: 'La date est obligatoire' })
  date: string;

  @IsString()
  @IsNotEmpty({ message: "L'heure est obligatoire" })
  time: string;

  @IsString()
  @IsNotEmpty({ message: 'Le lieu est obligatoire' })
  @MaxLength(200, { message: 'Le lieu ne peut pas dépasser 200 caractères' })
  location: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber({}, { message: 'La capacité doit être un nombre' })
  @Min(1, { message: 'La capacité doit être au moins de 1' })
  capacity: number;

  @IsEnum(EventStatus, { message: 'Le statut doit être draft, published ou canceled' })
  @IsOptional()
  status?: EventStatus;

  @IsString()
  @IsOptional()
  price?: string;
}
