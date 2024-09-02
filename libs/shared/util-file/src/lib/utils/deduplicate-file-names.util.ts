export function deduplicateFileNames(files: File[]): File[] {
  const names: Record<string, number> = {};

  return Array.from(files).map((file) => {
    const { name, type, lastModified } = file;

    if (names[name] !== undefined) {
      const newName = name.replace(/(.*)(\..*)/, `$1 (${++names[name]})$2`);

      return new File([file], newName, { type, lastModified });
    }

    names[name] = 0;

    return file;
  });
}
