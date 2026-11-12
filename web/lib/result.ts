// Resultado explícito para operaciones de dominio: evita excepciones y obliga a
// la interfaz a manejar los casos de error con un mensaje legible.

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = <T = never>(error: string): Result<T> => ({ ok: false, error });
