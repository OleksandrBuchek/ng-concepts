import { Injector } from '@angular/core';
import { asObservable } from '@shared/util-rxjs-interop';
import { ValueOrReactive } from '@shared/util-types';
import { map } from 'rxjs';

export const withInjector = <Input = void>(input: ValueOrReactive<Input>, injector: Injector) =>
  asObservable(input).pipe(map((input) => ({ input, injector })));
