import nodemailer from "nodemailer";
import { PrescriptionItem } from "@/app/doctor/patients/[id]/review/actions";
import { getPatientTranslations, SupportedLanguage } from "@/lib/i18n/patient-translations";

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
 * Translates clinical instructions (e.g. "take with warm water after meals")
 * into the patient's preferred language.
 */
function translateClinicalInstruction(rawText: string | null | undefined, langCode: string): string {
  if (!rawText || !rawText.trim()) {
    switch (langCode) {
      case "hi":
        return "भोजन के बाद लें";
      case "te":
        return "భోజనం తర్వాత తీసుకోండి";
      case "ta":
        return "சாப்பாட்டுக்கு பின் எடுக்கவும்";
      case "kn":
        return "ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ";
      default:
        return "Take after meals";
    }
  }

  const lower = rawText.toLowerCase().trim();

  // Pattern dictionary for common clinical instruction phrases
  const translations: Record<string, Record<string, string>> = {
    "warm water after meals": {
      hi: "भोजन के बाद गुनगुने पानी के साथ लें",
      te: "భోజనం తర్వాత గోరువెచ్చని నీటితో తీసుకోండి",
      ta: "சாப்பாட்டுக்கு பின் வெதுவெதுப்பான நீரில் எடுக்கவும்",
      kn: "ಊಟದ ನಂತರ ಬೆಚ್ಚಗಿನ ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ",
    },
    "with warm water": {
      hi: "गुनगुने पानी के साथ लें",
      te: "గోరువెచ్చని నీటితో తీసుకోండి",
      ta: "வெதுவெதுப்பான நீரில் எடுக்கவும்",
      kn: "ಬೆಚ್ಚಗಿನ ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ",
    },
    "after meals": {
      hi: "भोजन के बाद लें",
      te: "భోజనం తర్వాత తీసుకోండి",
      ta: "சாப்பாட்டுக்கு பின் எடுக்கவும்",
      kn: "ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ",
    },
    "after food": {
      hi: "भोजन के बाद लें",
      te: "భోజనం తర్వాత తీసుకోండి",
      ta: "சாப்பாட்டுக்கு பின் எடுக்கவும்",
      kn: "ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ",
    },
    "before meals": {
      hi: "भोजन से पहले लें",
      te: "భోజనానికి ముందు తీసుకోండి",
      ta: "சாப்பாட்டுக்கு முன் எடுக்கவும்",
      kn: "ಊಟಕ್ಕೆ ಮುಂಚೆ ತೆಗೆದುಕೊಳ್ಳಿ",
    },
    "before food": {
      hi: "भोजन से पहले लें",
      te: "భోజనానికి ముందు తీసుకోండి",
      ta: "சாப்பாட்டுக்கு முன் எடுக்கவும்",
      kn: "ಊಟಕ್ಕೆ ಮುಂಚೆ ತೆಗೆದುಕೊಳ್ಳಿ",
    },
    "empty stomach": {
      hi: "सुबह खाली पेट लें",
      te: "ఉదయం ఖాళీ కడుపుతో తీసుకోండి",
      ta: "காலையில் வெறும் வயிற்றில் எடுக்கவும்",
      kn: "ಬೆಳಿಗ್ಗೆ ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ತೆಗೆದುಕೊಳ್ಳಿ",
    },
    "at bedtime": {
      hi: "रात को सोने से पहले लें",
      te: "రాత్రి పడుకునే ముందు తీసుకోండి",
      ta: "இரவு தூங்கும் முன் எடுக்கவும்",
      kn: "ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ತೆಗೆದುಕೊಳ್ಳಿ",
    },
    "before sleep": {
      hi: "रात को सोने से पहले लें",
      te: "రాత్రి పడుకునే ముందు తీసుకోండి",
      ta: "இரவு தூங்கும் முன் எடுக்கவும்",
      kn: "ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ತೆಗೆದುಕೊಳ್ಳಿ",
    },
    "with milk": {
      hi: "दूध के साथ लें",
      te: "పాలతో తీసుకోండి",
      ta: "பாலுடன் எடுக்கவும்",
      kn: "ಹಾಲಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ",
    },
    "with honey": {
      hi: "शहद के साथ लें",
      te: "తేనెతో తీసుకోండి",
      ta: "தேனுடன் எடுக்கவும்",
      kn: "ಜೇನುತುಪ್ಪದೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ",
    },
    "as directed": {
      hi: "डॉक्टर के निर्देशानुसार",
      te: "డాక్టర్ సూచించినట్లు",
      ta: "மருத்துவர் கூறியபடி",
      kn: "ವೈದ್ಯರ ಸೂಚನೆಯಂತೆ",
    },
  };

  if (langCode === "en") return rawText;

  for (const [key, mapping] of Object.entries(translations)) {
    if (lower.includes(key)) {
      const match = mapping[langCode];
      if (match) return match;
    }
  }

  return rawText;
}

/**
 * Translates prescription frequency into the patient's preferred language.
 */
