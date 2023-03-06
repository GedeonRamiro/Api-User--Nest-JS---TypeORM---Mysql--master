import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class UpdatePutUserDto {
  @MinLength(3, { message: 'Nome muito curto' })
  name: string;

  @MinLength(6, { message: 'Senha deve ser no mínimo 6 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role: number;

  @IsOptional()
  @IsDate()
  updateAt: Date;
}
