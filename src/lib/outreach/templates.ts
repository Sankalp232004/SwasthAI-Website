/**
 * SwasthAI Master Research-Driven Cold Email Template & Specialty Engine
 * 
 * Strict Guidelines:
 * - NO DASHES anywhere in body text (use commas, periods, question marks).
 * - 100-140 words ideally (maximum 170 words).
 * - Founder-written tone (Sankalp Mishra).
 * - Single low-pressure CTA: "Would you like me to send you a 2 minute video?"
 * - Clean personal HTML and exact plain text.
 */

export interface TemplateParams {
  doctorName: string;
  clinicName: string;
  specialty: string;
  city: string;
  verifiedObservation?: string;
  campaignHook?: string;
  campaignTag?: string;
}

export function generateSubjectLines(doctorName: string, clinicName: string, specialty: string): {
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
} {
  const specLower = specialty.toLowerCase();

  if (specLower.includes("pediatric")) {
    return {
      A: `Registration is getting easier. What happens next?`,
      B: `Question about pediatric intake at ${clinicName}`,
      C: `What happens after registration?`,
      D: `Your pediatric OPD queue`,
      E: `One question about walk ins at ${clinicName}`
    };
  }

  if (specLower.includes("ortho")) {
    return {
      A: `Registration is getting easier. What happens next?`,
      B: `OPD walk in prioritization at ${clinicName}`,
      C: `What happens after registration?`,
      D: `A question about your OPD queue`,
      E: `Walk in flow at ${clinicName}`
    };
  }

  if (specLower.includes("derma") || specLower.includes("skin")) {
    return {
      A: `Registration is getting easier. What happens next?`,
      B: `Question about skin OPD intake at ${clinicName}`,
      C: `What happens after registration?`,
      D: `Your OPD queue`,
      E: `One question about walk ins at ${clinicName}`
    };
  }

  if (specLower.includes("ent")) {
    return {
      A: `Registration is getting easier. What happens next?`,
      B: `Question about ENT walk in flow at ${clinicName}`,
      C: `What happens after registration?`,
      D: `A question about your OPD queue`,
      E: `One question about walk ins`
    };
  }

  if (specLower.includes("eye") || specLower.includes("ophthal")) {
    return {
      A: `Registration is getting easier. What happens next?`,
      B: `Question about eye OPD intake at ${clinicName}`,
      C: `What happens after registration?`,
      D: `Your eye OPD queue`,
      E: `Walk in flow at ${clinicName}`
    };
  }

  if (specLower.includes("dental") || specLower.includes("dentist")) {
    return {
      A: `Registration is getting easier. What happens next?`,
      B: `A question about dental walk in intake at ${clinicName}`,
      C: `What happens after registration?`,
      D: `Your OPD queue`,
      E: `One question about walk ins`
    };
  }

  if (specLower.includes("gynae") || specLower.includes("women")) {
    return {
      A: `Registration is getting easier. What happens next?`,
      B: `Question about patient intake at ${clinicName}`,
      C: `What happens after registration?`,
      D: `A question about your OPD queue`,
      E: `One question about walk ins`
    };
  }

  return {
    A: `Registration is getting easier. What happens next?`,
    B: `A question about your OPD`,
    C: `What happens after registration?`,
    D: `Your OPD queue`,
    E: `One question about walk ins`
  };
}

export function generateEmailContent(params: TemplateParams): {
  subject: string;
  plainText: string;
  html: string;
} {
  const subjects = generateSubjectLines(params.doctorName, params.clinicName, params.specialty);
  const subject = subjects.A;

  let cleanDocName = params.doctorName.trim();
  if (!cleanDocName.toLowerCase().startsWith("dr.") && !cleanDocName.toLowerCase().startsWith("dr ")) {
    cleanDocName = `Dr. ${cleanDocName}`;
  }

  const utmCampaign = params.campaignTag || "scan_register_25cr_milestone";
  const websiteUrl = `https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign=${encodeURIComponent(utmCampaign)}`;

  // Specialty specific context injection if customized
  const specLower = params.specialty.toLowerCase();
  let specialtyLine = "A patient can now register digitally, but once several patients are waiting, the clinic still has to decide who should be seen first.";
  
  if (specLower.includes("pediatric")) {
    specialtyLine = "A parent can now register a child digitally, but once several families are waiting, the clinic still has to decide who needs to be seen first.";
  } else if (specLower.includes("ortho")) {
    specialtyLine = "A patient can now register digitally, but when acute injuries and routine follow ups arrive together, the clinic still has to decide who should be seen first.";
  } else if (specLower.includes("ent")) {
    specialtyLine = "A patient can now register digitally, but when acute ear pain and routine consultations wait in the same queue, the clinic still has to decide who gets seen first.";
  }

  // Plain Text Version (Zero Dashes Standard)
  const plainText = `${cleanDocName},

India just crossed 25 crore digital OPD registrations through QR based Scan and Register.

It made me think about a smaller problem inside the clinic.

${specialtyLine}

That is what I am working on with SwasthAI.

Patients scan a QR code and answer a few short questions about why they came in. The clinic then gets a recommended priority order before consultation, while the doctor stays completely in control.

I am looking for a few clinics to test this with real OPD workflows.

Would you like me to send you a 2 minute video?

Sankalp Mishra
Founder, SwasthAI

${websiteUrl}

If you would rather not receive messages from me, just reply "no" and I will not follow up.`;

  // HTML Version (Simple, personal, white background, no big banners or buttons)
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222222; background-color: #ffffff; margin: 0; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
    <p style="margin: 0 0 16px 0;">${cleanDocName},</p>
    
    <p style="margin: 0 0 16px 0;">India just crossed 25 crore digital OPD registrations through QR based Scan and Register.</p>
    
    <p style="margin: 0 0 16px 0;">It made me think about a smaller problem inside the clinic.</p>
    
    <p style="margin: 0 0 16px 0;">${specialtyLine}</p>
    
    <p style="margin: 0 0 16px 0;">That is what I am working on with SwasthAI.</p>
    
    <p style="margin: 0 0 16px 0;">Patients scan a QR code and answer a few short questions about why they came in. The clinic then gets a recommended priority order before consultation, while the doctor stays completely in control.</p>
    
    <p style="margin: 0 0 16px 0;">I am looking for a few clinics to test this with real OPD workflows.</p>
    
    <p style="margin: 0 0 20px 0;">Would you like me to send you a 2 minute video?</p>
    
    <p style="margin: 0 0 4px 0;">Sankalp Mishra<br>Founder, SwasthAI</p>
    <p style="margin: 0 0 24px 0;"><a href="${websiteUrl}" style="color: #008080; text-decoration: underline;">https://swasthai-three.vercel.app/</a></p>
    
    <p style="margin: 32px 0 0 0; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; padding-top: 12px;">If you would rather not receive messages from me, just reply &quot;no&quot; and I will not follow up.</p>
  </div>
</body>
</html>`;

  return {
    subject,
    plainText,
    html
  };
}
