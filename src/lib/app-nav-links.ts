/** Shared URL builders for invite / join flows (home `?room=`, join page `?room=`). */

export function joinPageHref(roomId: string | null | undefined): string {
    const id = roomId?.trim();
    return id ? `/join?room=${encodeURIComponent(id)}` : "/join";
}

export function homePageHref(roomId: string | null | undefined): string {
    const id = roomId?.trim();
    return id ? `/?room=${encodeURIComponent(id)}` : "/";
}
