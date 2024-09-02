export const toCssClass = (classNames: string[] | string | undefined): string =>
  ((Array.isArray(classNames) ? classNames.map((className) => className.trim()).join(' ') : classNames) || '').trim();
