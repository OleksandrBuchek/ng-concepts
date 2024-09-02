import { Injector, Type } from '@angular/core';
import { objectEntries } from '@shared/util-object';
import { asInputSignal } from '@shared/util-rxjs-interop';
import {
  PolymorphicComponentContext,
  PolymorphicComponentOutputsHandlers,
  PolymorphicComponentInputs,
  PolymorphicComponentParams,
  ValueOrNever,
} from '../models';
import { toCssClass } from '@shared/util-helpers';
import { getInputsFromParams, getOutputHandlersFromParams } from '../utils';
import { POLYMORPHIC_CONTEXT } from '../tokens';

export class PolymorphicComponent<TComponent extends Type<any> = Type<any>> {
  public readonly inputs: ValueOrNever<PolymorphicComponentInputs<TComponent>>;
  public readonly outputsHandlers: ValueOrNever<
    Partial<PolymorphicComponentOutputsHandlers<TComponent>>
  >;
  public readonly className: string;

  constructor(
    public readonly component: TComponent,
    private readonly params: PolymorphicComponentParams<TComponent>
  ) {
    this.inputs = getInputsFromParams(this.params);
    this.outputsHandlers = getOutputHandlersFromParams(this.params);
    this.className = toCssClass(params.className);
  }

  public createInjector(parent?: Injector): Injector {
    return Injector.create({
      parent,
      providers: [
        {
          provide: POLYMORPHIC_CONTEXT,
          useValue: this.getContext(),
        },
        this.params.providers ?? [],
      ],
    });
  }

  private getContext(): PolymorphicComponentContext<TComponent> {
    return objectEntries(this.inputs).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: asInputSignal(value) }),
      {} as PolymorphicComponentContext<TComponent>
    );
  }
}
