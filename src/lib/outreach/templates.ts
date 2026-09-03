/**
 * SwasthAI Master Research-Driven Cold Acquisition Template Engine
 * =================================================================
 * Structured around 5 Campaign Experiment Families:
 * - Campaign A: Registration Solved, Queue Remains (ABDM 25 Crore milestone)
 * - Campaign B: AI Capacity & Intake Bottleneck (Philips 2026 Future Health Index)
 * - Campaign C: Small Clinic Digitization (eSushrut@Clinic launch)
 * - Campaign D: Specialty-Specific Queue Asymmetry (Pediatrics, Ortho, ENT, Derma, Eye)
 * - Campaign E: The Human Receptionist Dilemma (Triage guesswork at front desk)
 * 
 * Strict Formatting Rules:
 * - ZERO DASHES in body text (no em-dash, no en-dash, no hyphen).
 * - Founder tone (Sankalp Mishra).
 * - Single low-pressure CTA: "Would you be open to seeing the 2 minute version?"
 * - Clickable URL: https://swasthai-three.vercel.app/ with UTM parameters.
 * - Exact plain-text and clean personal HTML.
 */

export type CampaignFamily = 
  | 'CAMPAIGN_A_REGISTRATION_SOLVED'
  | 'CAMPAIGN_B_AI_CAPACITY'
  | 'CAMPAIGN_C_SMALL_CLINIC_DIGITIZATION'
  | 'CAMPAIGN_D_SPECIALTY_ASYMMETRY'
  | 'CAMPAIGN_E_RECEPTIONIST_DILEMMA';

export interface TemplateParams {
  doctorName: string;
  clinicName: string;
  specialty: string;
  city: string;
  campaignFamily: CampaignFamily;
  verifiedObservation?: string;
}

export function generateSubjectVariants(campaignFamily: CampaignFamily, doctorName: string, clinicName: string, specialty: string): {
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
} {
  const specLower = specialty.toLowerCase();

  switch (campaignFamily) {
    case 'CAMPAIGN_A_REGISTRATION_SOLVED':
      return {
        A: `The queue starts after registration`,
        B: `25 crore registrations. What happens next?`,
        C: `The part of the OPD queue nobody talks about`,
        D: `Registration is getting faster`,
        E: `Who goes first?`
      };

    case 'CAMPAIGN_B_AI_CAPACITY':
      return {
        A: `When doctors see more patients`,
        B: `The next bottleneck after AI`,
        C: `Patient flow before the consultation`,
        D: `A question about clinic capacity`,
        E: `Who should be seen first?`
      };

    case 'CAMPAIGN_C_SMALL_CLINIC_DIGITIZATION':
      return {
        A: `The part of the clinic that stays manual`,
        B: `After registration is digitized`,
        C: `A question about your OPD queue`,
        D: `What software misses in the waiting room`,
        E: `Who goes next?`
      };

    case 'CAMPAIGN_D_SPECIALTY_ASYMMETRY':
      if (specLower.includes("pediatric") || specLower.includes("child")) {
        return {
          A: `A question about pediatric walk ins at ${clinicName}`,
          B: `The queue in pediatric OPD`,
          C: `When different cases wait together`,
          D: `Who goes first in your OPD?`,
          E: `One question about your reception flow`
        };
      }
      if (specLower.includes("ortho") || specLower.includes("bone") || specLower.includes("joint")) {
        return {
          A: `A question about orthopedic walk ins at ${clinicName}`,
          B: `The queue in orthopedic OPD`,
          C: `When acute and routine cases wait together`,
          D: `Who goes first in your OPD?`,
          E: `One question about your reception flow`
        };
      }
      if (specLower.includes("derma") || specLower.includes("skin")) {
        return {
          A: `A question about skin OPD walk ins at ${clinicName}`,
          B: `The queue in dermatology OPD`,
          C: `When different cases wait together`,
          D: `Who goes first in your OPD?`,
          E: `One question about your reception flow`
        };
      }
      return {
        A: `A question about walk ins at ${clinicName}`,
        B: `The queue in ${specialty} OPD`,
        C: `When different cases wait together`,
        D: `Who goes first in your OPD?`,
        E: `One question about your reception flow`
      };

    case 'CAMPAIGN_E_RECEPTIONIST_DILEMMA':
    default:
      return {
        A: `The decision receptionists make all day`,
        B: `Who should go next?`,
        C: `A question about your front desk queue`,
        D: `When arrival order does not match urgency`,
        E: `Your OPD waiting room`
      };
  }
}

