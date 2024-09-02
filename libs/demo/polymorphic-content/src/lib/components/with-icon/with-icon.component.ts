import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PolymorphicOutletComponent } from '@shared/ui-polymorphic-outlet';
import {
  createPolymorphicComponent,
  partial,
  PolymorphicContent,
  WithPolymorphicContent,
} from '@shared/util-polymorphic-content';
import { IconDirection } from './models';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'with-icon',
  standalone: true,
  imports: [MatIconModule, PolymorphicOutletComponent],
  templateUrl: './with-icon.component.html',
  styleUrl: './with-icon.component.scss',
})
export class WithIconComponent<T> implements WithPolymorphicContent<T> {
  public readonly content = input<PolymorphicContent<T>>();
  public readonly icon = input<string, string | undefined>('info', {
    transform: (input) => input ?? 'info',
  });
  public readonly direction = input<IconDirection, IconDirection | undefined>('before', {
    transform: (input) => input ?? 'before',
  });

  public readonly color = input<ThemePalette, ThemePalette | undefined>('primary', {
    transform: (input) => input ?? 'primary',
  });

  public readonly iconClicked = output<void>();
}

export const createWithIconComponent = createPolymorphicComponent(WithIconComponent);
export const createWithIconComponentPartial = partial(createWithIconComponent);
