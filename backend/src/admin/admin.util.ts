export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseOptionalBoolean(value?: string) {
  if (value === undefined || value === "") {
    return undefined;
  }

  return value === "true";
}
