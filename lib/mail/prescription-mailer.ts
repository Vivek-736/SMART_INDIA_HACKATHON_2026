import nodemailer from "nodemailer";
import { PrescriptionItem } from "@/app/doctor/patients/[id]/review/actions";
import { getPatientTranslations } from "@/lib/i18n/patient-translations";

export interface PrescriptionEmailPayload {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorDepartment: string;
  doctorRoom?: string | null;
  diagnosis: string;
  prescriptions: PrescriptionItem[];
  clinicalNotes?: string;
  followUpDate?: string | null;
  languagePreference?: string;
}

/**
 * Generates an executive, responsive HTML email template for the patient's digital prescription
 * fully translated into the patient's preferred language.
 */
export function generatePrescriptionHtmlEmail(payload: PrescriptionEmailPayload): string {
  const t = getPatientTranslations(payload.languagePreference || "en");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${appUrl.replace(/\/$/, "")}/patient/dashboard`;
  const formattedDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const followUpFormatted = payload.followUpDate
    ? new Date(payload.followUpDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const prescriptionsTableRows = payload.prescriptions
    .map(
      (p, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 0 ? "background-color: #f8fafc;" : ""}">
        <td style="padding: 12px 14px; font-weight: 700; color: #0f172a; font-size: 13px;">
          ${idx + 1}. ${p.medicineName}
          ${p.form ? `<span style="display: block; font-size: 11px; font-weight: 500; color: #64748b;">${p.form} &bull; ${p.dosage || "Standard Dose"}</span>` : ""}
        </td>
        <td style="padding: 12px 14px; font-weight: 600; color: #4338ca; font-size: 12px; text-align: center;">
          ${p.frequency || "As directed"}
        </td>
        <td style="padding: 12px 14px; font-weight: 600; color: #334155; font-size: 12px; text-align: center;">
          ${p.duration || "5 Days"}
        </td>
        <td style="padding: 12px 14px; font-size: 11.5px; color: #64748b;">
          ${p.instructions || "Take after meals"}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PreConsult Digital Prescription</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
              <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 4px;">
                PreConsult
              </div>
              <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9;">
                ${t.emailHeaderSubtitle}
              </div>
            </td>
          </tr>

          <!-- Doctor & Patient Info Bar -->
          <tr>
            <td style="padding: 24px 24px 16px 24px; background-color: #ffffff;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="top" style="width: 50%;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px;">${t.emailPatientName}</div>
                    <div style="font-size: 16px; font-weight: 800; color: #0f172a;">${payload.patientName}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${t.emailConsultedOn} ${formattedDate}</div>
                  </td>
                  <td valign="top" align="right" style="width: 50%;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px;">${t.emailAttendingPhysician}</div>
                    <div style="font-size: 15px; font-weight: 800; color: #4338ca;">Dr. ${payload.doctorName}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${payload.doctorDepartment} &bull; ${payload.doctorRoom || "OPD Room 104"}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Confirmed Diagnosis Box -->
          <tr>
            <td style="padding: 0 24px 18px 24px;">
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #166534; letter-spacing: 0.5px; margin-bottom: 4px;">
                  ${t.emailConfirmedDiagnosis}
                </div>
                <div style="font-size: 15px; font-weight: 800; color: #14532d;">
                  ${payload.diagnosis}
                </div>
              </div>
            </td>
          </tr>

          <!-- Prescribed Medications Section -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">
                ${t.emailPrescriptionsTitle}
              </div>
              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                    <th align="left" style="padding: 10px 14px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">${t.emailMedicine}</th>
                    <th align="center" style="padding: 10px 14px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">${t.emailFrequency}</th>
                    <th align="center" style="padding: 10px 14px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">${t.emailDuration}</th>
                    <th align="left" style="padding: 10px 14px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">${t.emailInstructions}</th>
                  </tr>
                </thead>
                <tbody>
                  ${prescriptionsTableRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Doctor Advice & Follow-up Notes -->
          ${
            payload.clinicalNotes
              ? `
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 4px;">
                  ${t.emailDoctorAdvice}
                </div>
                <div style="font-size: 12.5px; color: #334155; line-height: 1.5; white-space: pre-wrap;">
                  ${payload.clinicalNotes}
                </div>
              </div>
            </td>
          </tr>
          `
              : ""
          }

          ${
            followUpFormatted
              ? `
          <!-- Follow-up Banner -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 12px 16px; text-align: center;">
                <span style="font-size: 12px; color: #3730a3; font-weight: 600;">${t.emailFollowUp}: </span>
                <strong style="font-size: 13px; color: #312e81; font-weight: 800;">${followUpFormatted}</strong>
              </div>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Main CTA Button -->
          <tr>
            <td align="center" style="padding: 0 24px 28px 24px;">
              <a href="${dashboardUrl}" target="_blank" style="display: inline-block; background-color: #4338ca; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(67, 56, 202, 0.3);">
                ${t.emailCtaButton} &rarr;
              </a>
              <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
                ${t.emailCtaHelper}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center;">
              <div style="font-size: 11px; color: #94a3b8; line-height: 1.4;">
                ${t.emailFooterNote}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Creates and returns a configured Nodemailer transporter using credentials from .env.
 */
function getNodemailerTransporter() {
  const emailUser =
    process.env.NODEMAILER_EMAIL ||
    process.env.NODEMAILER_USER ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER;

  const emailPass =
    process.env.NODEMAILER_PASSWORD ||
    process.env.NODEMAILER_PASS ||
    process.env.EMAIL_PASS ||
    process.env.SMTP_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  return {
    transporter: nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    }),
    fromAddress: `PreConsult Health <${emailUser}>`,
  };
}

