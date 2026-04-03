import { NextResponse } from "next/server";

export const ACCOUNT_NOT_FOUND_MESSAGE = "Account not found.";

/** Standard 404 response used when a participant cannot be resolved. */
export function participantNotFoundResponse() {
    return NextResponse.json(
        { error: ACCOUNT_NOT_FOUND_MESSAGE },
        { status: 404 },
    );
}

