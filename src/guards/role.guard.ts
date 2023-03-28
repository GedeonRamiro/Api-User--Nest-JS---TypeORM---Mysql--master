import {
  BadGatewayException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles-decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const requeridRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requeridRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    const rolefilter = requeridRoles.filter((roles) => roles === user.role);

    if (!rolefilter.length) throw new UnauthorizedException('Não autorizado!');

    return rolefilter.length > 0;
  }
}
