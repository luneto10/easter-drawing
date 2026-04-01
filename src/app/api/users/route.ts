import { createUserBodySchema } from "@/server/application/dto/create-user-body";
import { toUserListItem } from "@/server/application/dto/user-list-item";
import { buildWelcomeEmailTemplate } from "@/server/application/services/welcome-email-template";
import { sendEmail } from "@/server/infrastructure/adapters/email";
import { createUser, listUsers } from "@/server/application/use-cases/users";
import { DomainError } from "@/server/shared/errors/domain-error";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const users = await listUsers();
        return NextResponse.json(users.map(toUserListItem));
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to list users" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = createUserBodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 },
        );
    }

    try {
        const user = await createUser(parsed.data.name, parsed.data.email ?? null);

        if (user.email) {
            try {
                const { subject, html } = buildWelcomeEmailTemplate({
                    name: user.name,
                    userId: user.id,
                    appUrl: process.env.APP_URL,
                });
                await sendEmail({
                    to: user.email,
                    subject,
                    html,
                });
            } catch (emailErr) {
                console.error(emailErr);
            }
        }

        return NextResponse.json(toUserListItem(user), { status: 201 });
    } catch (error) {
        if (error instanceof DomainError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 },
        );
    }
}
