import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class UsdcTransfer {
  @Expose()
  @IsString()
  txHash: string;

  @Expose()
  @IsString()
  from: string;

  @Expose()
  @IsString()
  to: string;

  @Expose()
  @IsString()
  value: string;
}

export class UsdcTransferListResponse {
  @Expose()
  transfers: UsdcTransfer[];
}
