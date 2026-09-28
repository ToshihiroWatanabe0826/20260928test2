export function parseServerPort(configuredPort: string | undefined): number {
  const value = configuredPort ?? "4174";
  if (!/^\d+$/.test(value) || Number(value) > 65535) {
    throw new Error("PORT must be an integer between 0 and 65535.");
  }
  return Number(value);
}