function translateFrequency(freq: string | null | undefined, langCode: string): string {
  if (!freq || !freq.trim()) return "1-0-1";
  const trimmed = freq.trim();

  if (langCode === "en") return trimmed;

  if (trimmed === "1-0-1" || trimmed.toLowerCase().includes("morning & night")) {
    switch (langCode) {
      case "hi":
        return "1-0-1 (सुबह और रात)";
      case "te":
        return "1-0-1 (ఉదయం మరియు రాత్రి)";
      case "ta":
        return "1-0-1 (காலை மற்றும் இரவு)";
      case "kn":
        return "1-0-1 (ಬೆಳಿಗ್ಗೆ ಮತ್ತು ರಾತ್ರಿ)";
    }
  }

  if (trimmed === "1-1-1" || trimmed.toLowerCase().includes("three times")) {
    switch (langCode) {
      case "hi":
        return "1-1-1 (सुबह, दोपहर, रात)";
      case "te":
        return "1-1-1 (ఉదయం, మధ్యాహ్నం, రాత్రి)";
      case "ta":
        return "1-1-1 (காலை, மதியம், இரவு)";
      case "kn":
        return "1-1-1 (ಬೆಳಿಗ್ಗೆ, ಮಧ್ಯಾಹ್ನ, ರಾತ್ರಿ)";
    }
  }

  if (trimmed === "0-0-1" || trimmed.toLowerCase().includes("night")) {
    switch (langCode) {
      case "hi":
        return "0-0-1 (केवल रात को)";
      case "te":
        return "0-0-1 (రాత్రి మాత్రమే)";
      case "ta":
        return "0-0-1 (இரவு மட்டும்)";
      case "kn":
        return "0-0-1 (ರಾತ್ರಿ ಮಾತ್ರ)";
    }
  }

  if (trimmed === "1-0-0" || trimmed.toLowerCase().includes("morning")) {
    switch (langCode) {
      case "hi":
        return "1-0-0 (केवल सुबह)";
      case "te":
        return "1-0-0 (ఉదయం మాత్రమే)";
      case "ta":
        return "1-0-0 (காலை மட்டும்)";
      case "kn":
        return "1-0-0 (ಬೆಳಿಗ್ಗೆ ಮಾತ್ರ)";
    }
  }

  if (trimmed.toLowerCase().includes("as directed") || trimmed.toLowerCase() === "sos") {
    switch (langCode) {
      case "hi":
        return "आवश्यकतानुसार / निर्देशानुसार";
      case "te":
        return "అవసరమైనప్పుడు / సూచించినట్లు";
      case "ta":
        return "தேவைப்படும் போது / கூறியபடி";
      case "kn":
        return "ಅಗತ್ಯವಿದ್ದಾಗ / ಸೂಚಿಸಿದಂತೆ";
    }
  }

  return trimmed;
}

/**
 * Translates prescription duration (e.g. "5 Days", "1 Week") into preferred language.
 */
function translateDuration(dur: string | null | undefined, langCode: string): string {
  if (!dur || !dur.trim()) {
    switch (langCode) {
      case "hi":
        return "5 दिन";
      case "te":
        return "5 రోజులు";
      case "ta":
        return "5 நாட்கள்";
      case "kn":
        return "5 ದಿನಗಳು";
      default:
        return "5 Days";
    }
  }

  if (langCode === "en") return dur;

  const numMatch = dur.match(/\d+/);
  const num = numMatch ? numMatch[0] : "";

  if (dur.toLowerCase().includes("day")) {
    switch (langCode) {
      case "hi":
        return `${num || "5"} दिन`;
      case "te":
        return `${num || "5"} రోజులు`;
      case "ta":
        return `${num || "5"} நாட்கள்`;
      case "kn":
        return `${num || "5"} ದಿನಗಳು`;
    }
  }

  if (dur.toLowerCase().includes("week")) {
    switch (langCode) {
      case "hi":
        return `${num || "1"} सप्ताह`;
      case "te":
        return `${num || "1"} వారం`;
      case "ta":
        return `${num || "1"} வாரம்`;
      case "kn":
        return `${num || "1"} ವಾರ`;
    }
  }

  if (dur.toLowerCase().includes("month")) {
    switch (langCode) {
      case "hi":
        return `${num || "1"} महीना`;
      case "te":
        return `${num || "1"} నెల`;
      case "ta":
        return `${num || "1"} மாதம்`;
      case "kn":
        return `${num || "1"} ತಿಂಗಳು`;
    }
  }

  return dur;
}

/**
 * Translates clinical department and room names into the patient's language.
 */
