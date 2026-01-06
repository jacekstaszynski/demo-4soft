import { Injectable } from '@nestjs/common';
import { BlockchainService } from './domain/blockchain.service';
import { UsdcTransfer } from './domain/type/usdc-transfer.types';

// TODO: it is only used for other modules to access the blockchain service
@Injectable()
export class BlockchainFacade {
  constructor(private readonly blockchainService: BlockchainService) {}

  async getUsdcTransfers(blockNumber: number): Promise<UsdcTransfer[]> {
    return this.blockchainService.getUsdcTransfers(blockNumber);
  }
}
