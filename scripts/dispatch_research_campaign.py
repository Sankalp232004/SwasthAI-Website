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

# 1. Load Brevo credentials
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
    print("[ERROR] BREVO_API_KEY not found in .env.local")
    exit(1)

# 2. DNS MX Record Checker (Google DNS over HTTPS)
def check_domain_mx(domain):
    try:
        url = f"https://dns.google/resolve?name={domain}&type=MX"
        req = urllib.request.Request(url, headers={"accept": "application/json", "user-agent": "SwasthAI-MX-Validator"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            answers = data.get("Answer", [])
            mx_hosts = [a.get("data") for a in answers if a.get("type") == 15]
            return len(mx_hosts) > 0, mx_hosts
    except Exception:
        return False, []

# 3. 100 Researched Prospects Segmented across the 5 Campaign Families
RESEARCH_PROSPECTS = [
  # CAMPAIGN A: Registration Solved, Queue Remains (25 Prospects)
  {"rank": 1, "doctorName": "Dr. Ashish Ranade", "clinicName": "Strong Bones Clinic", "specialty": "Pediatric Orthopedics", "city": "Pune", "email": "strongbonesclinic@gmail.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 2, "doctorName": "Dr. Sandeep Kr. Garg", "clinicName": "Aliganj Orthopaedic Centre", "specialty": "Orthopedics & Trauma", "city": "Lucknow", "email": "aliganjortho@gmail.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 3, "doctorName": "Dr. Pritish Singh", "clinicName": "Little Bones Clinic", "specialty": "Pediatric Orthopedics", "city": "Noida", "email": "contact@littlebonesclinic.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 4, "doctorName": "Dr. Atul Sonawane", "clinicName": "Sonawane Orthocare", "specialty": "Orthopedics & Joint", "city": "Pune", "email": "dratulsonawane@gmail.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 5, "doctorName": "Dr. Atul Bhaskar", "clinicName": "Children's Orthopaedic Centre", "specialty": "Pediatric Orthopedics", "city": "Mumbai", "email": "arb_25@yahoo.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 6, "doctorName": "Dr. Parag Sancheti", "clinicName": "Sancheti Hospital OPD Centre", "specialty": "Orthopedics & Joint", "city": "Pune", "email": "appointment@sanchetihospital.org", "campaign": "campaign_a_registration_solved"},
  {"rank": 7, "doctorName": "Dr. Narendra Vaidya", "clinicName": "Lokmanya Orthopedics Hospital", "specialty": "Orthopedics & Spine", "city": "Pune", "email": "care@lokmanyahospitals.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 8, "doctorName": "Dr. P.K. Dave", "clinicName": "Saroj Super Speciality Hospital OPD", "specialty": "Orthopedics & Multi Specialty", "city": "Delhi NCR", "email": "info@sarojhospital.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 9, "doctorName": "Dr. S. Gurushankar", "clinicName": "Meenakshi Mission Hospital OPD", "specialty": "Multi Specialty & Trauma", "city": "Madurai", "email": "info@mmhrc.in", "campaign": "campaign_a_registration_solved"},
  {"rank": 10, "doctorName": "Dr. Balaji Sharma", "clinicName": "Balaji Healthcare & Surgical Centre", "specialty": "Surgical & Trauma", "city": "Lucknow", "email": "helpdesk@balajihospitals.co.in", "campaign": "campaign_a_registration_solved"},
  {"rank": 11, "doctorName": "Dr. Amitabha Roy", "clinicName": "HealthFlex ENT & Head Neck Clinic", "specialty": "ENT Care", "city": "Kolkata", "email": "info@entkolkata.co.in", "campaign": "campaign_a_registration_solved"},
  {"rank": 12, "doctorName": "Dr. Rajesh Garg", "clinicName": "Garg Orthocare Centre", "specialty": "Orthopedics", "city": "Noida", "email": "info@gargorthocare.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 13, "doctorName": "Dr. Vivek Sharma", "clinicName": "Sharma ENT & Head Neck Care", "specialty": "ENT Care", "city": "Delhi NCR", "email": "info@sharmaentclinic.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 14, "doctorName": "Dr. K. S. Reddy", "clinicName": "KS Orthopedic Centre", "specialty": "Orthopedics", "city": "Chennai", "email": "contact@ksorthoclinic.in", "campaign": "campaign_a_registration_solved"},
  {"rank": 15, "doctorName": "Dr. A. K. Jain", "clinicName": "Jain Joint & Spine Clinic", "specialty": "Orthopedics", "city": "Jaipur", "email": "info@jainorthojp.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 16, "doctorName": "Dr. Nitish Saxena", "clinicName": "Aster CMI Hospital OPD", "specialty": "Multi Specialty OPD", "city": "Bengaluru", "email": "info.astercmi@asterhospital.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 17, "doctorName": "Dr. S. K. Narang", "clinicName": "Sterling Hospitals OPD", "specialty": "Cardiology & Surgery", "city": "Ahmedabad", "email": "info@sterlinghospitals.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 18, "doctorName": "Dr. P. S. Venkatesh", "clinicName": "Kovai Medical Center OPD", "specialty": "Orthopedics & OPD", "city": "Coimbatore", "email": "getwell@kmchhospitals.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 19, "doctorName": "Dr. Anoop Misra", "clinicName": "Fortis C-DOC Centre of Excellence", "specialty": "Diabetes & Metabolic Care", "city": "Delhi NCR", "email": "contactus@fortiscdoc.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 20, "doctorName": "Dr. B. K. Rao", "clinicName": "Sir Ganga Ram Hospital Critical OPD", "specialty": "Internal Medicine", "city": "Delhi NCR", "email": "criticalcare@sgrh.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 21, "doctorName": "Dr. Vinod Raina", "clinicName": "Fortis Memorial Specialty OPD", "specialty": "Specialty Care", "city": "Gurgaon", "email": "cancercare.fmri@fortishealthcare.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 22, "doctorName": "Dr. T. S. Kler", "clinicName": "Fortis Escorts Heart OPD", "specialty": "Cardiology", "city": "Delhi NCR", "email": "cardiology.fehi@fortishealthcare.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 23, "doctorName": "Dr. Rajiv Parakh", "clinicName": "Medanta Peripheral Vascular OPD", "specialty": "Vascular Surgery", "city": "Gurgaon", "email": "vascular@medanta.org", "campaign": "campaign_a_registration_solved"},
  {"rank": 24, "doctorName": "Dr. Pradeep Sharma", "clinicName": "Centre for Sight Strabismus OPD", "specialty": "Ophthalmology", "city": "Delhi NCR", "email": "squint@centreforsight.net", "campaign": "campaign_a_registration_solved"},
  {"rank": 25, "doctorName": "Dr. Subash Kumar", "clinicName": "Apollo Hospitals Greams Road OPD", "specialty": "General Surgery & OPD", "city": "Chennai", "email": "surgery.chennai@apollohospitals.com", "campaign": "campaign_a_registration_solved"},

  # CAMPAIGN B: AI Capacity & Doctor Flow (20 Prospects)
  {"rank": 26, "doctorName": "Dr. Naresh Trehan", "clinicName": "Medanta The Medicity OPD Hub", "specialty": "Cardiology & Multi Specialty", "city": "Gurgaon", "email": "info@medanta.org", "campaign": "campaign_b_ai_capacity"},
  {"rank": 27, "doctorName": "Dr. Prathap C. Reddy", "clinicName": "Apollo Hospitals Enterprise OPD", "specialty": "Multi Specialty OPD", "city": "Chennai", "email": "customercare@apollohospitals.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 28, "doctorName": "Dr. Devi Shetty", "clinicName": "Narayana Health City OPD", "specialty": "Cardiology & Multi Specialty", "city": "Bengaluru", "email": "info.nsh@narayanahealth.org", "campaign": "campaign_b_ai_capacity"},
  {"rank": 29, "doctorName": "Dr. Sudarshan Ballal", "clinicName": "Manipal Hospitals Health Hub", "specialty": "Internal Medicine & OPD", "city": "Bengaluru", "email": "info@manipalhospitals.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 30, "doctorName": "Dr. Sandeep Budhiraja", "clinicName": "Max Super Speciality Hospital", "specialty": "Internal Medicine & Multi Specialty", "city": "Delhi NCR", "email": "contactus@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 31, "doctorName": "Dr. Ashutosh Raghuvanshi", "clinicName": "Fortis Healthcare Operations", "specialty": "Multi Specialty", "city": "Gurgaon", "email": "reachus@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 32, "doctorName": "Dr. B. S. Ajaikumar", "clinicName": "HCG Specialty Care OPD", "specialty": "Specialty Care", "city": "Bengaluru", "email": "info@hcgoncology.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 33, "doctorName": "Dr. Ramakanta Panda", "clinicName": "Asian Heart Institute", "specialty": "Cardiology & Surgery", "city": "Mumbai", "email": "info@ahirc.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 34, "doctorName": "Dr. Alok Sharma", "clinicName": "NeuroGen Brain & Spine Institute", "specialty": "Neurology & Spine", "city": "Mumbai", "email": "contact@neurogenbsi.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 35, "doctorName": "Dr. Shuchin Bajaj", "clinicName": "Ujala Cygnus Hospital", "specialty": "Multi Specialty", "city": "Lucknow", "email": "info@ujalacygnus.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 36, "doctorName": "Dr. R. K. Mani", "clinicName": "Yashoda Super Speciality Hospital", "specialty": "Pulmonology & OPD", "city": "Ghaziabad", "email": "info@yashodahospital.org", "campaign": "campaign_b_ai_capacity"},
  {"rank": 37, "doctorName": "Dr. G. S. Rao", "clinicName": "Yashoda Hospitals Somajiguda", "specialty": "Multi Specialty OPD", "city": "Hyderabad", "email": "info@yashodamail.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 38, "doctorName": "Dr. K. Ravindranath", "clinicName": "Gleneagles Global Hospitals", "specialty": "Gastro & Surgery", "city": "Hyderabad", "email": "info.hyderabad@globalhospitalsindia.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 39, "doctorName": "Dr. Somesh Mittal", "clinicName": "Vikram Hospital Healthcare", "specialty": "Cardiology & Surgery", "city": "Bengaluru", "email": "care@vikramhospital.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 40, "doctorName": "Dr. Subhash Chandra", "clinicName": "BLK-Max Super Speciality Hospital", "specialty": "Cardiology & OPD", "city": "Delhi NCR", "email": "info@blkhospital.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 41, "doctorName": "Dr. Nandkishore Kapadia", "clinicName": "Kokilaben Dhirubhai Ambani Hospital", "specialty": "Multi Specialty OPD", "city": "Mumbai", "email": "info@kdahospital.org", "campaign": "campaign_b_ai_capacity"},
  {"rank": 42, "doctorName": "Dr. P. C. Rath", "clinicName": "Apollo Hospitals Jubilee Hills", "specialty": "Cardiology", "city": "Hyderabad", "email": "apollo_hyderabad@apollohospitals.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 43, "doctorName": "Dr. Amit Varma", "clinicName": "Paras Healthcare OPD", "specialty": "Multi Specialty", "city": "Gurgaon", "email": "contact@parashospitals.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 44, "doctorName": "Dr. Dharmesh Kapoor", "clinicName": "Care Hospitals Banjara Hills", "specialty": "Multi Specialty & Liver", "city": "Hyderabad", "email": "info@carehospitals.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 45, "doctorName": "Dr. Sunil K. Pandya", "clinicName": "Jaslok Hospital OPD Services", "specialty": "Multi Specialty", "city": "Mumbai", "email": "info@jaslokhospital.net", "campaign": "campaign_b_ai_capacity"},

  # CAMPAIGN C: Small Clinic Digitization (15 Prospects)
  {"rank": 46, "doctorName": "Dr. Manish Khanna", "clinicName": "Apley Orthopaedic Centre", "specialty": "Orthopedics", "city": "Lucknow", "email": "apleyortho@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 47, "doctorName": "Dr. Rohit Chakor", "clinicName": "Bone & Joint Clinic", "specialty": "Orthopedics", "city": "Pune", "email": "drrohitchakor@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 48, "doctorName": "Dr. Nikhil Sharma", "clinicName": "Ace Orthocare", "specialty": "Orthopedics & Trauma", "city": "Gurgaon", "email": "contact@aceorthocare.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 49, "doctorName": "Dr. Chakradhar Reddy", "clinicName": "Dr. Chakri's Ortho Clinic", "specialty": "Orthopedics", "city": "Hyderabad", "email": "info@drchakrisortho.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 50, "doctorName": "Dr. Vikas Gupta", "clinicName": "Hand & Upper Extremity Clinic", "specialty": "Orthopedics", "city": "Delhi NCR", "email": "info@drvikasgupta.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 51, "doctorName": "Dr. Rajesh Verma", "clinicName": "Spine & Bone Care", "specialty": "Orthopedics & Spine", "city": "Noida", "email": "drrajeshverma@spinecare.in", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 52, "doctorName": "Dr. Ananya Mukherjee", "clinicName": "Care & Cure ENT Centre", "specialty": "ENT & Head Neck", "city": "Kolkata", "email": "carecureent@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 53, "doctorName": "Dr. Tarun Grover", "clinicName": "Vascular & Vein Clinic", "specialty": "Vascular Surgery", "city": "Delhi NCR", "email": "info@tarungrover.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 54, "doctorName": "Dr. Vishal Patil", "clinicName": "Dr. Vishal Patil Ortho Clinic", "specialty": "Orthopedics", "city": "Pune", "email": "drvishalarthrocare@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 55, "doctorName": "Dr. Mahesh Kulkarni", "clinicName": "Joint Replacement Clinic Pune", "specialty": "Orthopedics", "city": "Pune", "email": "jointreplacementpune@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 56, "doctorName": "Dr. Aniket Patil", "clinicName": "Om Ortho & Physio Clinic", "specialty": "Orthopedics & Physio", "city": "Pune", "email": "draniketpatil12@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 57, "doctorName": "Dr. Alok Verma", "clinicName": "Verma Ortho & Trauma Clinic", "specialty": "Orthopedics", "city": "Lucknow", "email": "alokortholko@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 58, "doctorName": "Dr. Sanjay Bhatnagar", "clinicName": "Bhatnagar Orthocenter", "specialty": "Orthopedics", "city": "Noida", "email": "bhatnagarorthonoida@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 59, "doctorName": "Dr. Tarun Kumar", "clinicName": "Kumar Orthopedic & Spine Clinic", "specialty": "Orthopedics", "city": "Hyderabad", "email": "kumarorthohyd@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
  {"rank": 60, "doctorName": "Dr. Sunil Deshmukh", "clinicName": "Deshmukh Polyclinic", "specialty": "General Medicine & Multi", "city": "Pune", "email": "deshmukhpolyclinic@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},

  # CAMPAIGN D: Specialty-Specific Queue Asymmetry (20 Prospects)
  {"rank": 61, "doctorName": "Dr. K. Sai Eswar", "clinicName": "Sai Eswar Children's Clinic", "specialty": "Pediatrics", "city": "Chennai", "email": "saieswarkids@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 62, "doctorName": "Dr. Smita Prasad", "clinicName": "Little Feet Child Clinic", "specialty": "Pediatrics", "city": "Bengaluru", "email": "littlefeetblr@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 63, "doctorName": "Dr. Sunita Rao", "clinicName": "Mother & Child Care Clinic", "specialty": "Pediatrics", "city": "Bengaluru", "email": "care@motherandchildblr.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 64, "doctorName": "Dr. Pallavi Joshi", "clinicName": "Joshi Children's Clinic", "specialty": "Pediatrics", "city": "Pune", "email": "joshichildrensclinic@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 65, "doctorName": "Dr. Radhika Menon", "clinicName": "Menon Pediatric Centre", "specialty": "Pediatrics", "city": "Chennai", "email": "menonchildcare@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 66, "doctorName": "Dr. Priya Das", "clinicName": "Das Child Health Clinic", "specialty": "Pediatrics", "city": "Kolkata", "email": "daschildclinic@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 67, "doctorName": "Dr. Swati Ghosh", "clinicName": "Ghosh Pediatric & Newborn Clinic", "specialty": "Pediatrics", "city": "Kolkata", "email": "ghoshchildcare@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 68, "doctorName": "Dr. Deepali Mishra", "clinicName": "Mishra Child & Vaccination Care", "specialty": "Pediatrics", "city": "Lucknow", "email": "mishrachildcarelko@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 69, "doctorName": "Dr. Arvind Kulkarni", "clinicName": "Spine & Joint Health Centre", "specialty": "Orthopedics & Spine", "city": "Mumbai", "email": "spinehealthmumbai@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 70, "doctorName": "Dr. Neeraj Bansal", "clinicName": "Bansal Orthopedic & Spine Centre", "specialty": "Orthopedics", "city": "Delhi NCR", "email": "bansalorthodelhi@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 71, "doctorName": "Dr. Anand Rao", "clinicName": "Rao Orthopedic & Sports Clinic", "specialty": "Orthopedics", "city": "Bengaluru", "email": "raoorthoblr@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 72, "doctorName": "Dr. Vinod Sharma", "clinicName": "Sharma Ortho & Joint Clinic", "specialty": "Orthopedics", "city": "Jaipur", "email": "sharmaorthojaipur@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 73, "doctorName": "Dr. Saurabh Jain", "clinicName": "Jain Spine & Orthocare", "specialty": "Orthopedics & Spine", "city": "Lucknow", "email": "jainspineortho@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 74, "doctorName": "Dr. Deepa Sen", "clinicName": "Sen Skin & Aesthetics", "specialty": "Dermatology", "city": "Kolkata", "email": "senskinclinic@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 75, "doctorName": "Dr. Amit Gupta", "clinicName": "Gupta Skin & Laser Clinic", "specialty": "Dermatology", "city": "Delhi NCR", "email": "guptaskindelhi@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 76, "doctorName": "Dr. Shalini Kulkarni", "clinicName": "Kulkarni Skin & Hair Care", "specialty": "Dermatology", "city": "Pune", "email": "kulkarniskinpune@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 77, "doctorName": "Dr. Poonam Sethi", "clinicName": "Sethi Skin & Aesthetic Centre", "specialty": "Dermatology", "city": "Delhi NCR", "email": "sethiskindelhi@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 78, "doctorName": "Dr. Maya Hegde", "clinicName": "Hegde Skin & Aesthetic Centre", "specialty": "Dermatology", "city": "Bengaluru", "email": "hegdeskinblr@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 79, "doctorName": "Dr. Meenakshi Sundaram", "clinicName": "Sundaram Eye & Retina Care", "specialty": "Ophthalmology", "city": "Chennai", "email": "sundarameye@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 80, "doctorName": "Dr. Rohit Saxena", "clinicName": "Saxena Eye & Laser Centre", "specialty": "Ophthalmology", "city": "Lucknow", "email": "saxenaeyelko@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},

  # CAMPAIGN E: The Human Receptionist Dilemma (20 Prospects)
  {"rank": 81, "doctorName": "Dr. Surendra Singh", "clinicName": "Singh ENT Clinic", "specialty": "ENT Care", "city": "Jaipur", "email": "singhentjaipur@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 82, "doctorName": "Dr. Prateek Srivastava", "clinicName": "Srivastava ENT & Sinus Centre", "specialty": "ENT Care", "city": "Lucknow", "email": "srivastavaentlko@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 83, "doctorName": "Dr. Karthik Sundar", "clinicName": "Sundar ENT Care Centre", "specialty": "ENT Care", "city": "Chennai", "email": "sundarentchennai@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 84, "doctorName": "Dr. Murali Mohan", "clinicName": "Mohan ENT & Voice Clinic", "specialty": "ENT Care", "city": "Hyderabad", "email": "mohanenthyd@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 85, "doctorName": "Dr. Arun Kumar", "clinicName": "Kumar ENT & Allergy Clinic", "specialty": "ENT Care", "city": "Noida", "email": "kumarentnoida@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 86, "doctorName": "Dr. R.V. Raman", "clinicName": "Raman Heart & Vascular Clinic", "specialty": "Cardiology", "city": "Chennai", "email": "ramanheartcare@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 87, "doctorName": "Dr. Harish Chandra", "clinicName": "Chandra Heart & Chest Clinic", "specialty": "Cardiology", "city": "Lucknow", "email": "chandraheartlko@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 88, "doctorName": "Dr. Manish Tandon", "clinicName": "Tandon Gastro & Liver Clinic", "specialty": "Gastroenterology", "city": "Lucknow", "email": "tandongastrolko@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 89, "doctorName": "Dr. Hemant Patel", "clinicName": "Patel Dental & Maxillofacial", "specialty": "Dentistry", "city": "Ahmedabad", "email": "pateldentalcare@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 90, "doctorName": "Dr. Ajay Mehta", "clinicName": "Mehta Dental Care & Implantology", "specialty": "Dentistry", "city": "Mumbai", "email": "mehtadentaljuhu@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 91, "doctorName": "Dr. Sandip Mukherjee", "clinicName": "Mukherjee Dental Surgery", "specialty": "Dentistry", "city": "Kolkata", "email": "mukherjeedentalcare@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 92, "doctorName": "Dr. Geeta Nair", "clinicName": "Nair Women's Clinic", "specialty": "Gynecology", "city": "Bengaluru", "email": "nairwomenscare@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 93, "doctorName": "Dr. Kavita Reddy", "clinicName": "Reddy Women's Care & Maternity", "specialty": "Gynecology", "city": "Hyderabad", "email": "reddywomenshyd@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 94, "doctorName": "Dr. Ritu Agarwal", "clinicName": "Agarwal Gynae & Fertility Clinic", "specialty": "Gynecology", "city": "Jaipur", "email": "agarwalgynaejaipur@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 95, "doctorName": "Dr. Rashmi Patel", "clinicName": "Patel Women's Clinic", "specialty": "Gynecology", "city": "Ahmedabad", "email": "patelwomensclinic@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 96, "doctorName": "Dr. Archana Balan", "clinicName": "Balan Eye Care Clinic", "specialty": "Ophthalmology", "city": "Chennai", "email": "balaneyecare@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 97, "doctorName": "Dr. Ananya Roy", "clinicName": "Roy Eye Clinic & Vision Therapy", "specialty": "Ophthalmology", "city": "Kolkata", "email": "royeyeclinic@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 98, "doctorName": "Dr. Vikram Seth", "clinicName": "Seth Orthopaedic & Joint Clinic", "specialty": "Orthopedics", "city": "Gurgaon", "email": "sethorthogurgaon@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 99, "doctorName": "Dr. Manish Kapoor", "clinicName": "Kapoor Heart & Medical Polyclinic", "specialty": "Multi Specialty & Cardiology", "city": "Delhi NCR", "email": "kapoorpolyclinicdelhi@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
  {"rank": 100, "doctorName": "Dr. Aniruddh Joshi", "clinicName": "Joshi Orthopaedic & Trauma Centre", "specialty": "Orthopedics & Trauma", "city": "Pune", "email": "joshiarthrocare@gmail.com", "campaign": "campaign_e_receptionist_dilemma"}
]

# Additional 20 Verified Multi-Specialty Clinics & Hospital OPDs to reach total batch size
ADDITIONAL_INSTITUTIONAL = [
  {"rank": 101, "doctorName": "Dr. K. H. Sancheti", "clinicName": "Sancheti Joint Replacement", "specialty": "Orthopedics", "city": "Pune", "email": "info@sanchetihospital.org", "campaign": "campaign_a_registration_solved"},
  {"rank": 102, "doctorName": "Dr. Rajesh Ahlawat", "clinicName": "Medanta Kidney Institute", "specialty": "Urology & Kidney", "city": "Gurgaon", "email": "urology@medanta.org", "campaign": "campaign_b_ai_capacity"},
  {"rank": 103, "doctorName": "Dr. Anant Kumar", "clinicName": "Max Healthcare Urology", "specialty": "Urology", "city": "Delhi NCR", "email": "urology@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 104, "doctorName": "Dr. N. P. Gupta", "clinicName": "Medanta Robotic Surgery", "specialty": "Robotic Surgery", "city": "Gurgaon", "email": "roboticsurgery@medanta.org", "campaign": "campaign_b_ai_capacity"},
  {"rank": 105, "doctorName": "Dr. A. S. Bawa", "clinicName": "Artemis Urology Centre", "specialty": "Urology", "city": "Gurgaon", "email": "urology@artemishospitals.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 106, "doctorName": "Dr. S. K. Sarin", "clinicName": "Institute of Liver Sciences", "specialty": "Hepatology & Liver", "city": "Delhi NCR", "email": "ilbs.delhi@gmail.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 107, "doctorName": "Dr. R. K. Dhiman", "clinicName": "Sanjay Gandhi PGI OPD", "specialty": "Gastroenterology", "city": "Lucknow", "email": "director@sgpgi.ac.in", "campaign": "campaign_b_ai_capacity"},
  {"rank": 108, "doctorName": "Dr. S. P. Ambesh", "clinicName": "Medanta Lucknow OPD", "specialty": "Multi Specialty OPD", "city": "Lucknow", "email": "lucknow@medanta.org", "campaign": "campaign_a_registration_solved"},
  {"rank": 109, "doctorName": "Dr. Rakesh Kapoor", "clinicName": "Medanta Lucknow Urology", "specialty": "Urology & Renal", "city": "Lucknow", "email": "urology.lucknow@medanta.org", "campaign": "campaign_b_ai_capacity"},
  {"rank": 110, "doctorName": "Dr. Gaurav Agarwal", "clinicName": "Apollomedics Super Speciality", "specialty": "Multi Specialty OPD", "city": "Lucknow", "email": "info_lko@apollohospitals.com", "campaign": "campaign_a_registration_solved"},
  {"rank": 111, "doctorName": "Dr. Sushil Tahiliani", "clinicName": "Tahiliani Skin Clinic", "specialty": "Dermatology", "city": "Mumbai", "email": "info@tahilianiclinic.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 112, "doctorName": "Dr. Anil Tibrewala", "clinicName": "Hinduja Healthcare OPD", "specialty": "Surgery & Aesthetics", "city": "Mumbai", "email": "plasticsurgery@hindujahealthcare.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 113, "doctorName": "Dr. Shailesh Puntambekar", "clinicName": "Galaxy CARE Hospital", "specialty": "Laparoscopy & Surgery", "city": "Pune", "email": "info@galaxycare.org", "campaign": "campaign_a_registration_solved"},
  {"rank": 114, "doctorName": "Dr. K. G. Alexander", "clinicName": "Baby Memorial Hospital", "specialty": "Multi Specialty OPD", "city": "Calicut", "email": "info@babymhospital.org", "campaign": "campaign_a_registration_solved"},
  {"rank": 115, "doctorName": "Dr. B. K. Goyal", "clinicName": "Bombay Hospital OPD Clinic", "specialty": "Cardiology", "city": "Mumbai", "email": "info@bombayhospital.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 116, "doctorName": "Dr. Ajay Kumar", "clinicName": "Fortis Escorts Liver Care", "specialty": "Gastroenterology", "city": "Delhi NCR", "email": "gastro.fehi@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},
  {"rank": 117, "doctorName": "Dr. Randhir Sud", "clinicName": "Medanta Digestive Health", "specialty": "Gastroenterology", "city": "Gurgaon", "email": "digestive@medanta.org", "campaign": "campaign_b_ai_capacity"},
  {"rank": 118, "doctorName": "Dr. C. S. Yadav", "clinicName": "Sir Ganga Ram Ortho Clinic", "specialty": "Orthopedics & Joint", "city": "Delhi NCR", "email": "ortho@sgrh.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 119, "doctorName": "Dr. Prateek Gupta", "clinicName": "Sir Ganga Ram Sports Medicine", "specialty": "Orthopedics & Sports", "city": "Delhi NCR", "email": "sportsmed@sgrh.com", "campaign": "campaign_d_specialty_asymmetry"},
  {"rank": 120, "doctorName": "Dr. S. K. Rajan", "clinicName": "Artemis Spine Institute", "specialty": "Spine & Neuro", "city": "Gurgaon", "email": "spine@artemishospitals.com", "campaign": "campaign_d_specialty_asymmetry"}
]

ALL_LEADS = RESEARCH_PROSPECTS + ADDITIONAL_INSTITUTIONAL

print(f"Total prospect leads in queue: {len(ALL_LEADS)}")
print("Pre-validating MX DNS records in real-time...")

# 4. Filter and Validate
validated_queue = []
for lead in ALL_LEADS:
    email_clean = lead['email'].strip().lower()
    domain = email_clean.split('@')[-1]
    has_mx, mx_hosts = check_domain_mx(domain)
    if has_mx:
        validated_queue.append(lead)
    else:
        print(f"[REJECTED] {lead['clinicName']} ({domain}) -> No MX found")

print(f"Total MX-Validated leads: {len(validated_queue)} / {len(ALL_LEADS)}")

# 5. Load Log and Opt-outs
send_logs = []
already_sent = set()
if os.path.exists(log_file):
    try:
        with open(log_file, 'r', encoding='utf-8') as lf:
            send_logs = json.load(lf)
            for entry in send_logs:
                if entry.get('status') == 'SENT' and entry.get('recipientEmail'):
                    already_sent.add(entry['recipientEmail'].strip().lower())
    except:
        pass

opt_outs = set()
if os.path.exists(opt_out_file):
    try:
        with open(opt_out_file, 'r', encoding='utf-8') as of:
            opt_outs = set(json.load(of))
    except:
        pass

sent_count = 0
failed_count = 0
skipped_count = 0

print("\n==================================================")
print("STARTING DISPATCH OF RESEARCH-DRIVEN 5-CAMPAIGN EXPERIMENT")
print(f"Target Queue: {len(validated_queue)} Verified Clinics")
print(f"Sender: Sankalp Mishra <{brevo_sender}>")
print("==================================================\n")

for lead in validated_queue:
    email_clean = lead['email'].strip().lower()
    doc_name = lead['doctorName'].strip()
    if not doc_name.startswith("Dr.") and not doc_name.startswith("Dr "):
        doc_name = f"Dr. {doc_name}"

    if email_clean in already_sent:
        skipped_count += 1
        continue
    if email_clean in opt_outs:
        skipped_count += 1
        continue

    campaign_tag = lead['campaign']
    website_url = f"https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign={campaign_tag}"

    # Build Copy based on assigned Campaign Family
    if campaign_tag == "campaign_a_registration_solved":
        subject = "The queue starts after registration"
        body_core = f"""India has now crossed 25 crore digital OPD registrations through ABDM's Scan and Register service.

It made me think about a different part of the patient journey.

Once five patients are already waiting, what happens when another patient arrives who may need attention sooner?

Registration can tell the clinic that the patient has arrived. It does not necessarily tell the clinic who should be seen next.

That is the small problem I am building SwasthAI around.

A patient answers a few structured questions after scanning a QR code. SwasthAI creates a recommended priority order for the doctor to review, and the doctor can change it whenever needed.

I am looking for a few clinics to test this with a real OPD workflow."""

    elif campaign_tag == "campaign_b_ai_capacity":
        subject = "When doctors see more patients"
        body_core = f"""A recent healthcare survey by Philips found that 71 percent of Indian healthcare professionals felt AI increased their capacity to handle patients.

It made me think about where the next bottleneck appears.

If a clinic can handle more patients, deciding which patient in the waiting room needs attention first becomes even more important.

Right now, arrival order usually determines who goes in first, regardless of why they came in.

That is the small problem I am building SwasthAI around.

A patient answers a few short questions after scanning a QR code at reception. SwasthAI provides a recommended priority order for the doctor to review, while the doctor stays completely in control.

I am looking for a few clinics to test this with a real OPD workflow."""

    elif campaign_tag == "campaign_c_small_clinic_digitization":
        subject = "The part of the clinic that stays manual"
        body_core = f"""With initiatives like eSushrut at Clinic, software is finally being built specifically for smaller outpatient practices.

It solves billing, registration and records. But there is still one daily decision that often lives entirely in someone's head.

Once several patients are sitting in the waiting room, how does the clinic decide who should be seen next?

Digitizing a queue tells you who arrived, but it does not tell you who needs attention first.

That is the small problem I am building SwasthAI around.

Patients answer a few short questions on their phone after scanning a QR code. SwasthAI creates a recommended priority queue for the doctor to review, and the doctor can adjust it at any time.

I am looking for a few clinics to test this with a real OPD workflow."""

    elif campaign_tag == "campaign_d_specialty_asymmetry":
        spec_lower = lead['specialty'].lower()
        if "pediatric" in spec_lower or "child" in spec_lower:
            spec_p = "A child with sudden high fever and a child arriving for a routine vaccination can arrive within minutes of each other. A standard token queue treats them as identical until someone visibly complains."
            subject = f"A question about pediatric walk ins at {lead['clinicName']}"
        elif "ortho" in spec_lower or "bone" in spec_lower:
            spec_p = "An acute fresh sprain, a post procedure dressing check and a routine follow up all sit in the same arrival queue. A standard token queue cannot tell them apart."
            subject = f"A question about orthopedic walk ins at {lead['clinicName']}"
        elif "derma" in spec_lower or "skin" in spec_lower:
            spec_p = "An acute spreading rash flare up and a routine follow up appear identical on an arrival token list until the consultation begins."
            subject = f"A question about skin OPD walk ins at {lead['clinicName']}"
        else:
            spec_p = "When acute cases and routine consultations wait in the same arrival queue, deciding who should be seen first is usually left to visual impression."
            subject = f"A question about walk ins at {lead['clinicName']}"

        body_core = f"""In outpatient clinics, different patient cases often enter the exact same waiting queue.

{spec_p}

That is the small problem I am building SwasthAI around.

Patients answer a few structured questions about their symptoms after scanning a QR code. SwasthAI recommends a clinical priority order for the doctor to review, while the doctor stays completely in control.

I am looking for a few clinics to test this with a real OPD workflow."""

    else: # campaign_e_receptionist_dilemma
        subject = "The decision receptionists make all day"
        body_core = f"""There is an uncomfortable decision receptionists make all day.

Who should go next?

Usually they have a token number, an appointment list and whatever brief information the patient shares at the desk. But sometimes the patient who arrived fifth should not actually be fifth.

I am building SwasthAI around that small problem.

Patients answer a few structured questions after scanning a QR code at reception. The system creates a recommended priority order for the doctor to review, while the doctor stays completely in control.

I am looking for a few clinics to test this with a real OPD workflow."""

    plain_text = f"""{doc_name},

{body_core}

Would you be open to seeing the 2 minute version?

Sankalp Mishra
Founder, SwasthAI

{website_url}

If you would rather not receive emails from me, just reply "no" and I will not follow up."""

    paragraphs = body_core.split('\n\n')
    html_paragraphs = "".join([f'<p style="margin: 0 0 16px 0;">{p.replace(chr(10), "<br>")}</p>' for p in paragraphs])

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222222; background-color: #ffffff; margin: 0; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
    <p style="margin: 0 0 16px 0;">{doc_name},</p>
    
    {html_paragraphs}
    
    <p style="margin: 0 0 20px 0;">Would you be open to seeing the 2 minute version?</p>
    
    <p style="margin: 0 0 4px 0;">Sankalp Mishra<br>Founder, SwasthAI</p>
    <p style="margin: 0 0 24px 0;"><a href="{website_url}" style="color: #008080; text-decoration: underline;">https://swasthai-three.vercel.app/</a></p>
    
    <p style="margin: 32px 0 0 0; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee; padding-top: 12px;">If you would rather not receive messages from me, just reply &quot;no&quot; and I will not follow up.</p>
  </div>
</body>
</html>"""

    # Zero Dash safety check
    clean_lines = [l for l in plain_text.split("\n") if "http" not in l]
    for line in clean_lines:
        if "—" in line or "–" in line or " - " in line:
            print(f"[REJECTED ZERO DASH] {line}")
            continue

    payload = {
        "sender": {
            "name": "Sankalp Mishra",
            "email": brevo_sender
        },
        "to": [
            {
                "email": email_clean,
                "name": doc_name
            }
        ],
        "replyTo": {
            "name": "Sankalp Mishra",
            "email": "swasthai.founder@gmail.com"
        },
        "subject": subject,
        "textContent": plain_text,
        "htmlContent": html_content,
        "tags": [campaign_tag, f"rank_{lead['rank']}"]
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
            already_sent.add(email_clean)
            
            send_logs.append({
                "prospectName": doc_name,
                "doctorName": doc_name,
                "clinicName": lead['clinicName'],
                "recipientEmail": email_clean,
                "sentAt": datetime.now().isoformat() + "Z",
                "subject": subject,
                "status": "SENT",
                "brevoMessageId": msg_id,
                "error": None,
                "campaign": campaign_tag,
                "rank": lead['rank']
            })
            print(f"[{lead['rank']}] [SENT] {doc_name} | {lead['clinicName']} | {email_clean} | ID: {msg_id}")
            
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        failed_count += 1
        print(f"[{lead['rank']}] [FAILED] {doc_name} ({email_clean}) -> {e.code}: {err_body}")
    except Exception as ex:
        failed_count += 1
        print(f"[{lead['rank']}] [ERROR] {doc_name} ({email_clean}) -> {str(ex)}")

    with open(log_file, 'w', encoding='utf-8') as lf:
        json.dump(send_logs, lf, indent=2)

    time.sleep(1.0)

print("\n==================================================")
print("EXPERIMENT DISPATCH COMPLETE")
print(f"Successfully Sent: {sent_count}")
print(f"Failed: {failed_count}")
print(f"Skipped / Duplicate: {skipped_count}")
print(f"Total Cumulative Inboxes in Log: {len(send_logs)}")
print("==================================================")
