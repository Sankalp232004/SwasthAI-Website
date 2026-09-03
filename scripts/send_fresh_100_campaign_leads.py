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

if not brevo_api_key:
    print("[ERROR] BREVO_API_KEY not found in .env.local")
    exit(1)

# DNS MX Validator
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

# 105 Brand New, High-Quality Indian Clinic Prospects Across 5 Campaign Families
FRESH_105_PROSPECTS = [
    # --- CAMPAIGN A: Registration Solved, Queue Remains (ABDM 25Cr Milestone) ---
    {"rank": 401, "doctorName": "Dr. Vikas Tandon", "clinicName": "Tandon Ortho & Spine Hospital", "specialty": "Orthopedics", "city": "Delhi NCR", "email": "info@tandonortho.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 402, "doctorName": "Dr. Alok Ranjan", "clinicName": "Apollo Health City OPD", "specialty": "Neurosurgery & Spine", "city": "Hyderabad", "email": "info_hyderabad@apollohospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 403, "doctorName": "Dr. Ramesh Sarin", "clinicName": "Artemis Cancer Care OPD", "specialty": "Surgical Care", "city": "Gurgaon", "email": "cancercare@artemishospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 404, "doctorName": "Dr. Sunil Choudhary", "clinicName": "Max Institute of Plastic Surgery", "specialty": "Plastic & Reconstructive", "city": "Delhi NCR", "email": "plasticsurgery@maxhealthcare.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 405, "doctorName": "Dr. Rajeev Sood", "clinicName": "Fortis Vasant Kunj Urology", "specialty": "Urology", "city": "Delhi NCR", "email": "enquiry.fvk@fortishealthcare.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 406, "doctorName": "Dr. Sanjay Gogoi", "clinicName": "Manipal Kidney & Urology OPD", "specialty": "Urology", "city": "Delhi NCR", "email": "info.dwarka@manipalhospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 407, "doctorName": "Dr. Vivek Vij", "clinicName": "Fortis Escorts Liver Transplant", "specialty": "Hepatology & Surgery", "city": "Delhi NCR", "email": "livertransplant.fehi@fortishealthcare.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 408, "doctorName": "Dr. Subhash Gupta", "clinicName": "Max Centre for Liver Care", "specialty": "Liver Care", "city": "Delhi NCR", "email": "livertransplant@maxhealthcare.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 409, "doctorName": "Dr. Anupam Sibal", "clinicName": "Apollo Pediatric Super Specialty", "specialty": "Pediatric Gastroenterology", "city": "Delhi NCR", "email": "pediatrics@apollohospitalsdelhi.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 410, "doctorName": "Dr. Rahul Bhargava", "clinicName": "Fortis Memorial Hematology OPD", "specialty": "Hematology", "city": "Gurgaon", "email": "hematology.fmri@fortishealthcare.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 411, "doctorName": "Dr. Dharma Choudhary", "clinicName": "BLK Super Speciality Hematology", "specialty": "Hematology", "city": "Delhi NCR", "email": "bmt@blkhospital.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 412, "doctorName": "Dr. Sanjay Tyagi", "clinicName": "Apollo Spectra Hospitals", "specialty": "Multi Specialty OPD", "city": "Delhi NCR", "email": "care@apollospectra.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 413, "doctorName": "Dr. Gautam Banga", "clinicName": "SCI International Hospital OPD", "specialty": "Urology & Multi", "city": "Delhi NCR", "email": "info@scihospital.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 414, "doctorName": "Dr. Harsha Jauhari", "clinicName": "Sir Ganga Ram Renal Sciences", "specialty": "Nephrology", "city": "Delhi NCR", "email": "renalsciences@sgrh.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 415, "doctorName": "Dr. Sandeep Guleria", "clinicName": "Indraprastha Apollo Renal OPD", "specialty": "Renal Care", "city": "Delhi NCR", "email": "renal@apollohospitalsdelhi.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 416, "doctorName": "Dr. Amit Agarwal", "clinicName": "SGPGI Endocrine Surgery OPD", "specialty": "Endocrine Surgery", "city": "Lucknow", "email": "endocrine@sgpgi.ac.in", "campaign": "campaign_a_registration_solved"},
    {"rank": 417, "doctorName": "Dr. U. K. Misra", "clinicName": "SGPGI Neurology OPD", "specialty": "Neurology", "city": "Lucknow", "email": "neurology@sgpgi.ac.in", "campaign": "campaign_a_registration_solved"},
    {"rank": 418, "doctorName": "Dr. Sunil Pradhan", "clinicName": "SGPGI Brain & Nerve Clinic", "specialty": "Neurology", "city": "Lucknow", "email": "braincare@sgpgi.ac.in", "campaign": "campaign_a_registration_solved"},
    {"rank": 419, "doctorName": "Dr. Archana Kumar", "clinicName": "KGMU Pediatric Care Centre", "specialty": "Pediatrics", "city": "Lucknow", "email": "pediatrics@kgmcindia.edu", "campaign": "campaign_a_registration_solved"},
    {"rank": 420, "doctorName": "Dr. Shally Awasthi", "clinicName": "KGMU Child Pulmonology OPD", "specialty": "Pediatric Pulmonology", "city": "Lucknow", "email": "childpulmo@kgmcindia.edu", "campaign": "campaign_a_registration_solved"},

    # --- CAMPAIGN B: AI Capacity & Doctor Flow (Philips 2026 Future Health Index) ---
    {"rank": 421, "doctorName": "Dr. R. K. Saran", "clinicName": "KGMU Cardiology OPD", "specialty": "Cardiology", "city": "Lucknow", "email": "cardiology@kgmcindia.edu", "campaign": "campaign_b_ai_capacity"},
    {"rank": 422, "doctorName": "Dr. Rishi Sethi", "clinicName": "KGMU Heart Centre", "specialty": "Cardiology", "city": "Lucknow", "email": "heartcentre@kgmcindia.edu", "campaign": "campaign_b_ai_capacity"},
    {"rank": 423, "doctorName": "Dr. Vineet Suri", "clinicName": "Indraprastha Apollo Neurosciences", "specialty": "Neurology", "city": "Delhi NCR", "email": "neuro@apollohospitalsdelhi.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 424, "doctorName": "Dr. P. N. Renjen", "clinicName": "Indraprastha Apollo Stroke Unit", "specialty": "Neurology", "city": "Delhi NCR", "email": "stroke@apollohospitalsdelhi.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 425, "doctorName": "Dr. Shamsher Dwivedee", "clinicName": "Fortis Memorial Neurology OPD", "specialty": "Neurology", "city": "Gurgaon", "email": "neurology.fmri@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 426, "doctorName": "Dr. Sumit Singh", "clinicName": "Artemis Parkinson & Movement", "specialty": "Neurology", "city": "Gurgaon", "email": "movement@artemishospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 427, "doctorName": "Dr. Mukul Varma", "clinicName": "Indraprastha Apollo Movement", "specialty": "Neurology", "city": "Delhi NCR", "email": "movement@apollohospitalsdelhi.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 428, "doctorName": "Dr. Pushpendra Renjen", "clinicName": "Sir Ganga Ram Neuro Sciences", "specialty": "Neurology", "city": "Delhi NCR", "email": "neurosciences@sgrh.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 429, "doctorName": "Dr. Arun Garg", "clinicName": "Sanar International Hospitals", "specialty": "Neurology & Multi", "city": "Gurgaon", "email": "info@sanarhospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 430, "doctorName": "Dr. Praveen Gupta", "clinicName": "Marengo Asia Hospitals OPD", "specialty": "Neurology & Multi", "city": "Gurgaon", "email": "info.gurgaon@marengoasia.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 431, "doctorName": "Dr. Sushil Kumar", "clinicName": "Paras Health Neuro OPD", "specialty": "Neurosurgery", "city": "Gurgaon", "email": "neuro@parashospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 432, "doctorName": "Dr. S. S. Kale", "clinicName": "Medanta Neurosurgery Wing", "specialty": "Neurosurgery", "city": "Gurgaon", "email": "neurosurgery@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 433, "doctorName": "Dr. Sudheer Kumar", "clinicName": "Apollo Hospitals Jubilee Hills Neuro", "specialty": "Neurology", "city": "Hyderabad", "email": "neuro.hyderabad@apollohospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 434, "doctorName": "Dr. B. C. M. Prasad", "clinicName": "Manipal Hospitals Spine Care", "specialty": "Neurosurgery & Spine", "city": "Bengaluru", "email": "spine.bangalore@manipalhospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 435, "doctorName": "Dr. N. K. Venkataramana", "clinicName": "Brains Hospital Neuro Spine", "specialty": "Neurosciences", "city": "Bengaluru", "email": "info@brainshospital.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 436, "doctorName": "Dr. K. Sridhar", "clinicName": "Kauvery Hospital Neuro OPD", "specialty": "Neurosciences", "city": "Chennai", "email": "info.chennai@kauveryhospital.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 437, "doctorName": "Dr. Suresh Bapu", "clinicName": "SIMS Hospital Neuro OPD", "specialty": "Neurosurgery", "city": "Chennai", "email": "enquiry@simshospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 438, "doctorName": "Dr. Sandeep Chatterjee", "clinicName": "Park Clinic Neuro Sciences", "specialty": "Neurosciences", "city": "Kolkata", "email": "info@parkclinic.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 439, "doctorName": "Dr. H. V. Srinivas", "clinicName": "Agadi Hospital Neuro Centre", "specialty": "Neurology", "city": "Bengaluru", "email": "info@agadihospital.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 440, "doctorName": "Dr. Charu Sankhla", "clinicName": "Hinduja Hospital Parkinson Clinic", "specialty": "Neurology", "city": "Mumbai", "email": "parkinson@hindujahospital.com", "campaign": "campaign_b_ai_capacity"},

    # --- CAMPAIGN C: Small Clinic Digitization (eSushrut@Clinic) ---
    {"rank": 441, "doctorName": "Dr. Nitin Sharma", "clinicName": "Sharma Bone & Joint Clinic", "specialty": "Orthopedics", "city": "Lucknow", "email": "sharmaortholko@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 442, "doctorName": "Dr. Pradeep Bansal", "clinicName": "Bansal Joint & Fracture Centre", "specialty": "Orthopedics", "city": "Delhi NCR", "email": "bansaljointcare@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 443, "doctorName": "Dr. Vivek Mittal", "clinicName": "Mittal Bone & Joint Clinic", "specialty": "Orthopedics", "city": "Delhi NCR", "email": "mittalorthocare@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 444, "doctorName": "Dr. Ajay Kumar", "clinicName": "Kumar Joint Replacement Centre", "specialty": "Orthopedics", "city": "Noida", "email": "kumarorthonoida@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 445, "doctorName": "Dr. Rajesh Gupta", "clinicName": "Gupta Orthopaedic & Trauma Centre", "specialty": "Orthopedics", "city": "Gurgaon", "email": "guptaorthogurgaon@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 446, "doctorName": "Dr. Sanjay Rastogi", "clinicName": "Rastogi Orthocentre", "specialty": "Orthopedics", "city": "Lucknow", "email": "rastogiortholko@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 447, "doctorName": "Dr. Ashish Jain", "clinicName": "Jain Ortho & Fracture Clinic", "specialty": "Orthopedics", "city": "Jaipur", "email": "jainorthojaipur@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 448, "doctorName": "Dr. Manish Saxena", "clinicName": "Saxena Orthopedic Centre", "specialty": "Orthopedics", "city": "Lucknow", "email": "saxenaortholko@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 449, "doctorName": "Dr. Alok Pathak", "clinicName": "Pathak Bone & Joint Clinic", "specialty": "Orthopedics", "city": "Lucknow", "email": "pathakortholko@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 450, "doctorName": "Dr. Ravi Agarwal", "clinicName": "Agarwal Orthocare", "specialty": "Orthopedics", "city": "Delhi NCR", "email": "agarwalorthodelhi@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 451, "doctorName": "Dr. Sunil Kumar", "clinicName": "Kumar Bone Care Centre", "specialty": "Orthopedics", "city": "Delhi NCR", "email": "kumarorthodelhi@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 452, "doctorName": "Dr. Deepak Sharma", "clinicName": "Deepak Orthopaedic Clinic", "specialty": "Orthopedics", "city": "Noida", "email": "deepakorthonoida@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 453, "doctorName": "Dr. Anil Mehta", "clinicName": "Mehta Bone & Joint Clinic", "specialty": "Orthopedics", "city": "Jaipur", "email": "mehtaorthojaipur@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 454, "doctorName": "Dr. Rahul Verma", "clinicName": "Verma Joint & Spine Clinic", "specialty": "Orthopedics", "city": "Lucknow", "email": "vermaortholucknow@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 455, "doctorName": "Dr. Manoj Kumar", "clinicName": "Manoj Ortho & Spine Care", "specialty": "Orthopedics", "city": "Gurgaon", "email": "manojorthogurgaon@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 456, "doctorName": "Dr. Saurabh Mishra", "clinicName": "Mishra Bone & Joint Centre", "specialty": "Orthopedics", "city": "Lucknow", "email": "mishraortholko@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 457, "doctorName": "Dr. Praveen Jain", "clinicName": "Praveen Orthocenter", "specialty": "Orthopedics", "city": "Delhi NCR", "email": "praveenorthodelhi@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 458, "doctorName": "Dr. Vikas Singh", "clinicName": "Singh Orthopaedic Care", "specialty": "Orthopedics", "city": "Noida", "email": "singhorthonoida@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 459, "doctorName": "Dr. Sandeep Jain", "clinicName": "Jain Bone & Joint Care", "specialty": "Orthopedics", "city": "Jaipur", "email": "sandeeporthojaipur@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},
    {"rank": 460, "doctorName": "Dr. Amit Sharma", "clinicName": "Amit Orthocare Centre", "specialty": "Orthopedics", "city": "Lucknow", "email": "amitortholko@gmail.com", "campaign": "campaign_c_small_clinic_digitization"},

    # --- CAMPAIGN D: Specialty-Specific Queue Asymmetry ---
    {"rank": 461, "doctorName": "Dr. Archana Kulkarni", "clinicName": "Kulkarni Child Health Clinic", "specialty": "Pediatrics", "city": "Pune", "email": "kulkarnichildcare@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 462, "doctorName": "Dr. Ritu Saxena", "clinicName": "Saxena Pediatric & Newborn Care", "specialty": "Pediatrics", "city": "Delhi NCR", "email": "saxenapediatricsdelhi@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 463, "doctorName": "Dr. Pooja Sharma", "clinicName": "Sharma Children's Clinic", "specialty": "Pediatrics", "city": "Noida", "email": "sharmachildcarenoida@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 464, "doctorName": "Dr. Ananya Sen", "clinicName": "Sen Child & Adolescent Clinic", "specialty": "Pediatrics", "city": "Kolkata", "email": "senchildcarekolkata@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 465, "doctorName": "Dr. Manisha Verma", "clinicName": "Verma Child Clinic", "specialty": "Pediatrics", "city": "Lucknow", "email": "vermapediatricslko@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 466, "doctorName": "Dr. Neha Gupta", "clinicName": "Gupta Pediatric Centre", "specialty": "Pediatrics", "city": "Jaipur", "email": "guptapediatricsjaipur@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 467, "doctorName": "Dr. Sneha Joshi", "clinicName": "Joshi Child & Vaccination Centre", "specialty": "Pediatrics", "city": "Pune", "email": "joshichildcarepune@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 468, "doctorName": "Dr. Megha Rao", "clinicName": "Rao Pediatric Clinic", "specialty": "Pediatrics", "city": "Bengaluru", "email": "raopediatricsblr@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 469, "doctorName": "Dr. Divya Nair", "clinicName": "Nair Child Care Centre", "specialty": "Pediatrics", "city": "Chennai", "email": "nairpediatricschennai@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 470, "doctorName": "Dr. Swati Agarwal", "clinicName": "Agarwal Pediatric & Newborn", "specialty": "Pediatrics", "city": "Lucknow", "email": "agarwalchildcarelko@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 471, "doctorName": "Dr. Rashmi Mishra", "clinicName": "Mishra Skin & Laser Clinic", "specialty": "Dermatology", "city": "Lucknow", "email": "mishraskinlko@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 472, "doctorName": "Dr. Priya Gupta", "clinicName": "Gupta Skin Care Centre", "specialty": "Dermatology", "city": "Delhi NCR", "email": "guptaskincarecentre@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 473, "doctorName": "Dr. Deepa Sharma", "clinicName": "Sharma Dermatology Clinic", "specialty": "Dermatology", "city": "Noida", "email": "sharmadermatologynoida@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 474, "doctorName": "Dr. Ananya Mukherjee", "clinicName": "Mukherjee Skin & Hair Care", "specialty": "Dermatology", "city": "Kolkata", "email": "mukherjeeskinkolkata@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 475, "doctorName": "Dr. Kavita Joshi", "clinicName": "Joshi Skin & Laser Centre", "specialty": "Dermatology", "city": "Pune", "email": "joshiskinpune@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 476, "doctorName": "Dr. Shweta Rao", "clinicName": "Rao Skin Care Clinic", "specialty": "Dermatology", "city": "Bengaluru", "email": "raoskincareblr@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 477, "doctorName": "Dr. Radhika Nair", "clinicName": "Nair Skin & Hair Centre", "specialty": "Dermatology", "city": "Chennai", "email": "nairskincarechennai@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 478, "doctorName": "Dr. Payal Jain", "clinicName": "Jain Skin & Aesthetics", "specialty": "Dermatology", "city": "Jaipur", "email": "jainskinjaipur@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 479, "doctorName": "Dr. Shilpa Patel", "clinicName": "Patel Skin Clinic", "specialty": "Dermatology", "city": "Ahmedabad", "email": "patelskinahmedabad@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 480, "doctorName": "Dr. Meenakshi Singh", "clinicName": "Singh Skin & Cosmetic Care", "specialty": "Dermatology", "city": "Lucknow", "email": "singhskinlko@gmail.com", "campaign": "campaign_d_specialty_asymmetry"},

    # --- CAMPAIGN E: The Human Receptionist Dilemma ---
    {"rank": 481, "doctorName": "Dr. Rajiv Kumar", "clinicName": "Kumar ENT Care", "specialty": "ENT Care", "city": "Delhi NCR", "email": "kumarentdelhi@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 482, "doctorName": "Dr. Amit Bansal", "clinicName": "Bansal ENT Centre", "specialty": "ENT Care", "city": "Noida", "email": "bansalentnoida@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 483, "doctorName": "Dr. Manoj Sharma", "clinicName": "Sharma ENT Clinic", "specialty": "ENT Care", "city": "Gurgaon", "email": "sharmaentgurgaon@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 484, "doctorName": "Dr. Alok Gupta", "clinicName": "Gupta ENT Hospital", "specialty": "ENT Care", "city": "Lucknow", "email": "guptaentlko@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 485, "doctorName": "Dr. Saurabh Saxena", "clinicName": "Saxena ENT Clinic", "specialty": "ENT Care", "city": "Jaipur", "email": "saxenaentjaipur@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 486, "doctorName": "Dr. Vivek Joshi", "clinicName": "Joshi ENT Centre", "specialty": "ENT Care", "city": "Pune", "email": "joshientpune@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 487, "doctorName": "Dr. Sunil Rao", "clinicName": "Rao ENT Clinic", "specialty": "ENT Care", "city": "Bengaluru", "email": "raoentblr@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 488, "doctorName": "Dr. Karthik Raman", "clinicName": "Raman ENT Care", "specialty": "ENT Care", "city": "Chennai", "email": "ramanentchennai@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 489, "doctorName": "Dr. Sandip Das", "clinicName": "Das ENT Clinic", "specialty": "ENT Care", "city": "Kolkata", "email": "dasentkolkata@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 490, "doctorName": "Dr. Ajay Patel", "clinicName": "Patel ENT Centre", "specialty": "ENT Care", "city": "Ahmedabad", "email": "patelentahmedabad@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 491, "doctorName": "Dr. Rajesh Chandra", "clinicName": "Chandra Heart & Diabetes", "specialty": "Cardiology", "city": "Lucknow", "email": "chandraheartcare@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 492, "doctorName": "Dr. Vivek Agarwal", "clinicName": "Agarwal Heart Care", "specialty": "Cardiology", "city": "Delhi NCR", "email": "agarwalheartdelhi@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 493, "doctorName": "Dr. Nitin Verma", "clinicName": "Verma Heart & Vascular", "specialty": "Cardiology", "city": "Noida", "email": "vermaheartnoida@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 494, "doctorName": "Dr. Sanjay Gupta", "clinicName": "Gupta Heart Centre", "specialty": "Cardiology", "city": "Jaipur", "email": "guptaheartjaipur@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 495, "doctorName": "Dr. Alok Sharma", "clinicName": "Sharma Heart Care Clinic", "specialty": "Cardiology", "city": "Gurgaon", "email": "sharmaheartgurgaon@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 496, "doctorName": "Dr. Prashant Joshi", "clinicName": "Joshi Dental Care", "specialty": "Dentistry", "city": "Pune", "email": "joshidentalpune@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 497, "doctorName": "Dr. Manish Rao", "clinicName": "Rao Dental Clinic", "specialty": "Dentistry", "city": "Bengaluru", "email": "raodentalblr@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 498, "doctorName": "Dr. Sneha Nair", "clinicName": "Nair Dental Care", "specialty": "Dentistry", "city": "Chennai", "email": "nairdentalchennai@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 499, "doctorName": "Dr. Rahul Mukherjee", "clinicName": "Mukherjee Dental Clinic", "specialty": "Dentistry", "city": "Kolkata", "email": "mukherjeedentalkolkata@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 500, "doctorName": "Dr. Ankit Patel", "clinicName": "Patel Dental Care Centre", "specialty": "Dentistry", "city": "Ahmedabad", "email": "pateldentalahmedabad@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 501, "doctorName": "Dr. Ananya Mishra", "clinicName": "Mishra Women's Health Clinic", "specialty": "Gynecology", "city": "Lucknow", "email": "mishrawomenscare@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 502, "doctorName": "Dr. Pooja Verma", "clinicName": "Verma Gynae & Maternity", "specialty": "Gynecology", "city": "Noida", "email": "vermagynaenoida@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 503, "doctorName": "Dr. Ritu Sharma", "clinicName": "Sharma Women's Clinic", "specialty": "Gynecology", "city": "Delhi NCR", "email": "sharmawomensdelhi@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 504, "doctorName": "Dr. Neha Jain", "clinicName": "Jain Gynae & Maternity", "specialty": "Gynecology", "city": "Jaipur", "email": "jaingynaejaipur@gmail.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 505, "doctorName": "Dr. Sneha Joshi", "clinicName": "Joshi Women's Care Clinic", "specialty": "Gynecology", "city": "Pune", "email": "joshiwomenscarepune@gmail.com", "campaign": "campaign_e_receptionist_dilemma"}
]

print(f"Loaded {len(FRESH_105_PROSPECTS)} fresh prospects. Pre-validating MX DNS...")

# Filter MX
validated_queue = []
for lead in FRESH_105_PROSPECTS:
    email_clean = lead['email'].strip().lower()
    domain = email_clean.split('@')[-1]
    has_mx, mx_hosts = check_domain_mx(domain)
    if has_mx:
        validated_queue.append(lead)
    else:
        print(f"[REJECTED] {lead['clinicName']} ({domain}) -> No MX found")

print(f"Total MX-Validated leads: {len(validated_queue)} / {len(FRESH_105_PROSPECTS)}")

# Load Send Log
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
print("STARTING 100+ FRESH EXPERIMENT DISPATCH VIA BREVO")
print(f"Target Queue: {len(validated_queue)} Verified Clinics")
print(f"Sender: Sankalp Mishra <{brevo_sender}>")
print("==================================================\n")

for lead in validated_queue:
    email_clean = lead['email'].strip().lower()
    doc_name = lead['doctorName'].strip()
    if not doc_name.startswith("Dr.") and not doc_name.startswith("Dr "):
        doc_name = f"Dr. {doc_name}"

    if email_clean in already_sent or email_clean in opt_outs:
        skipped_count += 1
        continue

    campaign_tag = lead['campaign']
    website_url = f"https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign={campaign_tag}"

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
print("100+ FRESH EXPERIMENT DISPATCH COMPLETE")
print(f"Successfully Sent: {sent_count}")
print(f"Failed: {failed_count}")
print(f"Skipped / Duplicate: {skipped_count}")
print(f"Total Cumulative Inboxes in Log: {len(send_logs)}")
print("==================================================")
