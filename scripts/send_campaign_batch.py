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

# 1. Load API Key & Sender
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
    print("[FATAL ERROR] BREVO_API_KEY not found in .env.local")
    exit(1)

# 2. Load Opt-Outs & Existing Send Logs
opt_outs = set()
if os.path.exists(opt_out_file):
    try:
        with open(opt_out_file, 'r', encoding='utf-8') as f:
            opt_outs = set(json.load(f))
    except:
        pass

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

# 3. Read prospects from TypeScript dataset
# We parse the RAW_CLINICS from prospects.ts
prospects_ts = os.path.join(base_dir, 'src', 'lib', 'outreach', 'prospects.ts')
raw_clinics = []

with open(prospects_ts, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract items
import re
pattern = re.compile(
    r'rank:\s*(\d+),\s*'
    r'doctorName:\s*"(.*?)",\s*'
    r'clinicName:\s*"(.*?)",\s*'
    r'specialty:\s*"(.*?)",\s*'
    r'city:\s*"(.*?)",\s*'
    r'area:\s*"(.*?)",\s*'
    r'email:\s*"(.*?)",',
    re.DOTALL
)

matches = pattern.findall(content)
for m in matches:
    raw_clinics.append({
        "rank": int(m[0]),
        "doctorName": m[1],
        "clinicName": m[2],
        "specialty": m[3],
        "city": m[4],
        "area": m[5],
        "email": m[6].strip()
    })

print(f"Loaded {len(raw_clinics)} verified clinic leads from prospects dataset.")

def get_specialty_line(specialty):
    spec_lower = specialty.lower()
    if "pediatric" in spec_lower:
        return "A parent can now register a child digitally, but once several families are waiting, the clinic still has to decide who needs to be seen first."
    elif "ortho" in spec_lower:
        return "A patient can now register digitally, but when acute injuries and routine follow ups arrive together, the clinic still has to decide who should be seen first."
    elif "ent" in spec_lower:
        return "A patient can now register digitally, but when acute ear pain and routine consultations wait in the same queue, the clinic still has to decide who gets seen first."
    elif "derma" in spec_lower or "skin" in spec_lower:
        return "A patient can now register digitally, but when acute flare ups and routine cosmetic consultations arrive together, the clinic still has to decide who should be seen first."
    elif "dental" in spec_lower:
        return "A patient can now register digitally, but when acute toothache walk ins and routine cleanings wait together, the clinic still has to decide who should be seen first."
    return "A patient can now register digitally, but once several patients are waiting, the clinic still has to decide who should be seen first."

def get_subject_line(specialty, clinic_name):
    spec_lower = specialty.lower()
    if "pediatric" in spec_lower:
        return "Registration is getting easier. What happens next?"
    elif "ortho" in spec_lower:
        return "Registration is getting easier. What happens next?"
    return "Registration is getting easier. What happens next?"

# 4. Batch Delivery Execution
sent_count = 0
failed_count = 0
skipped_count = 0

print("\n==================================================")
print(f"STARTING SWASTHAI BATCH CAMPAIGN (TARGET: {len(raw_clinics)} CLINICS)")
print("Provider: Brevo Transactional REST API")
print(f"Sender: Sankalp Mishra <{brevo_sender}>")
print("==================================================\n")

for clinic in raw_clinics:
    email_clean = clinic['email'].lower().strip()
    doc_name = clinic['doctorName']
    if not doc_name.startswith("Dr.") and not doc_name.startswith("Dr "):
        doc_name = f"Dr. {doc_name}"
    
    # Pre-send suppression & duplicate checks
    if email_clean in opt_outs:
        print(f"[{clinic['rank']}/100] SKIPPED (Opted out): {clinic['doctorName']} ({email_clean})")
        skipped_count += 1
        continue
    
    if email_clean in already_sent_emails:
        print(f"[{clinic['rank']}/100] SKIPPED (Already sent): {clinic['doctorName']} ({email_clean})")
        skipped_count += 1
        continue
    
    specialty_line = get_specialty_line(clinic['specialty'])
    subject = get_subject_line(clinic['specialty'], clinic['clinicName'])
    campaign_tag = "scan_register_25cr_milestone"
    website_url = f"https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign={campaign_tag}"

    plain_text = f"""{doc_name},

India just crossed 25 crore digital OPD registrations through QR based Scan and Register.

It made me think about a smaller problem inside the clinic.

{specialty_line}

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
    
    <p style="margin: 0 0 16px 0;">{specialty_line}</p>
    
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

    # Zero Dash check
    clean_lines = [l for l in plain_text.split("\n") if "http" not in l]
    for line in clean_lines:
        assert "—" not in line and "–" not in line and " - " not in line, f"Dash found in line: {line}"

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
            
            log_entry = {
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
            }
            send_logs.append(log_entry)
            
            print(f"[{clinic['rank']}/100] [SENT] {clinic['doctorName']} | {clinic['clinicName']} | {email_clean} | ID: {msg_id}")
            
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        failed_count += 1
        print(f"[{clinic['rank']}/100] [FAILED] {clinic['doctorName']} ({email_clean}) -> {e.code}: {err_body}")
        send_logs.append({
            "prospectName": clinic['doctorName'],
            "doctorName": clinic['doctorName'],
            "clinicName": clinic['clinicName'],
            "recipientEmail": email_clean,
            "sentAt": datetime.now().isoformat() + "Z",
            "subject": subject,
            "status": "FAILED",
            "brevoMessageId": None,
            "error": err_body,
            "campaign": "scan_register_25cr_milestone",
            "rank": clinic['rank']
        })
    except Exception as ex:
        failed_count += 1
        print(f"[{clinic['rank']}/100] [ERROR] {clinic['doctorName']} ({email_clean}) -> {str(ex)}")

    # Update log file incrementally
    with open(log_file, 'w', encoding='utf-8') as lf:
        json.dump(send_logs, lf, indent=2)

    # Respectful rate limiting (1.0s delay between emails)
    time.sleep(1.0)

print("\n==================================================")
print("BATCH DISPATCH COMPLETE")
print(f"Successfully Sent: {sent_count}")
print(f"Failed: {failed_count}")
print(f"Skipped / Duplicate: {skipped_count}")
print(f"Log Updated: {log_file}")
print("==================================================")
