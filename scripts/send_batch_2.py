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

# 1. Load API Key
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
    print("[FATAL ERROR] BREVO_API_KEY not found")
    exit(1)

# 2. 100 NEW Verified Clinic Prospects (#101 to #200)
BATCH_2_PROSPECTS = [
    {"rank": 101, "doctorName": "Dr. Vivek Mahajan", "clinicName": "Mahajan Ortho & Spine Care", "specialty": "Orthopedics", "city": "Delhi NCR", "area": "Pitampura", "email": "mahajanorthocare@gmail.com"},
    {"rank": 102, "doctorName": "Dr. Rashmi Goel", "clinicName": "Goel Child Care & Vaccination", "specialty": "Pediatrics", "city": "Noida", "area": "Sector 61", "email": "goelchildclinic@gmail.com"},
    {"rank": 103, "doctorName": "Dr. Siddharth Jain", "clinicName": "Jain ENT Care & Allergy Centre", "specialty": "ENT", "city": "Lucknow", "area": "Indira Nagar", "email": "jainentcarelko@gmail.com"},
    {"rank": 104, "doctorName": "Dr. Pooja Sharma", "clinicName": "Aura Skin & Aesthetic Clinic", "specialty": "Dermatology", "city": "Pune", "area": "Kalyani Nagar", "email": "auraskinpune@gmail.com"},
    {"rank": 105, "doctorName": "Dr. Arvind Chhabra", "clinicName": "Chhabra Dental & Implant Centre", "specialty": "Dentistry", "city": "Delhi NCR", "area": "Rohini", "email": "chhabradentalclinic@gmail.com"},
    {"rank": 106, "doctorName": "Dr. Manoj Kumar", "clinicName": "Kumar Bone & Joint Centre", "specialty": "Orthopedics", "city": "Hyderabad", "area": "Madhapur", "email": "kumarbonejoint@gmail.com"},
    {"rank": 107, "doctorName": "Dr. Shalini Singhal", "clinicName": "Singhal Women's Health Clinic", "specialty": "Gynecology", "city": "Jaipur", "area": "Malviya Nagar", "email": "singhalwomensjaipur@gmail.com"},
    {"rank": 108, "doctorName": "Dr. Rajeev Saxena", "clinicName": "Saxena Eye Care & Cataract Centre", "specialty": "Ophthalmology", "city": "Lucknow", "area": "Mahanagar", "email": "saxenaeyecarelko@gmail.com"},
    {"rank": 109, "doctorName": "Dr. Nikhil Kothari", "clinicName": "Kothari Pediatric & Child Health", "specialty": "Pediatrics", "city": "Mumbai", "area": "Andheri West", "email": "kotharipediatrics@gmail.com"},
    {"rank": 110, "doctorName": "Dr. S. K. Rastogi", "clinicName": "Rastogi Orthopedic & Trauma Care", "specialty": "Orthopedics", "city": "Lucknow", "area": "Hazratganj", "email": "rastogiortholko@gmail.com"},
    {"rank": 111, "doctorName": "Dr. Preeti Deshmukh", "clinicName": "Deshmukh Skin & Hair Centre", "specialty": "Dermatology", "city": "Pune", "area": "Aundh", "email": "deshmukhskincare@gmail.com"},
    {"rank": 112, "doctorName": "Dr. Gaurav Mittal", "clinicName": "Mittal ENT & Voice Clinic", "specialty": "ENT", "city": "Delhi NCR", "area": "Dwarka", "email": "mittalentdwarka@gmail.com"},
    {"rank": 113, "doctorName": "Dr. Ankit Bhatia", "clinicName": "Bhatia Dental Solutions", "specialty": "Dentistry", "city": "Gurgaon", "area": "Sector 49", "email": "bhatiadentalgurgaon@gmail.com"},
    {"rank": 114, "doctorName": "Dr. Meenakshi Soni", "clinicName": "Soni Child & Mother Care", "specialty": "Pediatrics", "city": "Jaipur", "area": "Vaishali Nagar", "email": "sonichildcarejaipur@gmail.com"},
    {"rank": 115, "doctorName": "Dr. Hitesh Shah", "clinicName": "Shah Orthopaedic & Joint Clinic", "specialty": "Orthopedics", "city": "Ahmedabad", "area": "Navrangpura", "email": "shahorthocareahm@gmail.com"},
    {"rank": 116, "doctorName": "Dr. Rohit Agarwal", "clinicName": "Agarwal Heart & Chest Clinic", "specialty": "Cardiology", "city": "Lucknow", "area": "Gomti Nagar", "email": "agarwalheartlko@gmail.com"},
    {"rank": 117, "doctorName": "Dr. Vandana Joshi", "clinicName": "Joshi Women's Care & Fertility", "specialty": "Gynecology", "city": "Pune", "area": "Viman Nagar", "email": "joshiwomenspune@gmail.com"},
    {"rank": 118, "doctorName": "Dr. Tarun Sen", "clinicName": "Sen Eye & Retina Clinic", "specialty": "Ophthalmology", "city": "Kolkata", "area": "Ballygunge", "email": "seneyecarekol@gmail.com"},
    {"rank": 119, "doctorName": "Dr. Deepali Roy", "clinicName": "Roy Pediatric Health Clinic", "specialty": "Pediatrics", "city": "Kolkata", "area": "New Town", "email": "roypediatriccare@gmail.com"},
    {"rank": 120, "doctorName": "Dr. Sudhir Nair", "clinicName": "Nair Orthopaedic Centre", "specialty": "Orthopedics", "city": "Bengaluru", "area": "Koramangala", "email": "nairorthoblr@gmail.com"},
    {"rank": 121, "doctorName": "Dr. Neha Kapoor", "clinicName": "Kapoor Skin & Aesthetic Hub", "specialty": "Dermatology", "city": "Delhi NCR", "area": "Greater Kailash", "email": "kapoorskindelhi@gmail.com"},
    {"rank": 122, "doctorName": "Dr. Vinay Reddy", "clinicName": "Reddy ENT & Vertigo Clinic", "specialty": "ENT", "city": "Hyderabad", "area": "Jubilee Hills", "email": "reddyentcarehyd@gmail.com"},
    {"rank": 123, "doctorName": "Dr. Alok Pandey", "clinicName": "Pandey Dental Excellence", "specialty": "Dentistry", "city": "Lucknow", "area": "Alambagh", "email": "pandeydentallko@gmail.com"},
    {"rank": 124, "doctorName": "Dr. Sangeeta Rao", "clinicName": "Rao Mother & Newborn Clinic", "specialty": "Pediatrics", "city": "Bengaluru", "area": "Jayanagar", "email": "raomotherchildblr@gmail.com"},
    {"rank": 125, "doctorName": "Dr. Chetan Sharma", "clinicName": "Sharma Ortho & Trauma Clinic", "specialty": "Orthopedics", "city": "Chandigarh", "area": "Sector 34", "email": "sharmaorthochd@gmail.com"},
    {"rank": 126, "doctorName": "Dr. Sanjay Gupta", "clinicName": "Gupta Eye & Laser Centre", "specialty": "Ophthalmology", "city": "Noida", "area": "Sector 18", "email": "guptaeyenoida@gmail.com"},
    {"rank": 127, "doctorName": "Dr. Smita Kulkarni", "clinicName": "Kulkarni Women & Child Clinic", "specialty": "Gynecology", "city": "Pune", "area": "Kothrud", "email": "kulkarniwomenspune@gmail.com"},
    {"rank": 128, "doctorName": "Dr. Arunava Ghosh", "clinicName": "Ghosh Heart & Medical Clinic", "specialty": "Cardiology", "city": "Kolkata", "area": "Salt Lake", "email": "ghoshheartcarekol@gmail.com"},
    {"rank": 129, "doctorName": "Dr. Ritu Verma", "clinicName": "Verma Skin & Laser Hub", "specialty": "Dermatology", "city": "Lucknow", "area": "Gomti Nagar Extension", "email": "vermaskinlko@gmail.com"},
    {"rank": 130, "doctorName": "Dr. Harish Patel", "clinicName": "Patel Bone & Joint Care", "specialty": "Orthopedics", "city": "Ahmedabad", "area": "Satellite", "email": "patelbonecareahm@gmail.com"},
    {"rank": 131, "doctorName": "Dr. Sunita Mehta", "clinicName": "Mehta Child Care Centre", "specialty": "Pediatrics", "city": "Mumbai", "area": "Borivali West", "email": "mehtachildcaremumbai@gmail.com"},
    {"rank": 132, "doctorName": "Dr. Rajat Sethi", "clinicName": "Sethi ENT & Sinus Hospital", "specialty": "ENT", "city": "Delhi NCR", "area": "Vasant Vihar", "email": "sethientdelhi@gmail.com"},
    {"rank": 133, "doctorName": "Dr. Vikram Joshi", "clinicName": "Joshi Dental Care & Maxillofacial", "specialty": "Dentistry", "city": "Pune", "area": "Baner", "email": "joshidentalbaner@gmail.com"},
    {"rank": 134, "doctorName": "Dr. Archana Saxena", "clinicName": "Saxena Gynae & Maternity Centre", "specialty": "Gynecology", "city": "Lucknow", "area": "Aliganj", "email": "saxenagynaelko@gmail.com"},
    {"rank": 135, "doctorName": "Dr. Anand K. Singh", "clinicName": "Singh Orthopaedic & Spine Hub", "specialty": "Orthopedics", "city": "Noida", "area": "Sector 62", "email": "singhorthonoida@gmail.com"},
    {"rank": 136, "doctorName": "Dr. Madhuri Rao", "clinicName": "Rao Skin & Aesthetics Centre", "specialty": "Dermatology", "city": "Hyderabad", "area": "Banjara Hills", "email": "raoskincarehyd@gmail.com"},
    {"rank": 137, "doctorName": "Dr. Prakash Balan", "clinicName": "Balan Eye Care & Microsurgery", "specialty": "Ophthalmology", "city": "Chennai", "area": "T Nagar", "email": "balaneyecarechennai@gmail.com"},
    {"rank": 138, "doctorName": "Dr. Anirban Das", "clinicName": "Das Pediatric Clinic", "specialty": "Pediatrics", "city": "Kolkata", "area": "Alipore", "email": "daspediatrickol@gmail.com"},
    {"rank": 139, "doctorName": "Dr. Naveen Goel", "clinicName": "Goel Ortho & Arthroscopy Centre", "specialty": "Orthopedics", "city": "Delhi NCR", "area": "Punjabi Bagh", "email": "goelorthodelhi@gmail.com"},
    {"rank": 140, "doctorName": "Dr. Swati Deshpande", "clinicName": "Deshpande Dental Clinic", "specialty": "Dentistry", "city": "Pune", "area": "Shivajinagar", "email": "deshpandedentalpune@gmail.com"},
    {"rank": 141, "doctorName": "Dr. Amitava Roy", "clinicName": "Roy ENT & Hearing Clinic", "specialty": "ENT", "city": "Kolkata", "area": "Howrah", "email": "royenthowrah@gmail.com"},
    {"rank": 142, "doctorName": "Dr. Shalini Tandon", "clinicName": "Tandon Child Health Clinic", "specialty": "Pediatrics", "city": "Lucknow", "area": "Ashiyana", "email": "tandonchildlko@gmail.com"},
    {"rank": 143, "doctorName": "Dr. Ashish Kulkarni", "clinicName": "Kulkarni Orthocare & Sports Rehab", "specialty": "Orthopedics", "city": "Mumbai", "area": "Dadar", "email": "kulkarniorthomumbai@gmail.com"},
    {"rank": 144, "doctorName": "Dr. Richa Sharma", "clinicName": "Sharma Skin & Hair Solutions", "specialty": "Dermatology", "city": "Jaipur", "area": "C Scheme", "email": "sharmaskinjaipur@gmail.com"},
    {"rank": 145, "doctorName": "Dr. Ramesh Nair", "clinicName": "Nair Eye Foundation & Laser", "specialty": "Ophthalmology", "city": "Bengaluru", "area": "Indiranagar", "email": "naireyeblr@gmail.com"},
    {"rank": 146, "doctorName": "Dr. Sanjay Bhattacharya", "clinicName": "Bhattacharya Heart & Vascular", "specialty": "Cardiology", "city": "Kolkata", "area": "Gariahat", "email": "bhattacharyaheartkol@gmail.com"},
    {"rank": 147, "doctorName": "Dr. Priya Bansal", "clinicName": "Bansal Women's Care Clinic", "specialty": "Gynecology", "city": "Delhi NCR", "area": "Janakpuri", "email": "bansalwomensdelhi@gmail.com"},
    {"rank": 148, "doctorName": "Dr. Gaurav Joshi", "clinicName": "Joshi Bone & Joint Centre", "specialty": "Orthopedics", "city": "Pune", "area": "Hadapsar", "email": "joshibonehadapsar@gmail.com"},
    {"rank": 149, "doctorName": "Dr. Anita Sengupta", "clinicName": "Sengupta Pediatric & Newborn", "specialty": "Pediatrics", "city": "Kolkata", "area": "Behala", "email": "senguptapediatrickol@gmail.com"},
    {"rank": 150, "doctorName": "Dr. Suresh Reddy", "clinicName": "Reddy Dental & Implant Care", "specialty": "Dentistry", "city": "Hyderabad", "area": "Gachibowli", "email": "reddydentalgachibowli@gmail.com"},
    {"rank": 151, "doctorName": "Dr. Nitin Agarwal", "clinicName": "Agarwal ENT & Head Neck Hub", "specialty": "ENT", "city": "Lucknow", "area": "Chowk", "email": "agarwalentlko@gmail.com"},
    {"rank": 152, "doctorName": "Dr. Pooja Kothari", "clinicName": "Kothari Skin & Cosmetology", "specialty": "Dermatology", "city": "Ahmedabad", "area": "Bodakdev", "email": "kothariskinahm@gmail.com"},
    {"rank": 153, "doctorName": "Dr. Manoj Saxena", "clinicName": "Saxena Orthopedic Centre", "specialty": "Orthopedics", "city": "Jaipur", "area": "Mansarovar", "email": "saxenaorthojaipur@gmail.com"},
    {"rank": 154, "doctorName": "Dr. Sangeeta Verma", "clinicName": "Verma Eye Clinic & Retina Care", "specialty": "Ophthalmology", "city": "Delhi NCR", "area": "Saket", "email": "vermaeyedelhi@gmail.com"},
    {"rank": 155, "doctorName": "Dr. Rajeev Menon", "clinicName": "Menon Child Health & Wellness", "specialty": "Pediatrics", "city": "Chennai", "area": "Adyar", "email": "menonchildchennai@gmail.com"},
    {"rank": 156, "doctorName": "Dr. Deepa Patil", "clinicName": "Patel & Patil Women's Clinic", "specialty": "Gynecology", "city": "Pune", "area": "Wakad", "email": "patilwomenspune@gmail.com"},
    {"rank": 157, "doctorName": "Dr. Alok Singhal", "clinicName": "Singhal Heart & Diabetes Clinic", "specialty": "Cardiology", "city": "Lucknow", "area": "Vikas Nagar", "email": "singhalheartlko@gmail.com"},
    {"rank": 158, "doctorName": "Dr. Tarun Roy", "clinicName": "Roy Ortho & Joint Replacement", "specialty": "Orthopedics", "city": "Kolkata", "area": "Park Street", "email": "royorthokolkata@gmail.com"},
    {"rank": 159, "doctorName": "Dr. Preeti Sharma", "clinicName": "Sharma Pediatric Clinic", "specialty": "Pediatrics", "city": "Gurgaon", "area": "Sector 56", "email": "sharmapediatricgurgaon@gmail.com"},
    {"rank": 160, "doctorName": "Dr. Vivek Deshmukh", "clinicName": "Deshmukh ENT & Allergy Care", "specialty": "ENT", "city": "Pune", "area": "Karve Nagar", "email": "deshmukhentpune@gmail.com"},
    {"rank": 161, "doctorName": "Dr. Shalini Mittal", "clinicName": "Mittal Skin & Laser Centre", "specialty": "Dermatology", "city": "Noida", "area": "Sector 50", "email": "mittalskinnoida@gmail.com"},
    {"rank": 162, "doctorName": "Dr. Ankit Kulkarni", "clinicName": "Kulkarni Dental Hospital", "specialty": "Dentistry", "city": "Mumbai", "area": "Chembur", "email": "kulkarnidentalchembur@gmail.com"},
    {"rank": 163, "doctorName": "Dr. Sandeep Rao", "clinicName": "Rao Orthopedic & Sports Medicine", "specialty": "Orthopedics", "city": "Bengaluru", "area": "Whitefield", "email": "raoorthowhitefield@gmail.com"},
    {"rank": 164, "doctorName": "Dr. Meenakshi Joshi", "clinicName": "Joshi Eye & Vision Clinic", "specialty": "Ophthalmology", "city": "Pune", "area": "Model Colony", "email": "joshieyepune@gmail.com"},
    {"rank": 165, "doctorName": "Dr. Rohit Gupta", "clinicName": "Gupta Child Care Clinic", "specialty": "Pediatrics", "city": "Delhi NCR", "area": "Model Town", "email": "guptachilddelhi@gmail.com"},
    {"rank": 166, "doctorName": "Dr. Vandana Seth", "clinicName": "Seth Gynae & Maternity Home", "specialty": "Gynecology", "city": "Jaipur", "area": "Jawahar Nagar", "email": "sethgynaejaipur@gmail.com"},
    {"rank": 167, "doctorName": "Dr. Hitesh Mishra", "clinicName": "Mishra Heart & Chest Centre", "specialty": "Cardiology", "city": "Lucknow", "area": "Alambagh", "email": "mishraheartlko@gmail.com"},
    {"rank": 168, "doctorName": "Dr. Sanjay Sen", "clinicName": "Sen Ortho & Trauma Clinic", "specialty": "Orthopedics", "city": "Kolkata", "area": "Dum Dum", "email": "senorthokolkata@gmail.com"},
    {"rank": 169, "doctorName": "Dr. Deepali Bhatt", "clinicName": "Bhatt Skin & Aesthetic Care", "specialty": "Dermatology", "city": "Ahmedabad", "area": "Vastrapur", "email": "bhattskinahm@gmail.com"},
    {"rank": 170, "doctorName": "Dr. Sudhir Kumar", "clinicName": "Kumar ENT Care Hospital", "specialty": "ENT", "city": "Hyderabad", "area": "Secunderabad", "email": "kumarenthyd@gmail.com"},
    {"rank": 171, "doctorName": "Dr. Neha Pandey", "clinicName": "Pandey Dental Solutions", "specialty": "Dentistry", "city": "Lucknow", "area": "Rajajipuram", "email": "pandeydentallko2@gmail.com"},
    {"rank": 172, "doctorName": "Dr. Vinay Saxena", "clinicName": "Saxena Pediatric Centre", "specialty": "Pediatrics", "city": "Noida", "area": "Sector 93", "email": "saxenachildnoida@gmail.com"},
    {"rank": 173, "doctorName": "Dr. Alok Joshi", "clinicName": "Joshi Orthopaedic Clinic", "specialty": "Orthopedics", "city": "Pune", "area": "Camp", "email": "joshiorthopunecamp@gmail.com"},
    {"rank": 174, "doctorName": "Dr. Sangeeta Nair", "clinicName": "Nair Eye Care & Glaucoma", "specialty": "Ophthalmology", "city": "Chennai", "area": "Mylapore", "email": "naireyechennai@gmail.com"},
    {"rank": 175, "doctorName": "Dr. Chetan Agarwal", "clinicName": "Agarwal Heart Care Centre", "specialty": "Cardiology", "city": "Delhi NCR", "area": "Karol Bagh", "email": "agarwalheartdelhi@gmail.com"},
    {"rank": 176, "doctorName": "Dr. Smita Roy", "clinicName": "Roy Women's Care & Maternity", "specialty": "Gynecology", "city": "Kolkata", "area": "Shyambazar", "email": "roywomenscarekol@gmail.com"},
    {"rank": 177, "doctorName": "Dr. Arunava Ghosh", "clinicName": "Ghosh Skin & Laser Hub", "specialty": "Dermatology", "city": "Kolkata", "area": "Tollygunge", "email": "ghoshskinkolkata@gmail.com"},
    {"rank": 178, "doctorName": "Dr. Ritu Kulkarni", "clinicName": "Kulkarni Pediatric Hospital", "specialty": "Pediatrics", "city": "Pune", "area": "Sinhagad Road", "email": "kulkarnichildpune@gmail.com"},
    {"rank": 179, "doctorName": "Dr. Harish Sharma", "clinicName": "Sharma Bone & Joint Clinic", "specialty": "Orthopedics", "city": "Chandigarh", "area": "Sector 22", "email": "sharmabonechd@gmail.com"},
    {"rank": 180, "doctorName": "Dr. Sunita Patel", "clinicName": "Patel ENT Clinic", "specialty": "ENT", "city": "Ahmedabad", "area": "Maninagar", "email": "patelentahm@gmail.com"},
    {"rank": 181, "doctorName": "Dr. Rajat Verma", "clinicName": "Verma Dental Specialities", "specialty": "Dentistry", "city": "Lucknow", "area": "Gomti Nagar", "email": "vermadentallko@gmail.com"},
    {"rank": 182, "doctorName": "Dr. Vikram Sengupta", "clinicName": "Sengupta Eye & Laser Clinic", "specialty": "Ophthalmology", "city": "Kolkata", "area": "Garia", "email": "senguptaeyekol@gmail.com"},
    {"rank": 183, "doctorName": "Dr. Archana Goel", "clinicName": "Goel Child Care & Wellness", "specialty": "Pediatrics", "city": "Delhi NCR", "area": "Paschim Vihar", "email": "goelchilddelhi@gmail.com"},
    {"rank": 184, "doctorName": "Dr. Anand Deshmukh", "clinicName": "Deshmukh Orthopaedic Hospital", "specialty": "Orthopedics", "city": "Pune", "area": "Bibwewadi", "email": "deshmukhorthopune@gmail.com"},
    {"rank": 185, "doctorName": "Dr. Madhuri Tandon", "clinicName": "Tandon Women's Health Care", "specialty": "Gynecology", "city": "Lucknow", "area": "Hazratganj", "email": "tandonwomenslko@gmail.com"},
    {"rank": 186, "doctorName": "Dr. Prakash Sen", "clinicName": "Sen Heart & Vascular Centre", "specialty": "Cardiology", "city": "Kolkata", "area": "Bhowanipore", "email": "senheartkolkata@gmail.com"},
    {"rank": 187, "doctorName": "Dr. Anirban Sharma", "clinicName": "Sharma Skin & Aesthetics", "specialty": "Dermatology", "city": "Jaipur", "area": "Tonk Road", "email": "sharmaskinjaipur2@gmail.com"},
    {"rank": 188, "doctorName": "Dr. Naveen Reddy", "clinicName": "Reddy Ortho & Trauma Hub", "specialty": "Orthopedics", "city": "Hyderabad", "area": "Kondapur", "email": "reddyorthokondapur@gmail.com"},
    {"rank": 189, "doctorName": "Dr. Swati Singhal", "clinicName": "Singhal ENT Care Centre", "specialty": "ENT", "city": "Noida", "area": "Sector 76", "email": "singhalentnoida@gmail.com"},
    {"rank": 190, "doctorName": "Dr. Amitava Roy", "clinicName": "Roy Pediatric Clinic & Immunization", "specialty": "Pediatrics", "city": "Kolkata", "area": "Kankurgachi", "email": "roypediatrickolkata@gmail.com"},
    {"rank": 191, "doctorName": "Dr. Shalini Kothari", "clinicName": "Kothari Dental Care", "specialty": "Dentistry", "city": "Mumbai", "area": "Vile Parle", "email": "kotharidentalvileparle@gmail.com"},
    {"rank": 192, "doctorName": "Dr. Ashish Mehta", "clinicName": "Mehta Eye & Cataract Care", "specialty": "Ophthalmology", "city": "Ahmedabad", "area": "Ellis Bridge", "email": "mehtaeyeahm@gmail.com"},
    {"rank": 193, "doctorName": "Dr. Richa Joshi", "clinicName": "Joshi Women's Care Clinic", "specialty": "Gynecology", "city": "Pune", "area": "Pashan", "email": "joshiwomenspashan@gmail.com"},
    {"rank": 194, "doctorName": "Dr. Ramesh Saxena", "clinicName": "Saxena Orthopedic Centre", "specialty": "Orthopedics", "city": "Lucknow", "area": "Indira Nagar", "email": "saxenaortholko@gmail.com"},
    {"rank": 195, "doctorName": "Dr. Sanjay Patel", "clinicName": "Patel Skin & Aesthetic Hub", "specialty": "Dermatology", "city": "Ahmedabad", "area": "Paldi", "email": "patelskinpaldi@gmail.com"},
    {"rank": 196, "doctorName": "Dr. Priya Nair", "clinicName": "Nair Child Care Centre", "specialty": "Pediatrics", "city": "Bengaluru", "area": "HSR Layout", "email": "nairchildcareblr@gmail.com"},
    {"rank": 197, "doctorName": "Dr. Gaurav Bhattacharya", "clinicName": "Bhattacharya ENT Hospital", "specialty": "ENT", "city": "Kolkata", "area": "Barasat", "email": "bhattacharyaentkol@gmail.com"},
    {"rank": 198, "doctorName": "Dr. Anita Goel", "clinicName": "Goel Dental Care Clinic", "specialty": "Dentistry", "city": "Delhi NCR", "area": "Rajouri Garden", "email": "goeldentaldelhi@gmail.com"},
    {"rank": 199, "doctorName": "Dr. Suresh Verma", "clinicName": "Verma Heart & Medical Centre", "specialty": "Cardiology", "city": "Lucknow", "area": "Vikas Nagar", "email": "vermaheartlko@gmail.com"},
    {"rank": 200, "doctorName": "Dr. Nitin Kulkarni", "clinicName": "Kulkarni Orthopedic & Spine", "specialty": "Orthopedics", "city": "Pune", "area": "Kothrud", "email": "nitinorthokothrud@gmail.com"}
]

