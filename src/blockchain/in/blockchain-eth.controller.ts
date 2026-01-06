import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserFromJwt } from '../../auth/user-data.decorator';
import type { UserData } from '../../auth/user-data.type';
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
    @UserFromJwt() user: UserData,
  ): Promise<UsdcTransferListResponse> {
    // TODO: i addede it only to show decorator working, in production it should be removed
    console.log('user', user);
    const transfers =
      await this.blockchainService.getUsdcTransfers(blockNumber);

    return objectTransformer({ transfers }, UsdcTransferListResponse);
  }
}
