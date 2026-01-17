export const BASE_PATH = "/en";
export const prefixPath = (path: string) => {
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p.startsWith(BASE_PATH)) return p;
  return `${BASE_PATH}${p}`;
};
