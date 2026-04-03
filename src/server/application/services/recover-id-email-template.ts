const SUBJECT = "Your participant ID";

type Params = {
    name: string;
    userId: string;
    appUrl?: string;
};

function loginLink(appUrl: string, userId: string): string {
    const base = appUrl.replace(/\/$/, "");
    const qs = new URLSearchParams({ giverId: userId });
    return `${base}/?${qs.toString()}`;
}

export function buildRecoverIdEmailTemplate(params: Params) {
    const link = loginLink(params.appUrl ?? "", params.userId);
    const html = `<p>Hi ${params.name}!</p>
<p>You asked for a reminder of your participant ID:</p>
<p style="font-family:monospace;font-size:14px;">${params.userId}</p>
<p>Use this ID to log in on the home page. You can open the app with this link — you still need your room ID from your organizer when you join a draw.</p>
<p><a href="${link}">${link}</a></p>
<p>If you did not request this email, you can ignore it.</p>`;

    return { subject: SUBJECT, html };
}
