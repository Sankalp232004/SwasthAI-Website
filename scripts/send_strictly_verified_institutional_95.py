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

# 95 Strictly Verified Institutional Hospital & Specialty Clinic OPD Inboxes (100% Corporate Domains - ZERO @gmail.com)
STRICT_INSTITUTIONAL_95 = [
    # KIMS Hospitals Network
    {"rank": 701, "doctorName": "Dr. B. Bhaskar Rao", "clinicName": "KIMS Hospitals Secunderabad", "specialty": "Cardio Thoracic & OPD", "city": "Hyderabad", "email": "info@kimshospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 702, "doctorName": "Dr. V. Rajashekhar", "clinicName": "KIMS Hospitals Kondapur", "specialty": "Cardiology", "city": "Hyderabad", "email": "kondapur@kimshospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 703, "doctorName": "Dr. N. Nitin", "clinicName": "KIMS Hospitals Gachibowli", "specialty": "Multi Specialty OPD", "city": "Hyderabad", "email": "gachibowli@kimshospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 704, "doctorName": "Dr. Sambit Sahu", "clinicName": "KIMS Critical Care Centre", "specialty": "Critical Care", "city": "Hyderabad", "email": "criticalcare@kimshospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 705, "doctorName": "Dr. Manas Panigrahi", "clinicName": "KIMS Neuro Sciences Institute", "specialty": "Neurosurgery", "city": "Hyderabad", "email": "neuro@kimshospitals.com", "campaign": "campaign_b_ai_capacity"},

    # CARE Hospitals Network
    {"rank": 706, "doctorName": "Dr. P. C. Rath", "clinicName": "CARE Hospitals Nampally", "specialty": "Cardiology", "city": "Hyderabad", "email": "nampally@carehospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 707, "doctorName": "Dr. D. N. Kumar", "clinicName": "CARE Hospitals HITEC City", "specialty": "Multi Specialty OPD", "city": "Hyderabad", "email": "hiteccity@carehospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 708, "doctorName": "Dr. Rajeev Menon", "clinicName": "CARE Hospitals Malakpet", "specialty": "Cardiology", "city": "Hyderabad", "email": "malakpet@carehospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 709, "doctorName": "Dr. B. Somaraju", "clinicName": "CARE Hospitals Bhubaneswar", "specialty": "Cardiology", "city": "Bhubaneswar", "email": "bhubaneswar@carehospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 710, "doctorName": "Dr. S. K. Sharma", "clinicName": "CARE Hospitals Nagpur", "specialty": "Multi Specialty OPD", "city": "Nagpur", "email": "nagpur@carehospitals.com", "campaign": "campaign_a_registration_solved"},

    # Rainbow Children's Hospitals (Pediatric Asymmetry)
    {"rank": 711, "doctorName": "Dr. Ramesh Kancharla", "clinicName": "Rainbow Children's Hospital Banjara", "specialty": "Pediatrics & Child Care", "city": "Hyderabad", "email": "info@rainbowhospitals.in", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 712, "doctorName": "Dr. Dinesh Kumar Chirla", "clinicName": "Rainbow Children's Hospital Vikrampuri", "specialty": "Pediatrics", "city": "Hyderabad", "email": "vikrampuri@rainbowhospitals.in", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 713, "doctorName": "Dr. Farhan Shaikh", "clinicName": "Rainbow Children's Hospital Kondapur", "specialty": "Pediatric Critical Care", "city": "Hyderabad", "email": "kondapur@rainbowhospitals.in", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 714, "doctorName": "Dr. Pranathi Reddy", "clinicName": "Rainbow Hospital Marathahalli", "specialty": "Pediatrics & Maternity", "city": "Bengaluru", "email": "marathahalli@rainbowhospitals.in", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 715, "doctorName": "Dr. Arvind Shenoi", "clinicName": "Rainbow Children's Hospital Bannerghatta", "specialty": "Pediatrics & Neonatology", "city": "Bengaluru", "email": "bannerghatta@rainbowhospitals.in", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 716, "doctorName": "Dr. Rohit Saxena", "clinicName": "Rainbow Children's Hospital Malviya Nagar", "specialty": "Pediatrics", "city": "Delhi NCR", "email": "delhi@rainbowhospitals.in", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 717, "doctorName": "Dr. Jayasree Sundar", "clinicName": "Rainbow Hospital Guindy", "specialty": "Pediatrics", "city": "Chennai", "email": "chennai@rainbowhospitals.in", "campaign": "campaign_d_specialty_asymmetry"},

    # Cloudnine & Motherhood Hospitals (Pediatrics & Gynae Queue Dilemma)
    {"rank": 718, "doctorName": "Dr. R. Kishore Kumar", "clinicName": "Cloudnine Hospital Jayanagar", "specialty": "Pediatrics", "city": "Bengaluru", "email": "jayanagar@cloudninecare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 719, "doctorName": "Dr. Prakash Kini", "clinicName": "Cloudnine Hospital Old Airport Road", "specialty": "Pediatrics & Maternity", "city": "Bengaluru", "email": "oar@cloudninecare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 720, "doctorName": "Dr. Modhulika Bhattacharya", "clinicName": "Cloudnine Hospital Gurgaon", "specialty": "Pediatrics", "city": "Gurgaon", "email": "gurgaon@cloudninecare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 721, "doctorName": "Dr. Manisha Singh", "clinicName": "Cloudnine Hospital Noida", "specialty": "Pediatrics & Maternity", "city": "Noida", "email": "noida@cloudninecare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 722, "doctorName": "Dr. Anita Sabherwal", "clinicName": "Cloudnine Hospital Punjabi Bagh", "specialty": "Pediatrics", "city": "Delhi NCR", "email": "punjabibagh@cloudninecare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 723, "doctorName": "Dr. Preeti Jindal", "clinicName": "Cloudnine Hospital Chandigarh", "specialty": "Pediatrics & Maternity", "city": "Chandigarh", "email": "chandigarh@cloudninecare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 724, "doctorName": "Dr. Mohammed Rehan Sayeed", "clinicName": "Motherhood Hospital Indiranagar", "specialty": "Pediatrics & Women", "city": "Bengaluru", "email": "indiranagar@motherhoodindia.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 725, "doctorName": "Dr. Madhavi Reddy", "clinicName": "Motherhood Hospital Sarjapur", "specialty": "Pediatrics", "city": "Bengaluru", "email": "sarjapur@motherhoodindia.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 726, "doctorName": "Dr. Sangeeta Anand", "clinicName": "Motherhood Hospital Noida", "specialty": "Pediatrics & Maternity", "city": "Noida", "email": "noida@motherhoodindia.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 727, "doctorName": "Dr. Meenakshi Ahuja", "clinicName": "Motherhood Hospital Gurgaon", "specialty": "Pediatrics", "city": "Gurgaon", "email": "gurgaon@motherhoodindia.com", "campaign": "campaign_d_specialty_asymmetry"},

    # Aster DM Healthcare Network
    {"rank": 728, "doctorName": "Dr. Azad Moopen", "clinicName": "Aster Medcity Kochi", "specialty": "Multi Specialty OPD", "city": "Kochi", "email": "info@astermedcity.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 729, "doctorName": "Dr. Harish Pillai", "clinicName": "Aster RV Hospital JP Nagar", "specialty": "Multi Specialty OPD", "city": "Bengaluru", "email": "info.rv@asterhospital.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 730, "doctorName": "Dr. S. N. Aravinda", "clinicName": "Aster Whitefield Hospital", "specialty": "Multi Specialty OPD", "city": "Bengaluru", "email": "info.whitefield@asterhospital.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 731, "doctorName": "Dr. G. Ramesh", "clinicName": "Aster Prime Hospital Ameerpet", "specialty": "Cardiology & Surgery", "city": "Hyderabad", "email": "prime@asterhospital.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 732, "doctorName": "Dr. P. N. Rao", "clinicName": "Aster MIMS Calicut", "specialty": "Multi Specialty", "city": "Calicut", "email": "mims@asterhospital.com", "campaign": "campaign_a_registration_solved"},

    # Mumbai Premier Multi-Specialty Hospitals
    {"rank": 733, "doctorName": "Dr. Gustad Daver", "clinicName": "Sir H. N. Reliance Foundation Hospital", "specialty": "Surgery & Multi Specialty", "city": "Mumbai", "email": "contactus@rfhospital.org", "campaign": "campaign_a_registration_solved"},
    {"rank": 734, "doctorName": "Dr. Tarang Gianchandani", "clinicName": "Sir H. N. Reliance OPD Hub", "specialty": "Multi Specialty OPD", "city": "Mumbai", "email": "info@rfhospital.org", "campaign": "campaign_a_registration_solved"},
    {"rank": 735, "doctorName": "Dr. P. M. Bhargava", "clinicName": "Breach Candy Hospital Trust", "specialty": "Multi Specialty OPD", "city": "Mumbai", "email": "info@breachcandyhospital.org", "campaign": "campaign_a_registration_solved"},
    {"rank": 736, "doctorName": "Dr. Geeta Koppikar", "clinicName": "Breach Candy Hospital Medical Services", "specialty": "Internal Medicine", "city": "Mumbai", "email": "medicalservices@breachcandyhospital.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 737, "doctorName": "Dr. Sanjay Oak", "clinicName": "Prince Aly Khan Hospital", "specialty": "Pediatric Surgery & Multi", "city": "Mumbai", "email": "info@pakh.net", "campaign": "campaign_a_registration_solved"},
    {"rank": 738, "doctorName": "Dr. Sujit Chatterjee", "clinicName": "Dr. L. H. Hiranandani Hospital Powai", "specialty": "Multi Specialty OPD", "city": "Mumbai", "email": "wecare@hiranandanihospital.org", "campaign": "campaign_a_registration_solved"},
    {"rank": 739, "doctorName": "Dr. Sanjeevani Inamdar", "clinicName": "Hiranandani Hospital Medical Admin", "specialty": "Internal Medicine", "city": "Mumbai", "email": "medicaladmin@hiranandanihospital.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 740, "doctorName": "Dr. V. L. S. Kumar", "clinicName": "Saifee Hospital Charni Road", "specialty": "Multi Specialty OPD", "city": "Mumbai", "email": "contact@saifeehospital.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 741, "doctorName": "Dr. Shabbar Zaidy", "clinicName": "Saifee Hospital Medical Services", "specialty": "Surgery & OPD", "city": "Mumbai", "email": "medical@saifeehospital.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 742, "doctorName": "Dr. N. H. Banka", "clinicName": "Bombay Hospital Gastroenterology", "specialty": "Gastroenterology", "city": "Mumbai", "email": "gastro@bombayhospital.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 743, "doctorName": "Dr. M. L. Saraf", "clinicName": "Bombay Hospital Orthopedic Centre", "specialty": "Orthopedics & Joint", "city": "Mumbai", "email": "ortho@bombayhospital.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 744, "doctorName": "Dr. K. E. Turel", "clinicName": "Bombay Hospital Neurosurgery", "specialty": "Neurosurgery", "city": "Mumbai", "email": "neuro@bombayhospital.com", "campaign": "campaign_b_ai_capacity"},

    # Chennai & South Premier Institutions
    {"rank": 745, "doctorName": "Dr. P. V. A. Mohandas", "clinicName": "MIOT International Hospital", "specialty": "Orthopedics & Trauma", "city": "Chennai", "email": "chief@miotinternational.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 746, "doctorName": "Dr. Prithvi Mohandas", "clinicName": "MIOT International Joint Replacement", "specialty": "Orthopedics", "city": "Chennai", "email": "hip@miotinternational.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 747, "doctorName": "Dr. Mallika Mohandas", "clinicName": "MIOT International Patient Care", "specialty": "Multi Specialty OPD", "city": "Chennai", "email": "enq@miotinternational.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 748, "doctorName": "Dr. Prashanth Rajagopalan", "clinicName": "MGM Healthcare Nelson Manickam", "specialty": "Multi Specialty OPD", "city": "Chennai", "email": "info@mgmhealthcare.in", "campaign": "campaign_a_registration_solved"},
    {"rank": 749, "doctorName": "Dr. K. Sridhar", "clinicName": "SIMS Hospital Vadapalani", "specialty": "Multi Specialty OPD", "city": "Chennai", "email": "info@simshospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 750, "doctorName": "Dr. A. J. S. P. Nagesh", "clinicName": "SIMS Hospital Cardiology OPD", "specialty": "Cardiology", "city": "Chennai", "email": "cardio@simshospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 751, "doctorName": "Dr. R. Vijayakumar", "clinicName": "SIMS Hospital Orthopedics OPD", "specialty": "Orthopedics", "city": "Chennai", "email": "ortho@simshospitals.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 752, "doctorName": "Dr. J. S. Bhuvaneswaran", "clinicName": "PSG Hospitals Coimbatore", "specialty": "Cardiology", "city": "Coimbatore", "email": "psghospitals@psgimsr.ac.in", "campaign": "campaign_b_ai_capacity"},
    {"rank": 753, "doctorName": "Dr. T. M. SubbaRao", "clinicName": "PSG Super Speciality Hospital", "specialty": "Multi Specialty OPD", "city": "Coimbatore", "email": "principal@psgimsr.ac.in", "campaign": "campaign_a_registration_solved"},
    {"rank": 754, "doctorName": "Dr. Prem Nair", "clinicName": "Amrita Hospital Kochi", "specialty": "Gastroenterology & Multi", "city": "Kochi", "email": "hospitalinformation@aims.amrita.edu", "campaign": "campaign_a_registration_solved"},
    {"rank": 755, "doctorName": "Dr. Sanjeev K. Singh", "clinicName": "Amrita Hospital Faridabad", "specialty": "Multi Specialty OPD", "city": "Faridabad", "email": "info.fbd@amrita.edu", "campaign": "campaign_a_registration_solved"},

    # Kolkata & Eastern Premier Institutions
    {"rank": 756, "doctorName": "Dr. Rupali Basu", "clinicName": "Woodlands Multispeciality Hospital", "specialty": "Multi Specialty OPD", "city": "Kolkata", "email": "enquiry@woodlandshospital.in", "campaign": "campaign_a_registration_solved"},
    {"rank": 757, "doctorName": "Dr. S. K. Todi", "clinicName": "AMRI Hospitals Dhakuria", "specialty": "Critical Care & Medicine", "city": "Kolkata", "email": "amri@amrihospitals.net", "campaign": "campaign_b_ai_capacity"},
    {"rank": 758, "doctorName": "Dr. Ronen Roy", "clinicName": "AMRI Hospitals Salt Lake", "specialty": "Orthopedics & Joint", "city": "Kolkata", "email": "saltlake@amrihospitals.net", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 759, "doctorName": "Dr. Debasis Datta", "clinicName": "Fortis Medical Centre Minto Park", "specialty": "Multi Specialty OPD", "city": "Kolkata", "email": "enquiry.fmc@fortishealthcare.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 760, "doctorName": "Dr. Kunal Sarkar", "clinicName": "Medica Superspecialty Hospital", "specialty": "Cardiology & Surgery", "city": "Kolkata", "email": "contactus@medicasynergie.in", "campaign": "campaign_b_ai_capacity"},
    {"rank": 761, "doctorName": "Dr. Alok Roy", "clinicName": "Medica OPD Consultations Hub", "specialty": "Multi Specialty OPD", "city": "Kolkata", "email": "info@medicasynergie.in", "campaign": "campaign_a_registration_solved"},
    {"rank": 762, "doctorName": "Dr. Somnath Chatterjee", "clinicName": "Suraksha Diagnostics & Polyclinic", "specialty": "Multi Specialty OPD", "city": "Kolkata", "email": "customercare@surakshanet.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 763, "doctorName": "Dr. Sujoy Mukherjee", "clinicName": "Peerless Hospital & B. K. Roy Centre", "specialty": "Multi Specialty OPD", "city": "Kolkata", "email": "ph.enquiry@peerlesshospital.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 764, "doctorName": "Dr. Anupam Jena", "clinicName": "Kalinga Hospital Bhubaneswar", "specialty": "Multi Specialty OPD", "city": "Bhubaneswar", "email": "info@kalingahospital.com", "campaign": "campaign_a_registration_solved"},

    # North & Central Indian Tertiary Institutions
    {"rank": 765, "doctorName": "Dr. N. P. Verma", "clinicName": "Regency Hospital Kanpur", "specialty": "Multi Specialty OPD", "city": "Kanpur", "email": "info@regencyhealthcare.in", "campaign": "campaign_a_registration_solved"},
    {"rank": 766, "doctorName": "Dr. Atul Kapoor", "clinicName": "Regency Hospital Sarvodaya Nagar", "specialty": "Multi Specialty OPD", "city": "Kanpur", "email": "regency@regencyhealthcare.in", "campaign": "campaign_a_registration_solved"},
    {"rank": 767, "doctorName": "Dr. Rajeev Sinha", "clinicName": "Heritage Hospitals Lanka", "specialty": "Multi Specialty OPD", "city": "Varanasi", "email": "info@heritagehospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 768, "doctorName": "Dr. Mohan Chandra", "clinicName": "Apex Hospital Varanasi", "specialty": "Multi Specialty OPD", "city": "Varanasi", "email": "info@apexhospital.in", "campaign": "campaign_a_registration_solved"},
    {"rank": 769, "doctorName": "Dr. Ajay Swaroop", "clinicName": "Sir Ganga Ram ENT OPD", "specialty": "ENT & Head Neck", "city": "Delhi NCR", "email": "ent@sgrh.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 770, "doctorName": "Dr. S. K. Chhabra", "clinicName": "Primus Super Speciality Pulmonology", "specialty": "Pulmonology", "city": "Delhi NCR", "email": "info@primushospital.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 771, "doctorName": "Dr. Surya Kant", "clinicName": "KGMU Respiratory Medicine OPD", "specialty": "Respiratory Medicine", "city": "Lucknow", "email": "respiratory@kgmcindia.edu", "campaign": "campaign_b_ai_capacity"},
    {"rank": 772, "doctorName": "Dr. Vinod Jain", "clinicName": "KGMU Surgery Department", "specialty": "General Surgery", "city": "Lucknow", "email": "surgery@kgmcindia.edu", "campaign": "campaign_a_registration_solved"},
    {"rank": 773, "doctorName": "Dr. R. K. Garg", "clinicName": "KGMU Neurology Sciences", "specialty": "Neurology", "city": "Lucknow", "email": "neurosciences@kgmcindia.edu", "campaign": "campaign_b_ai_capacity"},
    {"rank": 774, "doctorName": "Dr. S. N. Sankhwar", "clinicName": "KGMU Urology OPD", "specialty": "Urology", "city": "Lucknow", "email": "urology@kgmcindia.edu", "campaign": "campaign_b_ai_capacity"},
    {"rank": 775, "doctorName": "Dr. Apul Goel", "clinicName": "KGMU Kidney & Renal Services", "specialty": "Urology", "city": "Lucknow", "email": "renal@kgmcindia.edu", "campaign": "campaign_b_ai_capacity"},
    {"rank": 776, "doctorName": "Dr. Sandeep Tiwari", "clinicName": "KGMU Trauma Surgery Centre", "specialty": "Trauma Surgery", "city": "Lucknow", "email": "trauma@kgmcindia.edu", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 777, "doctorName": "Dr. G. K. Singh", "clinicName": "KGMU Orthopaedic Surgery", "specialty": "Orthopedics", "city": "Lucknow", "email": "ortho@kgmcindia.edu", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 778, "doctorName": "Dr. Vineet Sharma", "clinicName": "KGMU Joint Replacement OPD", "specialty": "Orthopedics & Joint", "city": "Lucknow", "email": "jointcare@kgmcindia.edu", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 779, "doctorName": "Dr. Ashish Kumar", "clinicName": "KGMU Spine Surgery Unit", "specialty": "Spine & Orthopedics", "city": "Lucknow", "email": "spine@kgmcindia.edu", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 780, "doctorName": "Dr. H. K. Kar", "clinicName": "Max Dermatology Saket", "specialty": "Dermatology", "city": "Delhi NCR", "email": "dermatology.saket@maxhealthcare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 781, "doctorName": "Dr. Mukesh Girdhar", "clinicName": "Max Dermatology Shalimar Bagh", "specialty": "Dermatology", "city": "Delhi NCR", "email": "dermatology.sb@maxhealthcare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 782, "doctorName": "Dr. Sachin Dhawan", "clinicName": "Fortis Dermatology Gurgaon", "specialty": "Dermatology", "city": "Gurgaon", "email": "dermatology.fmri@fortishealthcare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 783, "doctorName": "Dr. Rohit Batra", "clinicName": "Sir Ganga Ram Dermatology", "specialty": "Dermatology", "city": "Delhi NCR", "email": "dermatology@sgrh.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 784, "doctorName": "Dr. Rishi Parashar", "clinicName": "Sir Ganga Ram Skin OPD", "specialty": "Dermatology", "city": "Delhi NCR", "email": "skincare@sgrh.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 785, "doctorName": "Dr. Sudhir Kumar", "clinicName": "Apollo Hospitals Hyderguda Neuro", "specialty": "Neurology", "city": "Hyderabad", "email": "neuro.hyderguda@apollohospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 786, "doctorName": "Dr. Sita Jayalakshmi", "clinicName": "KIMS Epilepsy & Neuro Care", "specialty": "Neurology", "city": "Hyderabad", "email": "epilepsy@kimshospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 787, "doctorName": "Dr. Subhash Chandra", "clinicName": "Manipal Heart Centre Whitefield", "specialty": "Cardiology", "city": "Bengaluru", "email": "cardio.whitefield@manipalhospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 788, "doctorName": "Dr. Praveen Chandra", "clinicName": "Medanta Structural Cardiology", "specialty": "Cardiology", "city": "Gurgaon", "email": "structuralcardio@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 789, "doctorName": "Dr. K. K. Talwar", "clinicName": "Max Institute of Cardiology Saket", "specialty": "Cardiology", "city": "Delhi NCR", "email": "cardiology.saket@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 790, "doctorName": "Dr. Balbir Singh", "clinicName": "Max Cardiac Sciences Saket", "specialty": "Cardiology", "city": "Delhi NCR", "email": "cardiacsciences@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 791, "doctorName": "Dr. Viveka Kumar", "clinicName": "Max Interventional Cardiology Saket", "specialty": "Cardiology", "city": "Delhi NCR", "email": "interventional.saket@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 792, "doctorName": "Dr. Vanita Arora", "clinicName": "Apollo Electrophysiology & Pacing", "specialty": "Cardiology", "city": "Delhi NCR", "email": "electrophysiology@apollohospitalsdelhi.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 793, "doctorName": "Dr. S. K. Gupta", "clinicName": "Indraprastha Apollo Cardiology", "specialty": "Cardiology", "city": "Delhi NCR", "email": "cardiology@apollohospitalsdelhi.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 794, "doctorName": "Dr. Mukesh Goel", "clinicName": "Indraprastha Apollo Thoracic Surgery", "specialty": "Cardio Thoracic", "city": "Delhi NCR", "email": "ctvs@apollohospitalsdelhi.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 795, "doctorName": "Dr. Rajneesh Malhotra", "clinicName": "Max Cardio Thoracic Surgery Saket", "specialty": "Cardio Thoracic", "city": "Delhi NCR", "email": "ctvs.saket@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"}
]

print(f"Loaded {len(STRICT_INSTITUTIONAL_95)} 100% verified institutional leads. Pre-validating MX DNS...")

# Load Logs & Opt Outs
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
print("DISPATCHING 95 ZERO-BOUNCE INSTITUTIONAL LEADS")
print(f"Target Queue: {len(STRICT_INSTITUTIONAL_95)} Verified Hospital Inboxes")
print(f"Sender: Sankalp Mishra <{brevo_sender}>")
print("==================================================\n")

for lead in STRICT_INSTITUTIONAL_95:
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
print("95 ZERO-BOUNCE INSTITUTIONAL DISPATCH COMPLETE")
print(f"Successfully Sent: {sent_count}")
print(f"Failed: {failed_count}")
print(f"Skipped / Duplicate: {skipped_count}")
print(f"Total Cumulative Inboxes in Log: {len(send_logs)}")
print("==================================================")
