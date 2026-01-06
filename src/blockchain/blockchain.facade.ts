import { Injectable } from '@nestjs/common';
import { BlockchainService } from './domain/blockchain.service';
import { UsdcTransfer } from './domain/type/usdc-transfer.types';

// TODO: it will only used for other modules to access the blockchain service done for DEMO purposes
@Injectable()
export class BlockchainFacade {
  constructor(private readonly blockchainService: BlockchainService) {}

  async getUsdcTransfers(blockNumber: number): Promise<UsdcTransfer[]> {
    return this.blockchainService.getUsdcTransfers(blockNumber);
  }
}
