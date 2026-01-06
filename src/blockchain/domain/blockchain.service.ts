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

      return {
        txHash: log.transactionHash,
        from: parsed.args[0],
        to: parsed.args[1],
        value: parsed.args[2].toString(),
      };
    });

    return transfers;
  }

  async findRecentBlockWithUsdcTransfers(
    lookbackBlocks: number = 1000,
  ): Promise<number | null> {
    const usdcInterface = new Interface([
      'event Transfer(address indexed from, address indexed to, uint256 value)',
    ]);

    const currentBlock = await this.provider.getBlockNumber();
    const startBlock = Math.max(0, currentBlock - lookbackBlocks);
    const batchSize = 100; // Query in smaller batches to avoid exceeding limits

    // Search backwards in batches
    for (
      let toBlock = currentBlock;
      toBlock >= startBlock;
      toBlock -= batchSize
    ) {
      const fromBlock = Math.max(startBlock, toBlock - batchSize + 1);

      try {
        const logs = await this.provider.getLogs({
          address: this.configurationService.ethereum.usdcAddress,
          fromBlock,
          toBlock,
          topics: [usdcInterface.getEvent('Transfer')!.topicHash],
        });

        if (logs.length > 0) {
          // Return the block number from the first log found
          return logs[0].blockNumber;
        }
      } catch (error: any) {
        // If we get a "query exceeds max results" error, try even smaller batches
        if (error?.message?.includes('exceeds max results')) {
          // Try querying block by block in this range
          for (let block = toBlock; block >= fromBlock; block--) {
            try {
              const singleBlockLogs = await this.provider.getLogs({
                address: this.configurationService.ethereum.usdcAddress,
                fromBlock: block,
                toBlock: block,
                topics: [usdcInterface.getEvent('Transfer')!.topicHash],
              });

              if (singleBlockLogs.length > 0) {
                return block;
              }
            } catch {
              // Continue to next block if this one fails
              continue;
            }
          }
        }
        // Continue to next batch if error occurs
        continue;
      }
    }

    return null;
  }
}
