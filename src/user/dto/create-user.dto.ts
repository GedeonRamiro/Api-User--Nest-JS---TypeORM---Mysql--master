import { IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';
import { Role } from '../../enums/role.enum';

export class CreateUserDto {
  @MinLength(3, { message: 'Nome muito curto' })
  name: string;

  @IsEmail(undefined, { message: 'Formato de e-mail digitado não é valido' })
  email: string;

  @MinLength(6, { message: 'Senha deve ser no mínimo 6 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role: number;
}
