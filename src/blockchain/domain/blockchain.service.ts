import { Injectable } from '@nestjs/common';
import {
  Interface,
  JsonRpcProvider,
  type Log,
  type LogDescription,
} from 'ethers';
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

    const logs: Log[] = await this.provider.getLogs({
      address: this.configurationService.ethereum.usdcAddress,
      fromBlock: blockNumber,
      toBlock: blockNumber,
      topics: [usdcInterface.getEvent('Transfer')!.topicHash],
    });

    const transfers = logs.map((log) => {
      const parsed: LogDescription | null = usdcInterface.parseLog(log);

      if (!parsed) {
        throw new Error(
          'Failed to parse log with tx hash: ' + log.transactionHash,
        );
      }

      // Parse smallest USDC (simmilar to wei) to USDC
      const valueString = String(parsed.args[2]);
      const valueInSmallestUnit = BigInt(valueString);
      const valueInUsdc = Number(valueInSmallestUnit) / 1e6;

      return {
        txHash: log.transactionHash,
        from: parsed.args[0],
        to: parsed.args[1],
        value: valueInUsdc.toString(),
      };
    });

    return transfers;
  }
}
