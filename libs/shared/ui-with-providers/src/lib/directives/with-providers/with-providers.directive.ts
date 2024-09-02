import {
  Directive,
  inject,
  Injector,
  input,
  OnChanges,
  Provider,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { isNullOrUndefined } from '@shared/util-helpers';

@Directive({
  selector: '[withProviders]',
  standalone: true,
})
export class WithProvidersDirective implements OnChanges {
  public readonly providers = input<
    Provider[],
    Provider | Provider[] | undefined | null
  >([], {
    alias: 'withProviders',
    transform: (input) => {
      if (isNullOrUndefined(input)) {
        return [];
      }

      return Array.isArray(input) ? input : [input];
    },
  });
  constructor(
    private readonly templateRef: TemplateRef<unknown> = inject<
      TemplateRef<unknown>
    >(TemplateRef),
    private readonly viewContainer: ViewContainerRef = inject(ViewContainerRef),
    private readonly injector: Injector = inject(Injector)
  ) {}

  public ngOnChanges(): void {
    this.createView();
  }

  private createView(): void {
    this.viewContainer.clear();

    this.viewContainer.createEmbeddedView(
      this.templateRef,
      {},
      {
        injector: Injector.create({
          parent: this.injector,
          providers: this.providers(),
        }),
      }
    );
  }
}
