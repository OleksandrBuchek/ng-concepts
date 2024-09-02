/* eslint-disable @angular-eslint/directive-selector */
import {
  Type,
  inject,
  Injector,
  ViewContainerRef,
  ComponentRef,
  runInInjectionContext,
  OutputEmitterRef,
  DestroyRef,
  Renderer2,
} from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { objectEntries } from '@shared/util-object';
import { asInputObservable } from '@shared/util-rxjs-interop';
import { pipe, switchMap, tap, merge } from 'rxjs';
import {
  PolymorphicComponentOutputsHandlers,
  PolymorphicComponentInputs,
  PolymorphicViewContainerRefParams,
  ExtractOutputEmitterRefs,
} from '../models';
import { PolymorphicComponent } from './polymorphic-component';
import { getInputsFromParams, getOutputHandlersFromParams } from '../utils';

export class PolymorphicViewContainerRef<TComponent extends Type<any>> {
  private readonly injector: Injector;
  private readonly vcr: ViewContainerRef;
  private readonly destroyRef: DestroyRef;
  private readonly renderer = inject(Renderer2);

  private componentRef: ComponentRef<TComponent> | null = null;

  private readonly inputs: PolymorphicComponentInputs<TComponent>;
  private outputsHandlers: Array<Partial<PolymorphicComponentOutputsHandlers<TComponent>>> = [];

  constructor(
    private readonly polymorphicComponent: PolymorphicComponent<TComponent>,
    params?: PolymorphicViewContainerRefParams<TComponent>
  ) {
    this.injector = params?.injector ?? inject(Injector);
    this.vcr = params?.viewContainer ?? inject(ViewContainerRef);
    this.destroyRef = params?.destroyRef ?? inject(DestroyRef);

    this.inputs = getInputsFromParams(params);
    this.updateOutputsHandlers(getOutputHandlersFromParams(params));

    this.destroyRef.onDestroy(() => {
      this.destroy();
    });
  }

  public createComponent(): ComponentRef<TComponent> {
    runInInjectionContext(this.injector, () => {
      this.renderComponent();
      this.observeInputsChanges(this.inputs);
      this.observeOutputsChanges();
      this.applyCssClasses();
    });

    return this.componentRef as ComponentRef<TComponent>;
  }

  public destroy(): void {
    this.componentRef?.destroy();
    this.vcr.clear();
    this.componentRef = null;
  }

  private renderComponent(): void {
    this.destroy();

    this.componentRef = this.vcr.createComponent(this.polymorphicComponent.component, {
      injector: this.polymorphicComponent.createInjector(this.injector),
    });
  }

  public readonly observeInputsChanges = rxMethod<Partial<PolymorphicComponentInputs<TComponent>>>(
    pipe(
      switchMap((inputs) => {
        const mergedInputs = {
          ...this.polymorphicComponent.inputs,
          ...inputs,
        };

        const changes$ = objectEntries(mergedInputs).map(([key, valueOrReactive]) =>
          asInputObservable(valueOrReactive).pipe(
            tap((value) => {
              this.componentRef?.setInput(key, value);
            })
          )
        );

        return merge(...changes$);
      })
    )
  );

  public updateOutputsHandlers(outputsHandlers: Partial<PolymorphicComponentOutputsHandlers<TComponent>>): void {
    this.outputsHandlers = [this.polymorphicComponent.outputsHandlers, outputsHandlers];
  }

  private readonly observeOutputsChanges = rxMethod<void>(
    pipe(
      switchMap(() => {
        const outputs = (this.componentRef?.instance ?? {}) as ExtractOutputEmitterRefs<InstanceType<TComponent>>;

        const changes$ = objectEntries(outputs)
          .filter(([_, eventEmitter]) => eventEmitter instanceof OutputEmitterRef)
          .map(([key, eventEmitter]) => {
            return outputToObservable(eventEmitter).pipe(
              tap((emittedValue) => {
                this.propagateOutputValue(
                  key as keyof ExtractOutputEmitterRefs<InstanceType<TComponent>>,
                  emittedValue
                );
              })
            );
          });

        return merge(...changes$);
      })
    )
  );

  private propagateOutputValue(
    key: keyof ExtractOutputEmitterRefs<InstanceType<TComponent>>,
    emittedValue: unknown
  ): void {
    runInInjectionContext(this.injector, () =>
      this.outputsHandlers.forEach((handlers) => {
        handlers[key]?.(emittedValue);
      })
    );
  }

  private applyCssClasses(): void {
    this.polymorphicComponent.className
      .split(' ')
      .filter((className) => className.length)
      .forEach((className) => {
        this.renderer.addClass(this.componentRef?.location.nativeElement, className);
      });
  }
}
