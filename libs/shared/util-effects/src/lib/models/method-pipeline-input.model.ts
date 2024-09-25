import { Injector } from '@angular/core';

export type RxInjectablePipelineInput<Input> = {
  input: Input;
  injector: Injector;
};
