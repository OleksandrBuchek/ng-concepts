import { Signal } from '@angular/core';

export type AsSignals<T extends Record<string, any>> = {
  [Key in keyof T]: Signal<T[Key]>;
};

export type WithSignals<T extends Record<string, any>> = {
  [Key in keyof T]: T[Key] | Signal<T[Key]>;
};
