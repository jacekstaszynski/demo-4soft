import type { Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

export function objectTransformer<TDomain, TView>(
  domainObject: TDomain,
  viewClass: Type<TView>,
): TView {
  return plainToInstance(viewClass, domainObject, {
    excludeExtraneousValues: true,
  });
}

export function arrayTransformer<TDomain, TView>(
  domainObjects: TDomain[],
  viewClass: Type<TView>,
): TView[] {
  return domainObjects.map((object) => objectTransformer(object, viewClass));
}
