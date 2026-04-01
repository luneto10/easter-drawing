const SUBJECT = "Your participant account";

type Params = {
    name: string;
    userId: string;
    appUrl?: string;
};

function accountLink(appUrl: string, userId: string): string {
    const base = appUrl.replace(/\/$/, "");
    const qs = new URLSearchParams({ giverId: userId });
    return `${base}/?${qs.toString()}`;
}

export function buildWelcomeEmailTemplate(params: Params) {
    const link = accountLink(params.appUrl ?? "", params.userId);

    const html = `<p>Hi ${params.name}!</p>
<p>Your participant ID is:</p>
<p style="font-family:monospace;font-size:14px;">${params.userId}</p>
<p>Save this link — it opens the app with your ID already filled in. You still need a room ID from your organizer (or create/join a room from the home page).</p>
<p><a href="${link}">${link}</a></p>`;

    return { subject: SUBJECT, html };
}
