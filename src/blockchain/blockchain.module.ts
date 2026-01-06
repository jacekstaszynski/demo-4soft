import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../config/configuration.module';
import { BlockchainFacade } from './blockchain.facade';
import { BlockchainService } from './domain/blockchain.service';
import { BlockchainEthController } from './in/blockchain-eth.controller';

@Module({
  imports: [ConfigurationModule],
  controllers: [BlockchainEthController],
  providers: [BlockchainService, BlockchainFacade],
  exports: [BlockchainFacade],
})
export class BlockchainModule {}
