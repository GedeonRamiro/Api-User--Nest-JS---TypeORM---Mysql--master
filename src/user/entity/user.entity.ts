import { Role } from '../../enums/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'users',
})
export class UserEntity {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id?: number;

  @Column({
    length: 45,
  })
  name: string;

  @Column({
    unique: true,
    length: 123,
  })
  email: string;

  @Column({
    length: 255,
  })
  password: string;

  @Column({ default: Role.User })
  role: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
