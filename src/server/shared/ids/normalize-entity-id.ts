/** UUIDs in the DB are stored lowercase; pasted links or IDs may be upper case — TEXT primary keys compare case-sensitively. */
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeEntityId(id: string): string {
    const t = id.trim();
    if (!t) return t;
    return UUID_RE.test(t) ? t.toLowerCase() : t;
}