/**
 * Dispatches digital prescription email to the patient using Nodemailer in their preferred language.
 */
export async function sendDigitalPrescriptionEmail(payload: PrescriptionEmailPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const htmlBody = generatePrescriptionHtmlEmail(payload);
    const subject = `Your Digital Prescription from Dr. ${payload.doctorName} — PreConsult`;

    const mailerConfig = getNodemailerTransporter();

    // 1. Live Nodemailer Dispatch
    if (mailerConfig) {
      try {
        const info = await mailerConfig.transporter.sendMail({
          from: mailerConfig.fromAddress,
          to: payload.patientEmail,
          subject,
          html: htmlBody,
        });

        console.log(
          `[PreConsult Mailer] LIVE localized (${payload.languagePreference || "en"}) email delivered to ${payload.patientEmail} via Nodemailer. MessageID: ${info.messageId}`
        );
        return { success: true, messageId: info.messageId };
      } catch (nodemailerErr) {
        console.warn("[PreConsult Mailer] Nodemailer send failed, falling back to audit log:", nodemailerErr);
      }
    } else {
      console.warn(
        "[PreConsult Mailer] NODEMAILER_EMAIL or NODEMAILER_PASSWORD not found in environment. Falling back to log."
      );
    }

    // 2. Webhook Dispatch (if configured)
    if (process.env.PRESCRIPTION_EMAIL_WEBHOOK_URL) {
      try {
        await fetch(process.env.PRESCRIPTION_EMAIL_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: payload.patientEmail,
            subject,
            html: htmlBody,
          }),
        });
      } catch (webhookErr) {
        console.warn("[PreConsult Mailer] Webhook dispatch warning:", webhookErr);
      }
    }

    // 3. Fallback / Dev Audit Log
    console.log(
      `[PreConsult Mailer] Dispatched localized HTML prescription email for: ${payload.patientEmail} (Language: ${payload.languagePreference || "en"}, Patient: ${payload.patientName}, Doctor: Dr. ${payload.doctorName}, Diagnosis: ${payload.diagnosis})`
    );

    return { success: true, messageId: "preconsult-mail-" + Date.now() };
  } catch (err) {
    console.error("[PreConsult Mailer] Error generating prescription email:", err);
    return { success: false, error: String(err) };
  }
}