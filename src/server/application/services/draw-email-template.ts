const DRAW_EMAIL_SUBJECT = "BRASA Easter Draw";

type DrawEmailTemplateParams = {
    giverName: string;
    giverId: string;
    recipientName?: string;
    appUrl?: string;
};

export function buildDrawEmailTemplate(params: DrawEmailTemplateParams) {
    const baseUrl = params.appUrl ?? "";
    const link = `${baseUrl}/?giverId=${params.giverId}`;

    const html = params.recipientName
        ? `<p>Hi ${params.giverName}!</p><p>Your selected person is here!! You can use the id ${params.giverId}</p><p>Open your link: <a href="${link}">${link}</a></p>`
        : `<p>Hi ${params.giverName}!</p><p>Your Easter Draw person is not assigned yet.</p>`;

    return {
        subject: DRAW_EMAIL_SUBJECT,
        html,
    };
}
