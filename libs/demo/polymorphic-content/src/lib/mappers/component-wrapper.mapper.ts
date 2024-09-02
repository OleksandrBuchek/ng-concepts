import { PolymorphicComponentFactory, WithPolymorphicContent } from '@shared/util-polymorphic-content';
import { ComponentWrapperType } from '../models';
import {
  createWithBadgeComponentPartial,
  createWithIconComponentPartial,
  createWithTooltipComponentPartial,
} from '../components';
import { inject, Type } from '@angular/core';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';

import { MatSnackBar } from '@angular/material/snack-bar';

const BADGE = createWithBadgeComponentPartial({
  inputs: {
    badge: 'Polymorphic',
    position: 'above after',
  },
});

const ICON = createWithIconComponentPartial({
  inputs: {
    icon: 'delete',
  },
  outputsHandlers: {
    iconClicked: () => {
      inject(MatSnackBar).open('Icon clicked');
    },
  },
});

const TOOLTIP = createWithTooltipComponentPartial({
  inputs: {
    position: 'above',
    text: 'Polymorphic tooltip',
  },
  providers: [
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: {
        disableTooltipInteractivity: false,
      },
    },
  ],
});

export const COMPONENT_WRAPPERS_MAP: Record<
  ComponentWrapperType,
  PolymorphicComponentFactory<Type<WithPolymorphicContent>>
> = {
  badge: BADGE,
  icon: ICON,
  tooltip: TOOLTIP,
};
