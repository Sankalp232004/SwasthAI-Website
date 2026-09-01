import os
import json
import urllib.request
import urllib.error

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_file = os.path.join(base_dir, '.env.local')

brevo_api_key = None
if os.path.exists(env_file):
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip().startswith('BREVO_API_KEY='):
                brevo_api_key = line.strip().split('=', 1)[1].strip()

if not brevo_api_key:
    print("No BREVO_API_KEY found")
    exit(1)

def query_brevo(endpoint):
    url = f"https://api.brevo.com/v3/{endpoint}"
    req = urllib.request.Request(
        url,
        headers={
            "accept": "application/json",
            "api-key": brevo_api_key
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return {"error": e.code, "body": e.read().decode('utf-8')}
    except Exception as e:
        return {"error": str(e)}

print("=== 1. BREVO ACCOUNT INFO ===")
acc = query_brevo("account")
print(json.dumps(acc, indent=2))

print("\n=== 2. BREVO VERIFIED SENDERS ===")
senders = query_brevo("senders")
print(json.dumps(senders, indent=2))

print("\n=== 3. RECENT TRANSACTIONAL EMAILS / EVENTS ===")
events = query_brevo("smtp/statistics/events?limit=10")
print(json.dumps(events, indent=2))
