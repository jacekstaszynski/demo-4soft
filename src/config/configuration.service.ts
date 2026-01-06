import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './config.types';

@Injectable()
export class ConfigurationService {
  readonly port: number;
  readonly env: Env;

  readonly auth0: {
    secret: string;
  };

  readonly ethereum: {
    rpcUrl: string;
    usdcAddress: string;
  };

  constructor(private configService: ConfigService) {
    this.port = this.configService.get('PORT') || 3000;
    this.env = this.configService.get<Env>('ENV') || Env.LOCAL;
    this.auth0 = {
      secret: this.configService.getOrThrow('JWT_SECRET'),
    };
    this.ethereum = {
      rpcUrl:
        this.configService.get('ETH_RPC_URL') ||
        'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
      usdcAddress: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    };
  }
}