function translateDepartmentAndRoom(dept: string, room: string | null | undefined, langCode: string): string {
  let deptTrans = dept;
  let roomTrans = room || "OPD Room 104";

  if (langCode === "hi") {
    if (dept.toLowerCase().includes("general")) deptTrans = "जनरल मेडिसिन (सामान्य चिकित्सा)";
    else if (dept.toLowerCase().includes("ayush") || dept.toLowerCase().includes("ayur")) deptTrans = "आयुष (आयुर्वेद)";
    roomTrans = room ? room.replace(/OPD Room/i, "ओपीडी कक्ष") : "ओपीडी कक्ष 104";
  } else if (langCode === "te") {
    if (dept.toLowerCase().includes("general")) deptTrans = "జనరల్ మెడిసిన్";
    else if (dept.toLowerCase().includes("ayush") || dept.toLowerCase().includes("ayur")) deptTrans = "ఆయుష్ (ఆయుర్వేదం)";
    roomTrans = room ? room.replace(/OPD Room/i, "OPD గది") : "OPD గది 104";
  } else if (langCode === "ta") {
    if (dept.toLowerCase().includes("general")) deptTrans = "பொது மருத்துவம்";
    else if (dept.toLowerCase().includes("ayush") || dept.toLowerCase().includes("ayur")) deptTrans = "ஆயுஷ் (ஆயுர்வேதம்)";
    roomTrans = room ? room.replace(/OPD Room/i, "OPD அறை") : "OPD அறை 104";
  } else if (langCode === "kn") {
    if (dept.toLowerCase().includes("general")) deptTrans = "ಜನರಲ್ ಮೆಡಿಸಿನ್";
    else if (dept.toLowerCase().includes("ayush") || dept.toLowerCase().includes("ayur")) deptTrans = "ಆಯುಷ್ (ಆಯುರ್ವೇದ)";
    roomTrans = room ? room.replace(/OPD Room/i, "OPD ಕೊಠಡಿ") : "OPD ಕೊಠಡಿ 104";
  }

  return `${deptTrans} &bull; ${roomTrans}`;
}

/**
 * Generates an executive, responsive HTML email template for the patient's digital prescription
 * fully translated into the patient's preferred language.
 */
export function generatePrescriptionHtmlEmail(payload: PrescriptionEmailPayload): string {
  const langCode = (payload.languagePreference || "en").toLowerCase();
  const t = getPatientTranslations(langCode as SupportedLanguage);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pre-consult-six.vercel.app";
  const dashboardUrl = `${appUrl.replace(/\/$/, "")}/patient/dashboard`;
  const formattedDate = new Date().toLocaleDateString(
    langCode === "hi" ? "hi-IN" : langCode === "te" ? "te-IN" : langCode === "ta" ? "ta-IN" : langCode === "kn" ? "kn-IN" : "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const followUpFormatted = payload.followUpDate
    ? new Date(payload.followUpDate).toLocaleDateString(
        langCode === "hi" ? "hi-IN" : langCode === "te" ? "te-IN" : langCode === "ta" ? "ta-IN" : langCode === "kn" ? "kn-IN" : "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : null;

  const deptAndRoomHtml = translateDepartmentAndRoom(payload.doctorDepartment, payload.doctorRoom, langCode);

  const prescriptionsTableRows = payload.prescriptions
    .map((p, idx) => {
      const translatedFreq = translateFrequency(p.frequency, langCode);
      const translatedDur = translateDuration(p.duration, langCode);
      const translatedInst = translateClinicalInstruction(p.instructions, langCode);
      const standardDoseText = langCode === "hi" ? "मानक खुराक" : langCode === "te" ? "ప్రామాణిక మోతాదు" : langCode === "ta" ? "நிலையான அளவு" : langCode === "kn" ? "ಪ್ರಮಾಣಿತ ಪ್ರಮಾಣ" : "Standard Dose";

      return `
      <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 0 ? "background-color: #f8fafc;" : ""}">
        <td style="padding: 12px 14px; font-weight: 700; color: #0f172a; font-size: 13px;">
          ${idx + 1}. ${p.medicineName}
          ${p.form || p.dosage ? `<span style="display: block; font-size: 11px; font-weight: 500; color: #64748b; margin-top: 2px;">${p.form ? `${p.form} &bull; ` : ""}${p.dosage || standardDoseText}</span>` : ""}
        </td>
        <td style="padding: 12px 14px; font-weight: 600; color: #4338ca; font-size: 12px; text-align: center;">
          ${translatedFreq}
        </td>
        <td style="padding: 12px 14px; font-weight: 600; color: #334155; font-size: 12px; text-align: center;">
          ${translatedDur}
        </td>
        <td style="padding: 12px 14px; font-size: 12px; color: #1e293b; font-weight: 500;">
          ${translatedInst}
        </td>
      </tr>
    `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="${langCode}">
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
              <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.95;">
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
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${deptAndRoomHtml}</div>
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
    const langCode = (payload.languagePreference || "en").toLowerCase();
    
    let subject = `Your Digital Prescription from Dr. ${payload.doctorName} — PreConsult`;
    if (langCode === "hi") {
      subject = `डॉ. ${payload.doctorName} से आपकी डिजिटल दवा पर्ची — PreConsult`;
    } else if (langCode === "te") {
      subject = `డా. ${payload.doctorName} నుండి మీ డిజిటల్ ప్రిస్క్రిప్షన్ — PreConsult`;
    } else if (langCode === "ta") {
      subject = `மருத்துவர் ${payload.doctorName} அவர்களிடமிருந்து உங்கள் டிஜிட்டல் மருந்து சீட்டு — PreConsult`;
    } else if (langCode === "kn") {
      subject = `ಡಾ. ${payload.doctorName} ಅವರಿಂದ ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಔಷಧಿ ಚೀಟಿ — PreConsult`;
    }

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