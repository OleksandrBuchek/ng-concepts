import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { PolymorphicOutletComponent } from '@shared/ui-polymorphic-outlet';
import { composePolymorphicWrappers, PolymorphicContent } from '@shared/util-polymorphic-content';
import { WithBadgeComponent, WithIconComponent, WithTooltipComponent } from '../components';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';

import { MatCardModule } from '@angular/material/card';
import { COMPONENT_WRAPPERS_MAP } from '../mappers';
import { ComponentWrapperType } from '../models';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { controlValueSignal } from '@shared/util-forms';
import { WRAPPERS } from '../consts';

@Component({
  selector: 'lib-polymorphic-content-demo',
  standalone: true,
  imports: [
    PolymorphicOutletComponent,
    WithIconComponent,
    WithTooltipComponent,
    WithBadgeComponent,
    MatCardModule,
    MatListModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './polymorphic-content-demo.component.html',
  styleUrl: './polymorphic-content-demo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PolymorphicContentDemoComponent {
  public readonly wrappers: ComponentWrapperType[] = WRAPPERS;
  public readonly contentControl = new FormControl('Content value', { nonNullable: true });

  public readonly $selectedWrappers = signal<ComponentWrapperType[]>(this.wrappers);
  public readonly $controlValue = controlValueSignal(this.contentControl);
  public readonly $polymorphicView = computed(() => this.getPolymorphicView());

  public onWrapperSelectionChange(event: MatSelectionListChange): void {
    this.$selectedWrappers.update((currentValue) => {
      const [{ selected, value }] = event.options;

      if (selected) {
        return [...currentValue, value];
      } else {
        return currentValue.filter((v) => v !== value);
      }
    });
  }

  private getPolymorphicView(): PolymorphicContent<unknown> {
    const wrappers = this.wrappers
      .filter((wrapper) => this.$selectedWrappers().includes(wrapper))
      .map((wrapper) => COMPONENT_WRAPPERS_MAP[wrapper]);

    const wrapContent = composePolymorphicWrappers(...wrappers);

    return wrapContent(this.$controlValue);
  }
}
