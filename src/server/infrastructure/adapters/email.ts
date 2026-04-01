import nodemailer from "nodemailer";

function getTransporter() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
        throw new Error(
            "GMAIL_USER or GMAIL_APP_PASSWORD is not configured",
        );
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user,
            pass,
        },
    });
}

export async function sendEmail(params: {
    to: string;
    subject: string;
    html: string;
}) {
    const transporter = getTransporter();
    const from = process.env.EMAIL_FROM || process.env.GMAIL_USER;
    if (!from) {
        throw new Error("EMAIL_FROM or GMAIL_USER must be configured");
    }

    const info = await transporter.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
    });

    return info;
}
