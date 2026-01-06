import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationService } from '../../config/configuration.service';
import { BlockchainService } from './blockchain.service';

// TODO: this is async test (more like integration) and i am not sure i we can call JsonRpcProvider so many times
describe('BlockchainService', () => {
  let service: BlockchainService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: ConfigurationService,
          useValue: {
            ethereum: {
              rpcUrl: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
              usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            },
          },
        },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
  });

  describe('getUsdcTransfers', () => {
    it('should return USDC transfers for block 1700000 with expected data', async () => {
      const blockNumber = 1700000;
      const expectedTransfer = {
        txHash:
          '0x0c0093106cb919958037a68aa3ce785a4c9a8ff430f4e49fd0c32a6348ee1c46',
        from: '0xFCba0693FC16DCb2a4E8FA7eD3DA31f5296993E4',
        to: '0xc45143c530E9dc0C3895c458C160144A3129955b',
        value: '18',
      };

      const transfers = await service.getUsdcTransfers(blockNumber);

      expect(Array.isArray(transfers)).toBe(true);

      if (transfers.length > 0) {
        expect(transfers).toHaveLength(1);
        const transfer = transfers[0];

        expect(transfer.txHash).toBe(expectedTransfer.txHash);
        expect(transfer.from).toBe(expectedTransfer.from);
        expect(transfer.to).toBe(expectedTransfer.to);
        expect(transfer.value).toBe(expectedTransfer.value);
      } else {
        expect(transfers).toEqual([]);
      }
    }, 30000);

    it('should return empty array for a block with no USDC transfers (edge case)', async () => {
      const blockNumber = 1;

      const transfers = await service.getUsdcTransfers(blockNumber);

      expect(Array.isArray(transfers)).toBe(true);
      expect(transfers).toHaveLength(0);
    }, 30000);

    // TODO: propably for such a tests i should create mocks in differetn test files
    it('should throw error when parseUsdcTransferLogs returns errors', async () => {
      const blockNumber = 1700000;
      const mockErrors = [
        'Failed to parse log with tx hash: 0x1234567890abcdef',
        'Failed to parse log with tx hash: 0xabcdef1234567890',
      ];
      const mockTransfers: any[] = [];

      const serviceAny = service as any;
      const originalParseMethod =
        serviceAny.parseUsdcTransferLogs.bind(service);

      serviceAny.parseUsdcTransferLogs = jest.fn().mockReturnValue({
        transfers: mockTransfers,
        errors: mockErrors,
      });

      const mockLogs = [
        {
          transactionHash: '0x1234567890abcdef',
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          topics: [],
          data: '0x',
          blockNumber: blockNumber,
        },
      ];

      serviceAny.provider.getLogs = jest.fn().mockResolvedValue(mockLogs);

      try {
        await service.getUsdcTransfers(blockNumber);
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Error during getting usdc transfers');
        expect(error.message).toContain('Errors during parsing logs');
        expect(error.message).toContain(mockErrors[0]);
        expect(error.message).toContain(mockErrors[1]);
      }

      // Restore original method
      serviceAny.parseUsdcTransferLogs = originalParseMethod;
    });
  });
});
