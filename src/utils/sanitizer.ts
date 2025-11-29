export const cleanText = (input: string): string => {
  if (!input) return "";

  // 1. Remove HTML tags (if user pasted rich text)
  let text = input.replace(/<[^>]*>?/gm, " ");

  // 2. Decode HTML entities (e.g. &amp; -> &)
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  text = txt.value;

  // 3. Normalize whitespace (keep line breaks, but remove double spaces/tabs)
  // We want to preserve paragraphs (double newlines) but kill excess internal spacing
  return text; 
  // Note: For the textarea we usually want to keep the user's formatting, 
  // but for *analysis* we use this cleaned version.
};

/**
 * Escapes regex special characters to prevent crashes if a user types "[*+?^${}()|]"
 */
export const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};