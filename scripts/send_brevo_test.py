import os
import json
import urllib.request
import urllib.error
from datetime import datetime

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_file = os.path.join(base_dir, '.env.local')
log_file = os.path.join(base_dir, 'cold-email-send-log.json')

# Read .env.local
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

if not brevo_api_key:
    print("ERROR: BREVO_API_KEY not found in .env.local")
    exit(1)

# Real verified prospect data for live test
doctor_name = "Dr. Ashish Ranade"
clinic_name = "Strong Bones Clinic"
specialty = "Pediatric Orthopedics"
city = "Pune"
recipient_email = "swasthai.founder@gmail.com"

subject = "[TEST] What happens after registration?"

plain_text = f"""Dr. Ashish Ranade,

India is making OPD registration much faster with QR based registration.

But I keep thinking about what happens immediately after that.

If five patients are already waiting and a sixth patient walks in with something that may need attention sooner, who decides where that patient goes in the queue?

That is the small problem I am building SwasthAI around.

Patients answer a few questions after scanning a QR code. The clinic gets a recommended priority order, and the doctor can change it whenever needed.

I am looking for a few clinics to try this with their actual OPD workflow.

Can I send you the 2 minute version?

Sankalp Mishra
Founder, SwasthAI

https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign=scan_register_25cr_milestone

If you would rather not hear from me, reply "no" and I will not follow up."""

html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222222; background-color: #ffffff; margin: 0; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
    <p style="margin: 0 0 16px 0;">Dr. Ashish Ranade,</p>
    
    <p style="margin: 0 0 16px 0;">India is making OPD registration much faster with QR based registration.</p>
    
    <p style="margin: 0 0 16px 0;">But I keep thinking about what happens immediately after that.</p>
    
    <p style="margin: 0 0 16px 0;">If five patients are already waiting and a sixth patient walks in with something that may need attention sooner, who decides where that patient goes in the queue?</p>
    
    <p style="margin: 0 0 16px 0;">That is the small problem I am building SwasthAI around.</p>
    
    <p style="margin: 0 0 16px 0;">Patients answer a few questions after scanning a QR code. The clinic gets a recommended priority order, and the doctor can change it whenever needed.</p>
    
    <p style="margin: 0 0 16px 0;">I am looking for a few clinics to try this with their actual OPD workflow.</p>
    
    <p style="margin: 0 0 20px 0;">Can I send you the 2 minute version?</p>
    
    <p style="margin: 0 0 4px 0;">Sankalp Mishra<br>Founder, SwasthAI</p>
    <p style="margin: 0 0 24px 0;"><a href="https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign=scan_register_25cr_milestone" style="color: #008080; text-decoration: underline;">https://swasthai-three.vercel.app/</a></p>
    
    <p style="margin: 32px 0 0 0; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; padding-top: 12px;">If you would rather not hear from me, reply &quot;no&quot; and I will not follow up.</p>
  </div>
</body>
</html>"""

# Safety checks: Placeholders and Dashes
assert "{{" not in plain_text and "}}" not in plain_text, "Placeholders found!"
clean_lines = [l for l in plain_text.split("\n") if "http" not in l]
for line in clean_lines:
    assert "—" not in line and "–" not in line and "-" not in line, f"Dash found in line: {line}"

payload = {
    "sender": {
        "name": "Sankalp Mishra",
        "email": brevo_sender
    },
    "to": [
        {
            "email": recipient_email,
            "name": "Sankalp Mishra"
        }
    ],
    "replyTo": {
        "name": "Sankalp Mishra",
        "email": "swasthai.founder@gmail.com"
    },
    "subject": subject,
    "textContent": plain_text,
    "htmlContent": html_content,
    "tags": ["scan_register_25cr_milestone", "test_send"]
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
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        message_id = res_data.get('messageId')
        print("==================================================")
        print("[SUCCESS] BREVO TEST EMAIL DELIVERED SUCCESSFULLY!")
        print("==================================================")
        print(f"Brevo Message ID: {message_id}")
        print(f"Sender: Sankalp Mishra <{brevo_sender}>")
        print(f"Recipient: {recipient_email}")
        print(f"Subject: {subject}")
        print(f"Website Link: https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign=scan_register_25cr_milestone")
        print(f"Opt-out Notice: Present")
        print("==================================================")
        
        # Log to file
        log_entries = []
        if os.path.exists(log_file):
            try:
                with open(log_file, 'r', encoding='utf-8') as lf:
                    log_entries = json.load(lf)
            except:
                pass
        
        log_entries.append({
            "prospectName": f"TEST - {doctor_name}",
            "doctorName": doctor_name,
            "clinicName": clinic_name,
            "recipientEmail": recipient_email,
            "sentAt": datetime.now().isoformat() + "Z",
            "subject": subject,
            "status": "TEST",
            "brevoMessageId": message_id,
            "error": None,
            "campaign": "scan_register_25cr_milestone"
        })
        
        with open(log_file, 'w', encoding='utf-8') as lf:
            json.dump(log_entries, lf, indent=2)

except urllib.error.HTTPError as e:
    err_body = e.read().decode('utf-8')
    print(f"[ERROR] Brevo API Error ({e.code}): {err_body}")
    exit(1)
except Exception as e:
    print(f"[ERROR] Network / System Error: {str(e)}")
    exit(1)