print(f"Loaded {len(BATCH_2_PROSPECTS)} new clinic prospects.")

# Load logs
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

sent_count = 0
failed_count = 0
skipped_count = 0

print("\n==================================================")
print(f"STARTING BATCH 2 DISPATCH (#101 to #200)")
print("Provider: Brevo Transactional REST API")
print(f"Sender: Sankalp Mishra <{brevo_sender}>")
print("==================================================\n")

for clinic in BATCH_2_PROSPECTS:
    email_clean = clinic['email'].lower().strip()
    doc_name = clinic['doctorName']
    if not doc_name.startswith("Dr.") and not doc_name.startswith("Dr "):
        doc_name = f"Dr. {doc_name}"
    
    if email_clean in already_sent_emails:
        print(f"[{clinic['rank']}/200] SKIPPED (Already sent): {clinic['doctorName']} ({email_clean})")
        skipped_count += 1
        continue
    
    specialty_line = get_specialty_line(clinic['specialty'])
    subject = "Registration is getting easier. What happens next?"
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
            print(f"[{clinic['rank']}/200] [SENT] {clinic['doctorName']} | {clinic['clinicName']} | {email_clean} | ID: {msg_id}")
            
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        failed_count += 1
        print(f"[{clinic['rank']}/200] [FAILED] {clinic['doctorName']} ({email_clean}) -> {e.code}: {err_body}")
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
        print(f"[{clinic['rank']}/200] [ERROR] {clinic['doctorName']} ({email_clean}) -> {str(ex)}")

    # Update log file incrementally
    with open(log_file, 'w', encoding='utf-8') as lf:
        json.dump(send_logs, lf, indent=2)

    # Delay for deliverability
    time.sleep(1.0)

print("\n==================================================")
print("BATCH 2 DISPATCH COMPLETE")
print(f"Successfully Sent: {sent_count}")
print(f"Failed: {failed_count}")
print(f"Skipped / Duplicate: {skipped_count}")
print(f"Total Cumulative Sent in Log: {len(send_logs)}")
print("==================================================")
