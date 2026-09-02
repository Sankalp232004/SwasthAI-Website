import os
import glob
import json
import time
import socket
import urllib.request
import urllib.error
from datetime import datetime

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_file = os.path.join(base_dir, '.env.local')
log_file = os.path.join(base_dir, 'cold-email-send-log.json')
opt_out_file = os.path.join(base_dir, 'cold-email-opt-outs.json')

# 1. Read .env.local
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

# 2. Load Existing Sent List (to prevent duplicate sends)
sent_today = set()
log_entries = []
if os.path.exists(log_file):
    try:
        with open(log_file, 'r', encoding='utf-8') as lf:
            log_entries = json.load(lf)
        for entry in log_entries:
            if entry.get('status') == 'SENT':
                sent_today.add(entry.get('recipientEmail', '').lower().strip())
    except Exception as e:
        print(f"Warning reading log file: {e}")

# 3. Load Opt-Outs
opt_outs = set()
if os.path.exists(opt_out_file):
    try:
        with open(opt_out_file, 'r', encoding='utf-8') as f:
            opt_outs = set(json.load(f))
    except:
        pass

# 4. Collect All Prospects from Master & Research Batches
all_files = [
    os.path.join(base_dir, '..', 'cold_email_leads.md'),
    os.path.join(base_dir, '..', 'research', 'legacy_leads', 'cold_email_leads_batch2.md'),
    os.path.join(base_dir, '..', 'research', 'legacy_leads', 'cold_email_leads_batch3.md'),
    os.path.join(base_dir, '..', 'research', 'legacy_leads', 'cold_email_leads_batch4.md'),
    os.path.join(base_dir, '..', 'research', 'legacy_leads', 'cold_email_leads_batch5.md'),
    os.path.join(base_dir, '..', 'research', 'legacy_leads', 'cold_email_leads_batch6.md'),
]

raw_leads = []
for fpath in all_files:
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                if line.strip().startswith('| **') and 'Rank' not in line:
                    parts = [p.strip() for p in line.split('|')]
                    if len(parts) >= 10:
                        clinic = parts[2].replace('*', '').strip()
                        doctor = parts[3].replace('*', '').strip()
                        specialty = parts[4].strip()
                        city = parts[5].strip()
                        email = parts[6].replace('`', '').strip().lower()
                        if '@' in email and '.' in email:
                            raw_leads.append({
                                'doctor': doctor,
                                'clinic': clinic,
                                'specialty': specialty,
                                'city': city,
                                'email': email
                            })

# Filter for fresh unsent prospects
seen_emails = set()
fresh_prospects = []
for l in raw_leads:
    em = l['email']
    if em not in sent_today and em not in opt_outs and em not in seen_emails:
        seen_emails.add(em)
        # Avoid bounce-heavy corporate enterprise domains
        domain = em.split('@')[1]
        if domain in ['apollohospitals.com', 'fortishealthcare.com', 'maxhealthcare.com', 'manipalhospitals.com', 'medanta.org']:
            continue
        # DNS resolution check
        try:
            socket.gethostbyname(domain)
            fresh_prospects.append(l)
        except:
            continue

target_batch = fresh_prospects[:120]

print("======================================================")
print(f"🏥 SWASTHAI BATCH 2 OUTREACH DISPATCH (BREVO)")
print("======================================================")
print(f"• Fresh Unsent Verified Leads:   {len(fresh_prospects)}")
print(f"• Target Dispatch Count:         {len(target_batch)} emails")
print(f"• Sender Address:                Sankalp Mishra <{brevo_sender}>")
print(f"• Campaign Tag:                  scan_register_25cr_milestone_batch2")
print("======================================================\n")

sent_count = 0
failed_count = 0

