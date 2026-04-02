export const UUID_HEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeClientUuid(id: string): string {
    const t = id.trim();
    return UUID_HEX.test(t) ? t.toLowerCase() : t;
}
