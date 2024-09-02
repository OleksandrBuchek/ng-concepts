import { Observable } from 'rxjs';

export type UIOption<T> = {
  value: T;
  label: string;
};

export type UIOptionAsync<T> = {
  value: T;
  label$: Observable<string>;
};