export function generateCampaignEmail(params: TemplateParams): {
  subject: string;
  plainText: string;
  html: string;
  campaignFamily: CampaignFamily;
  campaignTag: string;
} {
  let cleanDocName = params.doctorName.trim();
  if (!cleanDocName.toLowerCase().startsWith("dr.") && !cleanDocName.toLowerCase().startsWith("dr ")) {
    cleanDocName = `Dr. ${cleanDocName}`;
  }

  const subjects = generateSubjectVariants(params.campaignFamily, cleanDocName, params.clinicName, params.specialty);
  const subject = subjects.A;

  let bodyCore = "";
  let campaignTag = "campaign_a_registration_solved";

  switch (params.campaignFamily) {
    case 'CAMPAIGN_A_REGISTRATION_SOLVED':
      campaignTag = "campaign_a_registration_solved";
      bodyCore = `India has now crossed 25 crore digital OPD registrations through ABDM's Scan and Register service.

It made me think about a different part of the patient journey.

Once five patients are already waiting, what happens when another patient arrives who may need attention sooner?

Registration can tell the clinic that the patient has arrived. It does not necessarily tell the clinic who should be seen next.

That is the small problem I am building SwasthAI around.

A patient answers a few structured questions after scanning a QR code. SwasthAI creates a recommended priority order for the doctor to review, and the doctor can change it whenever needed.

I am looking for a few clinics to test this with a real OPD workflow.`;
      break;

    case 'CAMPAIGN_B_AI_CAPACITY':
      campaignTag = "campaign_b_ai_capacity";
      bodyCore = `A recent healthcare survey by Philips found that 71 percent of Indian healthcare professionals felt AI increased their capacity to handle patients.

It made me think about where the next bottleneck appears.

If a clinic can handle more patients, deciding which patient in the waiting room needs attention first becomes even more important.

Right now, arrival order usually determines who goes in first, regardless of why they came in.

That is the small problem I am building SwasthAI around.

A patient answers a few short questions after scanning a QR code at reception. SwasthAI provides a recommended priority order for the doctor to review, while the doctor stays completely in control.

I am looking for a few clinics to test this with a real OPD workflow.`;
      break;

    case 'CAMPAIGN_C_SMALL_CLINIC_DIGITIZATION':
      campaignTag = "campaign_c_small_clinic_digitization";
      bodyCore = `With initiatives like eSushrut at Clinic, software is finally being built specifically for smaller outpatient practices.

It solves billing, registration and records. But there is still one daily decision that often lives entirely in someone's head.

Once several patients are sitting in the waiting room, how does the clinic decide who should be seen next?

Digitizing a queue tells you who arrived, but it does not tell you who needs attention first.

That is the small problem I am building SwasthAI around.

Patients answer a few short questions on their phone after scanning a QR code. SwasthAI creates a recommended priority queue for the doctor to review, and the doctor can adjust it at any time.

I am looking for a few clinics to test this with a real OPD workflow.`;
      break;

    case 'CAMPAIGN_D_SPECIALTY_ASYMMETRY':
      campaignTag = "campaign_d_specialty_asymmetry";
      const specLower = params.specialty.toLowerCase();
      let specialtySpecificParagraph = "When acute cases and routine consultations wait in the same arrival queue, deciding who should be seen first is usually left to visual impression.";
      
      if (specLower.includes("pediatric") || specLower.includes("child")) {
        specialtySpecificParagraph = "A child with sudden high fever and a child arriving for a routine vaccination can arrive within minutes of each other. A standard token queue treats them as identical until someone visibly complains.";
      } else if (specLower.includes("ortho") || specLower.includes("bone") || specLower.includes("joint")) {
        specialtySpecificParagraph = "An acute fresh sprain, a post procedure dressing check and a routine follow up all sit in the same arrival queue. A standard token queue cannot tell them apart.";
      } else if (specLower.includes("derma") || specLower.includes("skin")) {
        specialtySpecificParagraph = "An acute spreading rash flare up and a routine follow up appear identical on an arrival token list until the consultation begins.";
      } else if (specLower.includes("ent") || specLower.includes("ear")) {
        specialtySpecificParagraph = "An acute severe ear pain walk in and a routine consultation sit in the same queue without any clinical distinction at the desk.";
      }

      bodyCore = `In outpatient clinics, different patient cases often enter the exact same waiting queue.

${specialtySpecificParagraph}

That is the small problem I am building SwasthAI around.

Patients answer a few structured questions about their symptoms after scanning a QR code. SwasthAI recommends a clinical priority order for the doctor to review, while the doctor stays completely in control.

I am looking for a few clinics to test this with a real OPD workflow.`;
      break;

    case 'CAMPAIGN_E_RECEPTIONIST_DILEMMA':
    default:
      campaignTag = "campaign_e_receptionist_dilemma";
      bodyCore = `There is an uncomfortable decision receptionists make all day.

Who should go next?

Usually they have a token number, an appointment list and whatever brief information the patient shares at the desk. But sometimes the patient who arrived fifth should not actually be fifth.

I am building SwasthAI around that small problem.

Patients answer a few structured questions after scanning a QR code at reception. The system creates a recommended priority order for the doctor to review, while the doctor stays completely in control.

I am looking for a few clinics to test this with a real OPD workflow.`;
      break;
  }

  const websiteUrl = `https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign=${encodeURIComponent(campaignTag)}`;

  // Plain Text Version (Zero dashes)
  const plainText = `${cleanDocName},

${bodyCore}

Would you be open to seeing the 2 minute version?

Sankalp Mishra
Founder, SwasthAI

${websiteUrl}

If you would rather not receive emails from me, just reply "no" and I will not follow up.`;

  // HTML Version (Simple, personal, white background, no big banners or buttons)
  const paragraphs = bodyCore.split('\n\n').map(p => `<p style="margin: 0 0 16px 0;">${p.replace(/\n/g, '<br>')}</p>`).join('\n    ');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222222; background-color: #ffffff; margin: 0; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
    <p style="margin: 0 0 16px 0;">${cleanDocName},</p>
    
    ${paragraphs}
    
    <p style="margin: 0 0 20px 0;">Would you be open to seeing the 2 minute version?</p>
    
    <p style="margin: 0 0 4px 0;">Sankalp Mishra<br>Founder, SwasthAI</p>
    <p style="margin: 0 0 24px 0;"><a href="${websiteUrl}" style="color: #008080; text-decoration: underline;">https://swasthai-three.vercel.app/</a></p>
    
    <p style="margin: 32px 0 0 0; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; padding-top: 12px;">If you would rather not receive emails from me, just reply &quot;no&quot; and I will not follow up.</p>
  </div>
</body>
</html>`;

  return {
    subject,
    plainText,
    html,
    campaignFamily: params.campaignFamily,
    campaignTag
  };
}

export function generateFollowUpDay4(doctorName: string): { subject: string; plainText: string; html: string } {
  let cleanDocName = doctorName.trim();
  if (!cleanDocName.toLowerCase().startsWith("dr.") && !cleanDocName.toLowerCase().startsWith("dr ")) {
    cleanDocName = `Dr. ${cleanDocName}`;
  }

  const subject = `A quick question about OPD queue intake`;
  const websiteUrl = `https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign=followup_day_4`;

  const plainText = `${cleanDocName},

Following up briefly on my note about your OPD queue.

One question doctors often ask me is whether this creates more work for clinic staff.

The intake takes patients about 60 to 90 seconds on their own phone, so the front desk does not need to type anything extra. The doctor simply sees the recommended queue before the consultation.

Would you like to see the 2 minute video walkthrough?

Sankalp Mishra
Founder, SwasthAI

${websiteUrl}

If you would rather not receive emails from me, just reply "no" and I will not follow up.`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222222; background-color: #ffffff; margin: 0; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
    <p style="margin: 0 0 16px 0;">${cleanDocName},</p>
    
    <p style="margin: 0 0 16px 0;">Following up briefly on my note about your OPD queue.</p>
    
    <p style="margin: 0 0 16px 0;">One question doctors often ask me is whether this creates more work for clinic staff.</p>
    
    <p style="margin: 0 0 16px 0;">The intake takes patients about 60 to 90 seconds on their own phone, so the front desk does not need to type anything extra. The doctor simply sees the recommended queue before the consultation.</p>
    
    <p style="margin: 0 0 20px 0;">Would you like to see the 2 minute video walkthrough?</p>
    
    <p style="margin: 0 0 4px 0;">Sankalp Mishra<br>Founder, SwasthAI</p>
    <p style="margin: 0 0 24px 0;"><a href="${websiteUrl}" style="color: #008080; text-decoration: underline;">https://swasthai-three.vercel.app/</a></p>
    
    <p style="margin: 32px 0 0 0; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; padding-top: 12px;">If you would rather not receive emails from me, just reply &quot;no&quot; and I will not follow up.</p>
  </div>
</body>
</html>`;

  return { subject, plainText, html };
}

