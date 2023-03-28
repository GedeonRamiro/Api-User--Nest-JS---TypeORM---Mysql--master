import { OmitType } from '@nestjs/mapped-types';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../enums/role.enum';
import { CreateUserDto } from './create-user.dto';

export class UpdatePacthUserDto extends OmitType(CreateUserDto, [
  'email',
] as const) {
  @IsOptional()
  name: string;

  @IsOptional()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role: number;

  @IsOptional()
  @IsDate()
  updateAt: Date;
}
