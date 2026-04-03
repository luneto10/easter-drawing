import { recoverIdBodySchema } from "@/server/application/dto/recover-id-body";
import { buildRecoverIdEmailTemplate } from "@/server/application/services/recover-id-email-template";
import { sendEmail } from "@/server/infrastructure/adapters/email";
import { getUserByEmail } from "@/server/application/use-cases/users";
import { NextResponse } from "next/server";

const PUBLIC_SUCCESS_MESSAGE =
    "If an account exists for that email, we sent your participant ID. Check your inbox (and spam).";

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = recoverIdBodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 },
        );
    }

    try {
        const user = await getUserByEmail(parsed.data.email);
        if (user?.email) {
            const { subject, html } = buildRecoverIdEmailTemplate({
                name: user.name,
                userId: user.participantId,
                appUrl: process.env.APP_URL,
            });
            await sendEmail({
                to: user.email,
                subject,
                html,
            });
        }
    } catch (err) {
        console.error(err);
    }

    return NextResponse.json({
        ok: true,
        message: PUBLIC_SUCCESS_MESSAGE,
    });
}
