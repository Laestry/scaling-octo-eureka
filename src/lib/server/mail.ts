// src/lib/server/mail.ts
//
// SMTP transport for the transactional mail this app sends. Credentials come from
// $env/dynamic/private rather than $env/static/private so a deploy without them still
// builds — the failure then happens at send time, where it can be reported properly.

import { env } from '$env/dynamic/private';
import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function required(name: string): string {
    const value = env[name]?.trim();
    if (!value) throw new Error(`Missing environment variable ${name}`);
    return value;
}

function getTransporter(): Transporter {
    if (transporter) return transporter;

    const port = Number(env['SMTP_PORT'] ?? 465);

    transporter = nodemailer.createTransport({
        host: required('SMTP_HOST'),
        port,
        // 465 speaks TLS from the first byte; 587 and friends start plain and STARTTLS up.
        secure: port === 465,
        auth: { user: required('SMTP_USER'), pass: required('SMTP_PASS') }
    });

    return transporter;
}

/** MAIL_TO holds one or more addresses separated by "; ". */
export function mailRecipients(): string[] {
    return required('MAIL_TO')
        .split(';')
        .map((address) => address.trim())
        .filter(Boolean);
}

export async function sendMail(message: { subject: string; text: string; html: string; replyTo?: string }) {
    const to = mailRecipients();
    if (!to.length) throw new Error('MAIL_TO contains no address');

    return getTransporter().sendMail({
        from: required('MAIL_FROM'),
        to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        ...(message.replyTo ? { replyTo: message.replyTo } : {})
    });
}
