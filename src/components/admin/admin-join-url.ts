/** Site URL that opens the home page with this room pre-filled. */
export function buildParticipantJoinUrl(roomId: string): string {
    const id = roomId.trim();
    if (!id || typeof window === "undefined") return "";
    return `${window.location.origin}/?room=${encodeURIComponent(id)}`;
}
