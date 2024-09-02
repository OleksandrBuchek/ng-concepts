import { Component, input } from '@angular/core';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { PolymorphicOutletComponent } from '@shared/ui-polymorphic-outlet';
import {
  createPolymorphicComponent,
  partial,
  PolymorphicContent,
  WithPolymorphicContent,
} from '@shared/util-polymorphic-content';

@Component({
  selector: 'with-tooltip',
  standalone: true,
  imports: [MatTooltipModule, PolymorphicOutletComponent],
  templateUrl: './with-tooltip.component.html',
  styleUrl: './with-tooltip.component.scss',
})
export class WithTooltipComponent<T = any> implements WithPolymorphicContent<T> {
  public readonly content = input<PolymorphicContent<T>>();
  
  public readonly position = input<TooltipPosition, TooltipPosition | undefined>('below', {
    transform: (input) => input ?? 'below',
  });

  public readonly text = input<string>();
}

export const createWithTooltipComponent = createPolymorphicComponent(WithTooltipComponent);
export const createWithTooltipComponentPartial = partial(createWithTooltipComponent);
