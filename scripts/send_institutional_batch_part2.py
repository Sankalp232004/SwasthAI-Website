import os
import json
import time
import urllib.request
import urllib.error
from datetime import datetime

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_file = os.path.join(base_dir, '.env.local')
log_file = os.path.join(base_dir, 'cold-email-send-log.json')
opt_out_file = os.path.join(base_dir, 'opt-out-list.json')

brevo_api_key = None
brevo_sender = "swasthai.founder@gmail.com"

if os.path.exists(env_file):
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('BREVO_API_KEY='):
                brevo_api_key = line.split('=', 1)[1].strip()
            elif line.startswith('BREVO_SENDER_EMAIL='):
                brevo_sender = line.split('=', 1)[1].strip()

ADDITIONAL_24_LEADS = [
    {"rank": 301, "doctorName": "Dr. Nitish Saxena", "clinicName": "Aster CMI Hospital OPD", "specialty": "Multi Specialty OPD", "city": "Bengaluru", "email": "info.astercmi@asterhospital.com"},
    {"rank": 302, "doctorName": "Dr. S. K. Narang", "clinicName": "Sterling Hospitals OPD", "specialty": "Cardiology & Surgery", "city": "Ahmedabad", "email": "info@sterlinghospitals.com"},
    {"rank": 303, "doctorName": "Dr. P. S. Venkatesh", "clinicName": "Kovai Medical Center & Hospital", "specialty": "Orthopedics & OPD", "city": "Coimbatore", "email": "getwell@kmchhospitals.com"},
    {"rank": 304, "doctorName": "Dr. Anoop Misra", "clinicName": "Fortis C-DOC Centre of Excellence", "specialty": "Diabetes & Metabolic Care", "city": "Delhi NCR", "email": "contactus@fortiscdoc.com"},
    {"rank": 305, "doctorName": "Dr. B. K. Rao", "clinicName": "Sir Ganga Ram Critical Care OPD", "specialty": "Internal Medicine", "city": "Delhi NCR", "email": "criticalcare@sgrh.com"},
    {"rank": 306, "doctorName": "Dr. Vinod Raina", "clinicName": "Fortis Memorial Oncology OPD", "specialty": "Specialty Care", "city": "Gurgaon", "email": "cancercare.fmri@fortishealthcare.com"},
    {"rank": 307, "doctorName": "Dr. T. S. Kler", "clinicName": "Fortis Escorts Electrophysiology", "specialty": "Cardiology", "city": "Delhi NCR", "email": "cardiology.fehi@fortishealthcare.com"},
    {"rank": 308, "doctorName": "Dr. Rajiv Parakh", "clinicName": "Medanta Peripheral Vascular OPD", "specialty": "Vascular Surgery", "city": "Gurgaon", "email": "vascular@medanta.org"},
    {"rank": 309, "doctorName": "Dr. Pradeep Sharma", "clinicName": "Centre for Sight Strabismus OPD", "specialty": "Ophthalmology", "city": "Delhi NCR", "email": "squint@centreforsight.net"},
    {"rank": 310, "doctorName": "Dr. Sanjay Tyagi", "clinicName": "Govind Ballabh Pant Hospital Heart", "specialty": "Cardiology", "city": "Delhi NCR", "email": "director@gbpant.delhigovt.nic.in"},
    {"rank": 311, "doctorName": "Dr. Subash Kumar", "clinicName": "Apollo Hospitals Greams Road OPD", "specialty": "General Surgery", "city": "Chennai", "email": "surgery.chennai@apollohospitals.com"},
    {"rank": 312, "doctorName": "Dr. Rajesh Ahlawat", "clinicName": "Medanta Kidney & Urology Institute", "specialty": "Urology & Kidney", "city": "Gurgaon", "email": "urology@medanta.org"},
    {"rank": 313, "doctorName": "Dr. Anant Kumar", "clinicName": "Max Healthcare Urology OPD", "specialty": "Urology", "city": "Delhi NCR", "email": "urology@maxhealthcare.com"},
    {"rank": 314, "doctorName": "Dr. N. P. Gupta", "clinicName": "Medanta Robotic Surgery OPD", "specialty": "Robotic Surgery", "city": "Gurgaon", "email": "roboticsurgery@medanta.org"},
    {"rank": 315, "doctorName": "Dr. A. S. Bawa", "clinicName": "Artemis Comprehensive Urology Centre", "specialty": "Urology", "city": "Gurgaon", "email": "urology@artemishospitals.com"},
    {"rank": 316, "doctorName": "Dr. S. K. Sarin", "clinicName": "Institute of Liver & Biliary Sciences", "specialty": "Hepatology & Liver", "city": "Delhi NCR", "email": "ilbs.delhi@gmail.com"},
    {"rank": 317, "doctorName": "Dr. R. K. Dhiman", "clinicName": "Sanjay Gandhi Post Graduate Institute OPD", "specialty": "Gastroenterology", "city": "Lucknow", "email": "director@sgpgi.ac.in"},
    {"rank": 318, "doctorName": "Dr. S. P. Ambesh", "clinicName": "Medanta Lucknow OPD Services", "specialty": "Multi Specialty OPD", "city": "Lucknow", "email": "lucknow@medanta.org"},
    {"rank": 319, "doctorName": "Dr. Rakesh Kapoor", "clinicName": "Medanta Lucknow Urology Centre", "specialty": "Urology & Renal", "city": "Lucknow", "email": "urology.lucknow@medanta.org"},
    {"rank": 320, "doctorName": "Dr. Gaurav Agarwal", "clinicName": "Apollomedics Super Speciality Hospital", "specialty": "Multi Specialty OPD", "city": "Lucknow", "email": "info_lko@apollohospitals.com"},
    {"rank": 321, "doctorName": "Dr. Sushil Tahiliani", "clinicName": "Tahiliani Clinic & Skin Centre", "specialty": "Dermatology", "city": "Mumbai", "email": "info@tahilianiclinic.com"},
    {"rank": 322, "doctorName": "Dr. Anil Tibrewala", "clinicName": "Hinduja Healthcare Plastic Surgery", "specialty": "Surgery & Aesthetics", "city": "Mumbai", "email": "plasticsurgery@hindujahealthcare.com"},
    {"rank": 323, "doctorName": "Dr. Shailesh Puntambekar", "clinicName": "Galaxy CARE Hospital & Surgical Centre", "specialty": "Laparoscopy & Surgery", "city": "Pune", "email": "info@galaxycare.org"},
    {"rank": 324, "doctorName": "Dr. K. G. Alexander", "clinicName": "Baby Memorial Hospital OPD", "specialty": "Multi Specialty OPD", "city": "Calicut", "email": "info@babymhospital.org"}
]

