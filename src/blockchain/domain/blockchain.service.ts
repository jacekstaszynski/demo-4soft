import { Injectable } from '@nestjs/common';
import { Interface, JsonRpcProvider } from 'ethers';
import { ConfigurationService } from '../../config/configuration.service';
import { UsdcTransfer } from './type/usdc-transfer.types';

@Injectable()
export class BlockchainService {
  private provider: JsonRpcProvider;
  private usdcInterface: Interface;
  private transferEventTopic: string;

  constructor(private readonly configurationService: ConfigurationService) {
    this.provider = new JsonRpcProvider(
      this.configurationService.ethereum.rpcUrl as string,
    );
    this.usdcInterface = new Interface([
      'event Transfer(address indexed from, address indexed to, uint256 value)',
    ]);
    const transferEvent = this.usdcInterface.getEvent('Transfer');
    if (!transferEvent) {
      throw new Error('Transfer event not found in interface');
    }
    this.transferEventTopic = transferEvent.topicHash;
  }

  async getUsdcTransfers(blockNumber: number): Promise<UsdcTransfer[]> {
    const logs = await this.provider.getLogs({
      address: this.configurationService.ethereum.usdcAddress,
      fromBlock: blockNumber,
      toBlock: blockNumber,
      topics: [this.transferEventTopic],
    });

    return logs.map((log) => {
      const parsed = this.usdcInterface.parseLog(log);

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
