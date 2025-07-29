import { ReactElement } from 'react';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || "")

interface SendEmailParams {
    to: string;
    subject: string;
    react: ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailParams) {
    try {
        const actualTo = process.env.NODE_ENV === 'development'
            ? 'vishnumegharaj87@gmail.com'
            : to;

        const { data, error } = await resend.emails.send({
            from: 'Fintrix Finance App <onboarding@resend.dev>',
            to : actualTo,
            subject,
            react,
        });
        if (error) {
            console.log("Error sending email:", error);
            throw new Error(error.message);
        } else {
            console.log("Email sent successfully:", data);
        }

        return {
            success: true,
            data,
        }
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}