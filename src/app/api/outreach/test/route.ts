import { NextRequest, NextResponse } from 'next/server';
import { BrevoOutreachEngine } from '@/lib/outreach/brevo';
import { generateEmailContent } from '@/lib/outreach/templates';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const engine = new BrevoOutreachEngine();

    // Default test lead: Dr. Ashish Ranade at Strong Bones Clinic
    const testDoctorName = body.doctorName || "Dr. Ashish Ranade";
    const testClinicName = body.clinicName || "Strong Bones Clinic";
    const testSpecialty = body.specialty || "Pediatric Orthopedics";
    const testCity = body.city || "Pune";
    const testRecipient = "swasthai.founder@gmail.com";

    const content = generateEmailContent({
      doctorName: testDoctorName,
      clinicName: testClinicName,
      specialty: testSpecialty,
      city: testCity,
      campaignHook: "QR based OPD registration is already becoming normal across Indian healthcare. I am trying to solve the next small problem, which is what happens after the patient registers."
    });

    const testSubject = `[TEST] ${content.subject}`;

    const result = await engine.sendEmail({
      recipientEmail: testRecipient,
      doctorName: testDoctorName,
      clinicName: testClinicName,
      subject: testSubject,
      textContent: content.plainText,
      htmlContent: content.html,
      campaignTag: 'swasthai_cold_outreach_test',
      isTest: true
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        preview: {
          sender: engine.getSenderInfo(),
          recipient: testRecipient,
          subject: testSubject,
          plainText: content.plainText,
          html: content.html
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      brevoMessageId: result.messageId,
      preview: {
        sender: engine.getSenderInfo(),
        recipient: testRecipient,
        subject: testSubject,
        plainText: content.plainText,
        html: content.html,
        personalization: {
          doctor: testDoctorName,
          clinic: testClinicName,
          specialty: testSpecialty,
          city: testCity
        },
        websiteLink: "https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign=swasthai_cold_outreach_test",
        optOutClause: 'If you would rather not receive messages from me, just reply "no" and I will not follow up.'
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
