import { Component, computed, inject, Injector, input, runInInjectionContext } from '@angular/core';
import {
  createPolymorphicComponent,
  partial,
  isComponent,
  isTemplateWithContext,
  isPrimitive,
  PolymorphicContent,
  WithPolymorphicContent,
} from '@shared/util-polymorphic-content';
import { PolymorphicComponentOutletDirective } from '../../directives';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { asObservable } from '@shared/util-rxjs-interop';
import { filter, switchMap } from 'rxjs';

@Component({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'polymorphic-outlet',
  imports: [PolymorphicComponentOutletDirective, NgTemplateOutlet, AsyncPipe],
  templateUrl: './polymorphic-outlet.component.html',
  styleUrl: './polymorphic-outlet.component.scss',
})
export class PolymorphicOutletComponent<T = any> implements WithPolymorphicContent<T> {
  private readonly injector = inject(Injector);

  public readonly content = input<PolymorphicContent<T>>();

  public readonly isComponent = computed(() => isComponent(this.content()));

  public readonly asComponent = computed(() => {
    const maybeComponent = this.content();
    return isComponent(maybeComponent) ? maybeComponent : undefined;
  });

  public readonly isTemplate = computed(() => isTemplateWithContext(this.content()));
  public readonly asTemplate = computed(() => {
    const maybeTemplate = this.content();

    return isTemplateWithContext(maybeTemplate) ? maybeTemplate : undefined;
  });

  public readonly asPrimitive$ = asObservable(this.content).pipe(
    filter((content) => isPrimitive(content)),
    switchMap((primitive) => runInInjectionContext(this.injector, () => asObservable(primitive)))
  );
}

export const polymorphicOutlet = createPolymorphicComponent(PolymorphicOutletComponent);
export const polymorphicOutlettPartial = partial(polymorphicOutlet);
