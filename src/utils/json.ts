// src/utils/json.ts
export function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: any = {};
  Object.keys(obj).forEach(k => {
    const v = (obj as any)[k];
    if (v !== undefined) out[k] = v;
  });
  return out;
}
