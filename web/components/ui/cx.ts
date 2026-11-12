/** Une clases CSS condicionales ignorando valores falsos. */
export function cx(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(" ");
}
