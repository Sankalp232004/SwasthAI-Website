/**
 * SwasthAI Master Research-Driven Cold Email Template & Specialty Engine
 * 
 * Strict Guidelines:
 * - NO DASHES anywhere in body text (use commas, periods, question marks).
 * - 100-140 words ideally.
 * - Founder-written tone (Sankalp Mishra).
 * - Single low-pressure CTA: "Can I send you the 2 minute version?"
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
      A: `What happens after registration?`,
      B: `Question about pediatric intake at ${clinicName}`,
      C: `The queue starts after registration`,
      D: `Who goes first?`,
      E: `One question about walk ins at ${clinicName}`
    };
  }

  if (specLower.includes("ortho")) {
    return {
      A: `What happens after registration?`,
      B: `OPD walk in prioritization at ${clinicName}`,
      C: `The queue starts after registration`,
      D: `Who goes first?`,
      E: `Walk in flow at ${clinicName}`
    };
  }

  if (specLower.includes("derma") || specLower.includes("skin")) {
    return {
      A: `What happens after registration?`,
      B: `Question about skin OPD intake at ${clinicName}`,
      C: `The queue starts after registration`,
      D: `Who goes first?`,
      E: `One question about walk ins at ${clinicName}`
    };
  }

  if (specLower.includes("ent")) {
    return {
      A: `What happens after registration?`,
      B: `Question about ENT walk in flow at ${clinicName}`,
      C: `The queue starts after registration`,
      D: `Who goes first?`,
      E: `One question about walk ins`
    };
  }

  if (specLower.includes("eye") || specLower.includes("ophthal")) {
    return {
      A: `What happens after registration?`,
      B: `Question about eye OPD intake at ${clinicName}`,
      C: `The queue starts after registration`,
      D: `Who goes first?`,
      E: `Walk in flow at ${clinicName}`
    };
  }

  if (specLower.includes("dental") || specLower.includes("dentist")) {
    return {
      A: `What happens after registration?`,
      B: `A question about dental walk in intake at ${clinicName}`,
      C: `The queue starts after registration`,
      D: `Who goes first?`,
      E: `One question about walk ins`
    };
  }

  if (specLower.includes("gynae") || specLower.includes("women")) {
    return {
      A: `What happens after registration?`,
      B: `Question about patient intake at ${clinicName}`,
      C: `The queue starts after registration`,
      D: `Who goes first?`,
      E: `One question about walk ins`
    };
  }

  return {
    A: `What happens after registration?`,
    B: `A question about your OPD`,
    C: `The queue starts after registration`,
    D: `Who goes first?`,
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

  // Plain Text Version (Zero Dashes Standard)
  const plainText = `${cleanDocName},

India is making OPD registration much faster with QR based registration.

But I keep thinking about what happens immediately after that.

If five patients are already waiting and a sixth patient walks in with something that may need attention sooner, who decides where that patient goes in the queue?

That is the small problem I am building SwasthAI around.

Patients answer a few questions after scanning a QR code. The clinic gets a recommended priority order, and the doctor can change it whenever needed.

I am looking for a few clinics to try this with their actual OPD workflow.

Can I send you the 2 minute version?

Sankalp Mishra
Founder, SwasthAI

${websiteUrl}

If you would rather not hear from me, reply "no" and I will not follow up.`;

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
    
    <p style="margin: 0 0 16px 0;">India is making OPD registration much faster with QR based registration.</p>
    
    <p style="margin: 0 0 16px 0;">But I keep thinking about what happens immediately after that.</p>
    
    <p style="margin: 0 0 16px 0;">If five patients are already waiting and a sixth patient walks in with something that may need attention sooner, who decides where that patient goes in the queue?</p>
    
    <p style="margin: 0 0 16px 0;">That is the small problem I am building SwasthAI around.</p>
    
    <p style="margin: 0 0 16px 0;">Patients answer a few questions after scanning a QR code. The clinic gets a recommended priority order, and the doctor can change it whenever needed.</p>
    
    <p style="margin: 0 0 16px 0;">I am looking for a few clinics to try this with their actual OPD workflow.</p>
    
    <p style="margin: 0 0 20px 0;">Can I send you the 2 minute version?</p>
    
    <p style="margin: 0 0 4px 0;">Sankalp Mishra<br>Founder, SwasthAI</p>
    <p style="margin: 0 0 24px 0;"><a href="${websiteUrl}" style="color: #008080; text-decoration: underline;">https://swasthai-three.vercel.app/</a></p>
    
    <p style="margin: 32px 0 0 0; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; padding-top: 12px;">If you would rather not hear from me, reply &quot;no&quot; and I will not follow up.</p>
  </div>
</body>
</html>`;

  return {
    subject,
    plainText,
    html
  };
}