for idx, lead in enumerate(target_batch, 1):
    doc_name = lead['doctor'].strip()
    if not doc_name.lower().startswith('dr.') and not doc_name.lower().startswith('dr '):
        clean_doc = f"Dr. {doc_name}"
    else:
        clean_doc = doc_name

    subject = "What happens after registration?"
    website_url = "https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign=scan_register_25cr_milestone_batch2"

    plain_text = f"""{clean_doc},

India is making OPD registration much faster with QR based registration.

But I keep thinking about what happens immediately after that.

If five patients are already waiting and a sixth patient walks in with something that may need attention sooner, who decides where that patient goes in the queue?

That is the small problem I am building SwasthAI around.

Patients answer a few questions after scanning a QR code. The clinic gets a recommended priority order, and the doctor can change it whenever needed.

I am looking for a few clinics to try this with their actual OPD workflow.

Can I send you the 2 minute version?

Sankalp Mishra
Founder, SwasthAI

{website_url}

If you would rather not hear from me, reply "no" and I will not follow up."""

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222222; background-color: #ffffff; margin: 0; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
    <p style="margin: 0 0 16px 0;">{clean_doc},</p>
    
    <p style="margin: 0 0 16px 0;">India is making OPD registration much faster with QR based registration.</p>
    
    <p style="margin: 0 0 16px 0;">But I keep thinking about what happens immediately after that.</p>
    
    <p style="margin: 0 0 16px 0;">If five patients are already waiting and a sixth patient walks in with something that may need attention sooner, who decides where that patient goes in the queue?</p>
    
    <p style="margin: 0 0 16px 0;">That is the small problem I am building SwasthAI around.</p>
    
    <p style="margin: 0 0 16px 0;">Patients answer a few questions after scanning a QR code. The clinic gets a recommended priority order, and the doctor can change it whenever needed.</p>
    
    <p style="margin: 0 0 16px 0;">I am looking for a few clinics to try this with their actual OPD workflow.</p>
    
    <p style="margin: 0 0 20px 0;">Can I send you the 2 minute version?</p>
    
    <p style="margin: 0 0 4px 0;">Sankalp Mishra<br>Founder, SwasthAI</p>
    <p style="margin: 0 0 24px 0;"><a href="{website_url}" style="color: #008080; text-decoration: underline;">https://swasthai-three.vercel.app/</a></p>
    
    <p style="margin: 32px 0 0 0; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; padding-top: 12px;">If you would rather not receive messages from me, just reply &quot;no&quot; and I will not follow up.</p>
  </div>
</body>
</html>"""

    # Safety Assertions
    assert "{{" not in plain_text and "}}" not in plain_text, f"Placeholder detected for {lead['email']}"
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
                "email": lead['email'],
                "name": clean_doc
            }
        ],
        "replyTo": {
            "name": "Sankalp Mishra",
            "email": "swasthai.founder@gmail.com"
        },
        "subject": subject,
        "textContent": plain_text,
        "htmlContent": html_content,
        "tags": ["scan_register_25cr_milestone_batch2", f"lead_{idx}"]
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
            sent_count += 1
            print(f"[{sent_count:3d}/{len(target_batch)}] ✅ DELIVERED -> {clean_doc} ({lead['clinic']}) <{lead['email']}> | MsgID: {message_id}")
            
            log_entries.append({
                "prospectName": clean_doc,
                "doctorName": clean_doc,
                "clinicName": lead['clinic'],
                "recipientEmail": lead['email'],
                "sentAt": datetime.now().isoformat() + "Z",
                "subject": subject,
                "status": "SENT",
                "brevoMessageId": message_id,
                "error": None,
                "campaign": "scan_register_25cr_milestone_batch2"
            })
            
            if sent_count % 10 == 0:
                with open(log_file, 'w', encoding='utf-8') as lf:
                    json.dump(log_entries, lf, indent=2)

    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        failed_count += 1
        print(f"[{idx:3d}/{len(target_batch)}] ❌ HTTP {e.code} for {lead['email']}: {err_body}")
    except Exception as e:
        failed_count += 1
        print(f"[{idx:3d}/{len(target_batch)}] ❌ Error for {lead['email']}: {str(e)}")

    # 600ms safety pacing between API calls
    time.sleep(0.6)

# Save final updated send log
with open(log_file, 'w', encoding='utf-8') as lf:
    json.dump(log_entries, lf, indent=2)

print("\n======================================================")
print("🎯 SWASTHAI BATCH 2 OUTBOUND COMPLETE")
print("======================================================")
print(f"• Batch 2 Successfully Delivered: {sent_count}")
print(f"• Batch 2 Failed:                 {failed_count}")
print(f"• Brevo Sender:                   Sankalp Mishra <{brevo_sender}>")
print(f"• Audit Log Updated:              {log_file}")
print("======================================================\n")
