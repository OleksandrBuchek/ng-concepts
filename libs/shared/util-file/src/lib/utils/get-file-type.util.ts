import { FileMIMEType, FileType } from '../models';

export const toMimeTypeTuple = <T extends FileMIMEType>(
  rule: T
): T extends `${infer Type}/${infer Format}`
  ? [Type, Format]
  : [string, string] => rule.split('/') as any;

export const getFileType = (fileMIMEType: File['type']): FileType => {
  // MIME type is `type/subtype`, see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#structure_of_a_mime_type
  const [type] = toMimeTypeTuple(fileMIMEType as FileMIMEType);

  return type;
};
