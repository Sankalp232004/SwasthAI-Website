/**
 * SwasthAI Master Cold Email Template & Specialty Personalization Engine
 * 
 * Strict Guidelines:
 * - NO DASHES anywhere in the body text (no '-', '—', '–', or hyphenated words). Use commas or periods.
 * - 100-140 words ideally (maximum 170 words).
 * - Founder-written tone (Sankalp Mishra).
 * - Single low-pressure CTA.
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

export function generateSubjectLines(doctorName: string, clinicName: string, specialty: string): { A: string; B: string; C: string } {
  const specLower = specialty.toLowerCase();
  
  if (specLower.includes("pediatric")) {
    return {
      A: `Question about pediatric intake at ${clinicName}`,
      B: `Your pediatric OPD queue`,
      C: `One question about walk ins`
    };
  }
  
  if (specLower.includes("ortho")) {
    return {
      A: `OPD walk in prioritization at ${clinicName}`,
      B: `A question about your OPD`,
      C: `Walk in flow at ${clinicName}`
    };
  }
  
  if (specLower.includes("derma") || specLower.includes("skin")) {
    return {
      A: `Question about skin OPD intake at ${clinicName}`,
      B: `Your OPD queue`,
      C: `A question about walk ins`
    };
  }
  
  if (specLower.includes("ent")) {
    return {
      A: `Question about ENT walk in flow at ${clinicName}`,
      B: `A question about your OPD`,
      C: `Your OPD queue`
    };
  }

  if (specLower.includes("eye") || specLower.includes("ophthal")) {
    return {
      A: `Question about eye OPD intake at ${clinicName}`,
      B: `A question about your OPD`,
      C: `Walk in flow at ${clinicName}`
    };
  }

  if (specLower.includes("gynae") || specLower.includes("women")) {
    return {
      A: `Question about patient intake at ${clinicName}`,
      B: `A question about your OPD`,
      C: `Your OPD queue`
    };
  }

  return {
    A: `A question about your OPD`,
    B: `Your OPD queue`,
    C: `One question about walk ins`
  };
}

export function generateEmailContent(params: TemplateParams): {
  subject: string;
  plainText: string;
  html: string;
} {
  const subjects = generateSubjectLines(params.doctorName, params.clinicName, params.specialty);
  const subject = subjects.A;

  // Clean doctor name formatting (Ensure Dr. prefix)
  let cleanDocName = params.doctorName.trim();
  if (!cleanDocName.toLowerCase().startsWith("dr.") && !cleanDocName.toLowerCase().startsWith("dr ")) {
    cleanDocName = `Dr. ${cleanDocName}`;
  }

  // Hook without any dashes
  const hook = params.campaignHook 
    ? params.campaignHook.replace(/[-—–]/g, ", ")
    : "QR based OPD registration is already becoming normal across Indian healthcare. I am trying to solve the next small problem, which is what happens after the patient registers.";

  const utmCampaign = params.campaignTag || "india_clinics_aug_2026";
  const websiteUrl = `https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign=${encodeURIComponent(utmCampaign)}`;

  // Plain Text Version (Zero dashes)
  const plainText = `${cleanDocName},

I had one question about your OPD.

When a new walk in arrives after several patients are already waiting, how does your reception team decide whether that patient should be seen before someone who arrived earlier?

I am building SwasthAI for exactly this workflow. A patient scans a QR code, answers a few short questions, and the clinic gets a recommended priority order. The doctor remains fully in control and can change the queue at any time.

${hook}

Would you like me to send you a 2 minute video showing it?

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
    
    <p style="margin: 0 0 16px 0;">I had one question about your OPD.</p>
    
    <p style="margin: 0 0 16px 0;">When a new walk in arrives after several patients are already waiting, how does your reception team decide whether that patient should be seen before someone who arrived earlier?</p>
    
    <p style="margin: 0 0 16px 0;">I am building SwasthAI for exactly this workflow. A patient scans a QR code, answers a few short questions, and the clinic gets a recommended priority order. The doctor remains fully in control and can change the queue at any time.</p>
    
    <p style="margin: 0 0 16px 0;">${hook}</p>
    
    <p style="margin: 0 0 20px 0;">Would you like me to send you a 2 minute video showing it?</p>
    
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
