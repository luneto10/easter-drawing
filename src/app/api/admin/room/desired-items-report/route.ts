import { listDesiredItemsReportForRoom } from "@/server/application/use-cases/desired-items";
import { ensureRoomAdmin } from "@/server/infrastructure/config/room-admin-auth";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";

function csvEscape(value: string): string {
    if (/[",\n\r]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function slugForFilename(title: string): string {
    const s = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    return s || "room";
}

export async function GET(request: Request) {
    const auth = await ensureRoomAdmin(request);
    if (auth instanceof NextResponse) return auth;

    try {
        const rows = await listDesiredItemsReportForRoom(auth.roomId);
        const header = [
            "Name",
            "Email",
            "Organizer",
            "Desired items",
        ].join(",");
        const lines = rows.map((r) =>
            [
                csvEscape(r.name),
                csvEscape(r.email ?? ""),
                r.isOrganizer ? "yes" : "no",
                csvEscape(r.items.join(" · ")),
            ].join(","),
        );
        const csv = [header, ...lines].join("\r\n");
        const filename = `wishlist-report-${slugForFilename(auth.title)}.csv`;

        return new NextResponse(`\uFEFF${csv}`, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to build report" },
            { status: 500 },
        );
    }
}
