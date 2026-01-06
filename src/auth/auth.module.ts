import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigurationModule } from '../../src/config/configuration.module';
import { ConfigurationService } from '../../src/config/configuration.service';
import { JwtStrategy } from './jwt.strategy';

// TODO: extend it it is just basic auth module for demonstration purposes
@Module({
  imports: [
    ConfigurationModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => ({
        secret: configurationService.auth0.secret,
        // TODO: move it to config
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
