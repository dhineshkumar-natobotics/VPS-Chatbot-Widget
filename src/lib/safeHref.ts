export function safeHref(value: string): string | undefined {
  const url = value.trim();
  if (/[\u0000-\u001f\u007f]/.test(url)) return undefined;
  if (/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(url)) return url;
  return undefined;
}
