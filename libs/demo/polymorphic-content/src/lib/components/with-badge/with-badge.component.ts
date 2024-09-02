import { Component, input } from '@angular/core';
import { MatBadgeModule, MatBadgePosition } from '@angular/material/badge';
import { PolymorphicOutletComponent } from '@shared/ui-polymorphic-outlet';
import {
  createPolymorphicComponent,
  partial,
  PolymorphicContent,
  WithPolymorphicContent,
} from '@shared/util-polymorphic-content';

@Component({
  selector: 'with-badge',
  standalone: true,
  imports: [MatBadgeModule, PolymorphicOutletComponent],
  templateUrl: './with-badge.component.html',
  styleUrl: './with-badge.component.scss',
})
export class WithBadgeComponent<T> implements WithPolymorphicContent<T> {
  public readonly content = input<PolymorphicContent<T>>();
  public readonly badge = input<string>();
  public readonly overlap = input<boolean, boolean | undefined>(false, {
    transform: (input) => input ?? false,
  });
  public readonly position = input<MatBadgePosition, MatBadgePosition | undefined>('after', {
    transform: (input) => input ?? 'after',
  });
}

export const createWithBadgeComponent = createPolymorphicComponent(WithBadgeComponent);
export const createWithBadgeComponentPartial = partial(createWithBadgeComponent);
