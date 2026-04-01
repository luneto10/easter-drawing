type DrawEmailTemplateParams = {
    giverName: string;
    giverId: string;
    recipientName?: string;
    roomId: string;
    organizationName: string;
    eventName: string;
    appUrl?: string;
};

function participantDrawLink(appUrl: string, roomId: string, giverId: string): string {
    const base = appUrl.replace(/\/$/, "");
    const qs = new URLSearchParams({
        room: roomId,
        giverId,
    });
    return `${base}/?${qs.toString()}`;
}

export function buildDrawEmailTemplate(params: DrawEmailTemplateParams) {
    const link = participantDrawLink(
        params.appUrl ?? "",
        params.roomId,
        params.giverId,
    );

    const subject = `${params.organizationName} — ${params.eventName} draw`;

    const html = params.recipientName
        ? `<p>Hi ${params.giverName}!</p><p>Your ${params.eventName} draw is ready. Open this link to see who you give to (your participant ID is already in the link):</p><p><a href="${link}">${link}</a></p>`
        : `<p>Hi ${params.giverName}!</p><p>Your ${params.eventName} draw assignment is not ready yet. When the organizer runs the draw, you will get another email. You can also save this link — your participant ID is included:</p><p><a href="${link}">${link}</a></p>`;

    return {
        subject,
        html,
    };
}
