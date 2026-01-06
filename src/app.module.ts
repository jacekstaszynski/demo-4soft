import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { AuthModule } from './auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ConfigurationModule } from './config/configuration.module';

@Module({
  imports: [ConfigurationModule, AuthModule, BlockchainModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
