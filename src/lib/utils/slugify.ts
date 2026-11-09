export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function isValidSlug(slug: string): boolean {
  // Alphanumeric with hyphens, 3 to 30 characters, no leading/trailing hyphen
  const regex = /^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$/;
  return regex.test(slug);
}