export function generateFollowUpDay9(doctorName: string): { subject: string; plainText: string; html: string } {
  let cleanDocName = doctorName.trim();
  if (!cleanDocName.toLowerCase().startsWith("dr.") && !cleanDocName.toLowerCase().startsWith("dr ")) {
    cleanDocName = `Dr. ${cleanDocName}`;
  }

  const subject = `Final note regarding OPD queue flow`;
  const websiteUrl = `https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign=followup_day_9`;

  const plainText = `${cleanDocName},

I know how busy running an OPD is, so I will not follow up again after this.

If managing walk in queue priority ever becomes a priority for your clinic, you can find our quick demo here:

${websiteUrl}

Thank you for your time.

Sankalp Mishra
Founder, SwasthAI

If you would rather not receive emails from me, just reply "no" and I will not follow up.`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222222; background-color: #ffffff; margin: 0; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
    <p style="margin: 0 0 16px 0;">${cleanDocName},</p>
    
    <p style="margin: 0 0 16px 0;">I know how busy running an OPD is, so I will not follow up again after this.</p>
    
    <p style="margin: 0 0 16px 0;">If managing walk in queue priority ever becomes a priority for your clinic, you can find our quick demo here:</p>
    
    <p style="margin: 0 0 20px 0;"><a href="${websiteUrl}" style="color: #008080; text-decoration: underline;">https://swasthai-three.vercel.app/</a></p>
    
    <p style="margin: 0 0 16px 0;">Thank you for your time.</p>
    
    <p style="margin: 0 0 4px 0;">Sankalp Mishra<br>Founder, SwasthAI</p>
    
    <p style="margin: 32px 0 0 0; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; padding-top: 12px;">If you would rather not receive emails from me, just reply &quot;no&quot; and I will not follow up.</p>
  </div>
</body>
</html>`;

  return { subject, plainText, html };
}
