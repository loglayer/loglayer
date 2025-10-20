export function getImportQueryParams(id: string) {
  return new URL(id.replace(/^C:/, "/"), "file:").searchParams;
}
