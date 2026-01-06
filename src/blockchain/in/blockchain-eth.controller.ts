import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { objectTransformer } from '../../common/types/object-transformer';
import { BlockchainService } from '../domain/blockchain.service';
import { UsdcTransferListResponse } from './type/usdc-transfer.response';

@Controller('blockchain/eth')
@UseGuards(JwtAuthGuard)
export class BlockchainEthController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('usdc/:blockNumber')
  async getUsdcTransfers(
    // TODO: maybe more blockNumber would be needed
    @Param('blockNumber', ParseIntPipe) blockNumber: number,
  ): Promise<UsdcTransferListResponse> {
    const transfers =
      await this.blockchainService.getUsdcTransfers(blockNumber);

    return objectTransformer({ transfers }, UsdcTransferListResponse);
  }
}
