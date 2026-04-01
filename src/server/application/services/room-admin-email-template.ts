type Params = {
    roomTitle: string;
    organizationName: string;
    eventName: string;
    adminUrl: string;
};

export function buildRoomAdminEmailTemplate(params: Params) {
    const subject = `${params.organizationName} — ${params.eventName} draw: admin link`;

    const html = `<p>Your room <strong>${params.roomTitle}</strong> (${params.organizationName}, ${params.eventName}) is ready.</p>
<p>Use this link to open the admin panel (keep it private):</p>
<p><a href="${params.adminUrl}">${params.adminUrl}</a></p>
<p>The page will ask for your admin code; it is included in the link.</p>`;

    return { subject, html };
}
