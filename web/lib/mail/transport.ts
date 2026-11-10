import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/* SMTP vanuit Next (besluit 10 nov 2026). Lokaal via Mailpit
   (SMTP_URL=smtp://127.0.0.1:1025), in productie elke SMTP-dienst.

     SMTP_URL   smtp://user:pass@host:587 of smtps://...:465
     MAIL_FROM  "Wicked Workshops <hallo@wickedworkshops.nl>"

   Zonder SMTP_URL wordt er niets verstuurd en alleen gelogd: de pilot mag
   niet stuk gaan op een ontbrekende mailinstelling. */

let transporter: Transporter | null = null;

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_URL);
}

export function mailFrom(): string {
  return process.env.MAIL_FROM || "Wicked Workshops <hallo@wickedworkshops.nl>";
}

export type OutgoingMail = { to: string; subject: string; text: string; html: string; replyTo?: string };

/* true als verstuurd. Gooit bij een SMTP-fout, zodat de aanroeper kan
   vastleggen dat het mislukte. */
export async function deliver(mail: OutgoingMail): Promise<boolean> {
  if (!isMailConfigured()) {
    console.warn(`Mail niet verstuurd (geen SMTP_URL): "${mail.subject}" aan ${mail.to}`);
    return false;
  }
  transporter ??= nodemailer.createTransport(process.env.SMTP_URL);
  await transporter.sendMail({ from: mailFrom(), ...mail });
  return true;
}
