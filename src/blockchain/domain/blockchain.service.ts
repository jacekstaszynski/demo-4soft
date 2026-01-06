import { Injectable } from '@nestjs/common';
import { Interface, JsonRpcProvider } from 'ethers';
import { ConfigurationService } from '../../config/configuration.service';
import { UsdcTransfer } from './type/usdc-transfer.types';

@Injectable()
export class BlockchainService {
  private readonly provider: JsonRpcProvider;

  constructor(private readonly configurationService: ConfigurationService) {
    this.provider = new JsonRpcProvider(
      this.configurationService.ethereum.rpcUrl,
    );
  }

  async getUsdcTransfers(blockNumber: number): Promise<UsdcTransfer[]> {
    const usdcInterface = new Interface([
      'event Transfer(address indexed from, address indexed to, uint256 value)',
    ]);

    const logs = await this.provider.getLogs({
      address: this.configurationService.ethereum.usdcAddress,
      fromBlock: blockNumber,
      toBlock: blockNumber,
      topics: [usdcInterface.getEvent('Transfer')!.topicHash],
    });

    return logs.map((log) => {
      const parsed = usdcInterface.parseLog(log);

      if (!parsed) {
        throw new Error('Failed to parse log');
      }

      return {
        txHash: log.transactionHash,
        from: parsed.args.from,
        to: parsed.args.to,
        value: parsed.args.value.toString(),
      };
    });
  }
}
