import { Type } from '@angular/core';
import {
  PolymorphicContent,
  PolymorphicPrimitive,
  TemplateWithContext,
} from '../models';
import { isObject } from 'lodash-es';
import { PolymorphicComponent } from '../classes';

export const isComponent = <T>(
  content: PolymorphicContent<T>
): content is PolymorphicComponent<Type<T>> =>
  content instanceof PolymorphicComponent;

export const isTemplateWithContext = <T>(
  content: PolymorphicContent<T>
): content is TemplateWithContext<T> =>
  isObject(content) && 'templateRef' in content && 'context' in content;

export const isPrimitive = <T>(
  content: PolymorphicContent<T>
): content is PolymorphicPrimitive =>
  !isComponent(content) && !isTemplateWithContext(content);
