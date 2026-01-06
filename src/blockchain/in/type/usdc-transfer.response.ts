import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { UsdcTransfer } from '../../domain/type/usdc-transfer.types';

// TODO: validators are much more usefull in requests but we can use them also in resposnses
export class UsdcTransferListResponse {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UsdcTransfer)
  transfers: UsdcTransfer[];
}
