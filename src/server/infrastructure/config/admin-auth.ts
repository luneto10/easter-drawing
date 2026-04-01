import { NextResponse } from "next/server";

export function ensureAdminCode(request: Request): NextResponse | null {
    const expectedCode = process.env.ADMIN_CODE;
    if (!expectedCode) {
        return NextResponse.json(
            { error: "ADMIN_CODE is not configured on server" },
            { status: 500 },
        );
    }

    const providedCode = request.headers.get("x-admin-code");
    if (!providedCode || providedCode !== expectedCode) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return null;
}
