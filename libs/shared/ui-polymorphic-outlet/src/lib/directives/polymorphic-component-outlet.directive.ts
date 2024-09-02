/* eslint-disable @angular-eslint/directive-selector */
import {
  Directive,
  Type,
  OnChanges,
  input,
  Injector,
  inject,
  runInInjectionContext,
  SimpleChanges,
} from '@angular/core';
import {
  PolymorphicComponent,
  PolymorphicComponentInputs,
  PolymorphicComponentOutputsHandlers,
  PolymorphicViewContainerRefParams,
  PolymorphicComponentParams,
  PolymorphicComponentOrFactory,
  PolymorphicViewContainerRef,
} from '@shared/util-polymorphic-content';

@Directive({
  standalone: true,
  selector: '[polymorphicComponentOutlet]',
})
export class PolymorphicComponentOutletDirective<TComponent extends Type<any>> implements OnChanges {
  public readonly polymorphicComponent = input.required<
    PolymorphicComponent<TComponent>,
    PolymorphicComponentOrFactory<TComponent>
  >({
    alias: 'polymorphicComponentOutlet',
    transform: (componentOrFactory) => this.toComponent(componentOrFactory),
  });

  public readonly outputsHandlers = input<Partial<PolymorphicComponentOutputsHandlers<TComponent>>>(
    {},
    {
      alias: 'polymorphicComponentOutletOutputsHanlders',
    }
  );

  public readonly inputs = input<Partial<PolymorphicComponentInputs<TComponent>>>(
    {},
    {
      alias: 'polymorphicComponentOutletInputs',
    }
  );

  private readonly injector = inject(Injector);
  private polymorphicVcr: PolymorphicViewContainerRef<TComponent> | null = null;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['polymorphicComponent']) {
      runInInjectionContext(this.injector, () => {
        this.polymorphicVcr = new PolymorphicViewContainerRef(this.polymorphicComponent(), {
          inputs: this.inputs(),
          outputsHandlers: this.outputsHandlers(),
        } as unknown as PolymorphicViewContainerRefParams<TComponent>);

        this.polymorphicVcr?.createComponent();
      });

      return;
    }

    if (changes['inputs']) {
      this.polymorphicVcr?.observeInputsChanges?.(this.inputs());
    }

    if (changes['outputsHandlers']) {
      this.polymorphicVcr?.updateOutputsHandlers(this.outputsHandlers());
    }
  }

  private toComponent(componentOrFactory: PolymorphicComponentOrFactory<TComponent>): PolymorphicComponent<TComponent> {
    return componentOrFactory instanceof PolymorphicComponent
      ? componentOrFactory
      : componentOrFactory({} as PolymorphicComponentParams<TComponent>);
  }
}
