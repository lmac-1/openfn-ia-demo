/** A loose email check: something@something, no spaces. */
export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+$/.test(s);
}

/** Lightning's required-field error, for a `useForm` `validate`. Whitespace counts as blank, as in Ecto. */
export function blank(value: string): string[] {
  return value.trim() ? [] : ["can't be blank"];
}
