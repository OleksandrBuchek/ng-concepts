import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'demos/polymorphic-views',
  },
  {
    path: 'demos',
    children: [
      {
        path: 'polymorphic-views',
        loadChildren: async () => (await import('@demo/polymorphic-content')).polymorphicContentDemoRoutes,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
