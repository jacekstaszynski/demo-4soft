import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigurationService } from '../../src/config/configuration.service';
import { UserData } from './user-data.type';

export interface JwtPayload {
  sub: string;
  name?: string;
  id?: string;
}

// TODO: this is only basic jwt check (it is not security), we should add more validation and error handling
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configurationService: ConfigurationService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configurationService.auth0.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserData> {
    if (!payload.sub) {
      throw new HttpException('Payload is missing', HttpStatus.FORBIDDEN);
    }

    return {
      email: payload.sub,
      name: payload.name || 'Test',
      id: payload.id || 'Test',
    };
  }
}
