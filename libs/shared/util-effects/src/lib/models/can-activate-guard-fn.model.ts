import { Injector } from '@angular/core';
import { ValueOrReactive } from '@shared/util-types';

export type CanActivateGuardFn<Input = void> = (input: Input, injector: Injector) => ValueOrReactive<boolean>;
