import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { Observable, startWith } from 'rxjs';

export function controlValue<C extends AbstractControl>(control: C): Observable<C['value']> {
  return control.valueChanges.pipe(startWith(control.value));
}

export function controlValueSignal<C extends AbstractControl>(control: C): Signal<C['value']> {
  return toSignal(control.valueChanges.pipe(startWith(control.value)), { requireSync: true });
}