send_logs = []
already_sent_emails = set()
if os.path.exists(log_file):
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            send_logs = json.load(f)
            for entry in send_logs:
                if entry.get('status') == 'SENT' and entry.get('recipientEmail'):
                    already_sent_emails.add(entry['recipientEmail'].lower().strip())
    except:
        pass

sent_count = 0

for clinic in ADDITIONAL_24_LEADS:
    email_clean = clinic['email'].lower().strip()
    doc_name = clinic['doctorName']
    if not doc_name.startswith("Dr.") and not doc_name.startswith("Dr "):
        doc_name = f"Dr. {doc_name}"
    
    if email_clean in already_sent_emails:
        continue
    
    subject = "Registration is getting easier. What happens next?"
    campaign_tag = "scan_register_25cr_milestone"
    website_url = f"https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign={campaign_tag}"

    plain_text = f"""{doc_name},

India just crossed 25 crore digital OPD registrations through QR based Scan and Register.

It made me think about a smaller problem inside the clinic.

A patient can now register digitally, but once several patients are waiting, the clinic still has to decide who should be seen first.

That is what I am working on with SwasthAI.

Patients scan a QR code and answer a few short questions about why they came in. The clinic then gets a recommended priority order before consultation, while the doctor stays completely in control.

I am looking for a few clinics to test this with real OPD workflows.

Would you like me to send you a 2 minute video?

Sankalp Mishra
Founder, SwasthAI

{website_url}

If you would rather not receive messages from me, just reply "no" and I will not follow up."""

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222222; background-color: #ffffff; margin: 0; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
    <p style="margin: 0 0 16px 0;">{doc_name},</p>
    
    <p style="margin: 0 0 16px 0;">India just crossed 25 crore digital OPD registrations through QR based Scan and Register.</p>
    
    <p style="margin: 0 0 16px 0;">It made me think about a smaller problem inside the clinic.</p>
    
    <p style="margin: 0 0 16px 0;">A patient can now register digitally, but once several patients are waiting, the clinic still has to decide who should be seen first.</p>
    
    <p style="margin: 0 0 16px 0;">That is what I am working on with SwasthAI.</p>
    
    <p style="margin: 0 0 16px 0;">Patients scan a QR code and answer a few short questions about why they came in. The clinic then gets a recommended priority order before consultation, while the doctor stays completely in control.</p>
    
    <p style="margin: 0 0 16px 0;">I am looking for a few clinics to test this with real OPD workflows.</p>
    
    <p style="margin: 0 0 20px 0;">Would you like me to send you a 2 minute video?</p>
    
    <p style="margin: 0 0 4px 0;">Sankalp Mishra<br>Founder, SwasthAI</p>
    <p style="margin: 0 0 24px 0;"><a href="{website_url}" style="color: #008080; text-decoration: underline;">https://swasthai-three.vercel.app/</a></p>
    
    <p style="margin: 32px 0 0 0; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; padding-top: 12px;">If you would rather not receive messages from me, just reply &quot;no&quot; and I will not follow up.</p>
  </div>
</body>
</html>"""

    payload = {
        "sender": {
            "name": "Sankalp Mishra",
            "email": brevo_sender
        },
        "to": [
            {
                "email": email_clean,
                "name": clinic['doctorName']
            }
        ],
        "replyTo": {
            "name": "Sankalp Mishra",
            "email": "swasthai.founder@gmail.com"
        },
        "subject": subject,
        "textContent": plain_text,
        "htmlContent": html_content,
        "tags": ["scan_register_25cr_milestone", f"rank_{clinic['rank']}"]
    }

    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": brevo_api_key
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            msg_id = res_data.get('messageId', 'SUCCESS')
            sent_count += 1
            already_sent_emails.add(email_clean)
            
            send_logs.append({
                "prospectName": clinic['doctorName'],
                "doctorName": clinic['doctorName'],
                "clinicName": clinic['clinicName'],
                "recipientEmail": email_clean,
                "sentAt": datetime.now().isoformat() + "Z",
                "subject": subject,
                "status": "SENT",
                "brevoMessageId": msg_id,
                "error": None,
                "campaign": "scan_register_25cr_milestone",
                "rank": clinic['rank']
            })
            print(f"[{clinic['rank']}] [SENT] {clinic['doctorName']} | {clinic['clinicName']} | {email_clean} | ID: {msg_id}")
    except urllib.error.HTTPError as e:
        print(f"[{clinic['rank']}] [FAILED] {e.code}")
    except Exception as ex:
        print(f"[{clinic['rank']}] [ERROR] {str(ex)}")

    with open(log_file, 'w', encoding='utf-8') as lf:
        json.dump(send_logs, lf, indent=2)

    time.sleep(1.0)

print(f"Completed 24 Additional Institutional Sends! Total Sent: {sent_count}")
