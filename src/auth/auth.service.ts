import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRegisterDTO } from './dto/auth-register-dto';
import { MailerService } from '@nestjs-modules/mailer';
import { UserEntity } from '../user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordBcryptjs } from '../password -bcryptjs/PasswordBcryptjs';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private ISSUER = 'Login';
  private AUDIENCE = 'Users';

  constructor(
    private readonly jwtService: JwtService,
    private readonly mailer: MailerService,
    private readonly userService: UserService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  createToken(user: UserEntity) {
    return {
      accessToken: this.jwtService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        {
          subject: String(user.id),
          expiresIn: '7 days',
          issuer: this.ISSUER,
          audience: this.AUDIENCE,
        },
      ),
    };
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      });
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  isValindToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  async register(data: AuthRegisterDTO) {
    await this.userService.existEmail(data.email);

    data.password = await PasswordBcryptjs.hashPasswords(data.password);

    delete data.role;

    const user = this.usersRepository.create(data);

    await this.usersRepository.save(user);

    return this.createToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOneBy({
      email,
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretas!');
    }

    const passwordMatch = await PasswordBcryptjs.verifyPasswords(
      password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('E-mail ou senha incorretas!');
    }

    return this.createToken(user);
  }

  async forget(email: string) {
    console.log('Forget', email);
    const user = await this.usersRepository.findOneBy({
      email,
    });

    if (!user) {
      throw new UnauthorizedException('E-mail está incorreto!');
    }

    const token = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        subject: String(user.id),
        expiresIn: '30 minutes',
        issuer: 'forget',
        audience: 'users',
      },
    );

    await this.mailer.sendMail({
      subject: 'Recuperação de senha',
      to: 'gedeon@hotmail.com',
      template: 'forget',
      context: {
        name: user.name,
        token: token,
      },
    });

    return true;
  }

  async reset(password: string, token: string) {
    try {
      const data: any = this.jwtService.verify(token, {
        issuer: 'forget',
        audience: 'users',
      });

      if (isNaN(Number(data.id))) {
        throw new BadRequestException('Token é inválido.');
      }

      const newPassword = await PasswordBcryptjs.hashPasswords(password);

      await this.usersRepository.update(Number(data.id), {
        password: newPassword,
      });

      const user = await this.userService.getUsersById(data.id);

      return this.createToken(user);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
