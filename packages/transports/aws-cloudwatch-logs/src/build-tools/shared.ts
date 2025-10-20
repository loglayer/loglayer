// Extracts the query params from an import URL (ex: ./worker?thread=...)
export function getImportQueryParams(id: string) {
  return new URL(id.replace(/^C:/, "/"), "file:").searchParams;
}
