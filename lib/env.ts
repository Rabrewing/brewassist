export function envBool(v: unknown, defaultValue = false) {
  if (v === undefined || v === null) return defaultValue;
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "y" || s === "on";
}

export function envStr(v: unknown) {
  const s = String(v ?? "").trim();
  return s.length ? s : undefined;
}
