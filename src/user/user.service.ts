import {
  BadGatewayException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordBcryptjs } from '../password -bcryptjs/PasswordBcryptjs';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePacthUserDto } from './dto/update-patch.dto';
import { UpdatePutUserDto } from './dto/update-put.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(data: CreateUserDto) {
    await this.existEmail(data.email);

    data.password = await PasswordBcryptjs.hashPasswords(data.password);

    const user = this.userRepository.create(data);

    return this.userRepository.save(user);
  }

  async getUsers(limit: number, page: number, filter: string) {
    if (isNaN(Number(page) && Number(limit))) {
      throw new NotAcceptableException('Página ou limite formato invalido!');
    }

    const skip = (page - 1) * limit;
    const [result, total] = await this.userRepository.findAndCount({
      where: { name: Like('%' + filter + '%') },
      take: limit,
      skip: skip,
    });
    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data: [...result],
      count: total,
      currentPage: page,
      nextPage: nextPage,
      prevPage: prevPage,
      lastPage: lastPage,
    };
  }

  async getUsersById(id: number) {
    const resultGetUsersById = await this.userRepository.findOneBy({
      id,
    });
    if (!resultGetUsersById) {
      throw new NotFoundException('Usuáiro não existe na base de dados!');
    }

    return resultGetUsersById;
  }

  async delete(id: number) {
    await this.userRepository.delete(id);
    return { message: 'Excluido com sucesso!' };
  }

  async updatePut(id: number, data: UpdatePutUserDto) {
    try {
      data.password = await PasswordBcryptjs.hashPasswords(data.password);
      data.updateAt = new Date();

      await this.userRepository.update(id, data);

      return this.getUsersById(id);
    } catch (error) {
      throw new NotFoundException('Propriedade passada no body inválida!');
    }
  }

  async updatePatch(id: number, data: UpdatePacthUserDto) {
    if (data.password) {
      data.password = await PasswordBcryptjs.hashPasswords(data.password);
    }
    data.updateAt = new Date();

    await this.userRepository.update(id, data);

    return this.getUsersById(id);
  }

  async existEmail(email: string) {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (user) {
      throw new BadGatewayException('E-mail já existe na base de dados!');
    }

    return true;
  }
}
