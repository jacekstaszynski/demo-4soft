import { HttpStatus, Injectable } from '@nestjs/common';
import {
  Interface,
  JsonRpcProvider,
  type Log,
  type LogDescription,
} from 'ethers';
import { ConfigurationService } from '../../config/configuration.service';
import { DomainException } from '../../error-handling/domain-exception';
import { UsdcTransfer } from './type/usdc-transfer.types';

@Injectable()
export class BlockchainService {
  private readonly provider: JsonRpcProvider;

  constructor(private readonly configurationService: ConfigurationService) {
    this.provider = new JsonRpcProvider(
      this.configurationService.ethereum.rpcUrl,
    );
  }

  //TODO: Maybe pagination would be needed if arrays are too long
  async getUsdcTransfers(blockNumber: number): Promise<UsdcTransfer[]> {
    try {
      const usdcInterface = new Interface([
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ]);

      const logs: Log[] = await this.provider.getLogs({
        address: this.configurationService.ethereum.usdcAddress,
        fromBlock: blockNumber,
        toBlock: blockNumber,
        topics: [usdcInterface.getEvent('Transfer')!.topicHash],
      });

      const { transfers, errors } = this.parseUsdcTransferLogs(
        logs,
        usdcInterface,
      );

      if (errors.length > 0) {
        throw new DomainException(
          'Errors during parsing logs: ' + errors.join(', '),
          HttpStatus.BAD_REQUEST,
          BlockchainService.name,
        );
      }

      return transfers;
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }
      throw new DomainException(
        'Error during getting usdc transfers: ' + error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        BlockchainService.name,
      );
    }
  }

  public parseUsdcTransferLogs(
    logs: Log[],
    usdcInterface: Interface,
  ): { transfers: UsdcTransfer[]; errors: string[] } {
    const errors: string[] = [];
    const transfers: UsdcTransfer[] = [];

    logs.forEach((log) => {
      const parsed: LogDescription | null = usdcInterface.parseLog(log);

      if (!parsed) {
        errors.push(`Failed to parse log with tx hash: ${log.transactionHash}`);
        return;
      }

      transfers.push({
        txHash: log.transactionHash,
        from: parsed.args[0],
        to: parsed.args[1],
        value: this.parseUsdcValue(parsed.args[2]),
      });
    });

    return { transfers, errors };
  }

  public parseUsdcValue(value: unknown): string {
    // TODO: adjust this validation, not sure what value is expected (from debug it looks like string but dont know if always)
    if (
      typeof value !== 'number' &&
      typeof value !== 'string' &&
      typeof value !== 'bigint'
    ) {
      throw new DomainException(
        'Wrong value when parsing usdc value',
        HttpStatus.INTERNAL_SERVER_ERROR,
        BlockchainService.name,
      );
    }

    const valueString = String(value);
    const valueInSmallestUnit = BigInt(valueString);
    const valueInUsdc = Number(valueInSmallestUnit) / 1e6;
    return valueInUsdc.toString();
  }
}
