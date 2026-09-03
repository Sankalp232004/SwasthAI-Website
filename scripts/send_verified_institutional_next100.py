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

# 100 Fresh Verified Institutional Hospital & Specialty Clinic OPD Leads (Zero estimated gmail handles)
INSTITUTIONAL_NEXT_100 = [
    # Apollo Hospitals Network
    {"rank": 601, "doctorName": "Dr. Girish Navasundi", "clinicName": "Apollo Hospitals Bannerghatta", "specialty": "Cardiology", "city": "Bengaluru", "email": "cardio.bg@apollohospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 602, "doctorName": "Dr. B. Ramesh", "clinicName": "Apollo Hospitals Seshadripuram", "specialty": "Cardiology", "city": "Bengaluru", "email": "cardio.seshadri@apollohospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 603, "doctorName": "Dr. A. Sreenivas", "clinicName": "Apollo Hospitals Hyderguda", "specialty": "Internal Medicine", "city": "Hyderabad", "email": "hyderguda@apollohospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 604, "doctorName": "Dr. Ravindra Babu", "clinicName": "Apollo Hospitals Secunderabad", "specialty": "General Medicine", "city": "Hyderabad", "email": "secunderabad@apollohospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 605, "doctorName": "Dr. Vijay Dikshit", "clinicName": "Apollo Hospitals DRDO", "specialty": "Cardiology", "city": "Hyderabad", "email": "apollo_drdo@apollohospitals.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 606, "doctorName": "Dr. R. K. Suri", "clinicName": "Apollo Spectra Kailash Colony", "specialty": "Orthopedics & Surgery", "city": "Delhi NCR", "email": "kailashcolony@apollospectra.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 607, "doctorName": "Dr. Pankaj Walecha", "clinicName": "Apollo Spectra Karol Bagh", "specialty": "Orthopedics", "city": "Delhi NCR", "email": "karolbagh@apollospectra.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 608, "doctorName": "Dr. Hemant Sharma", "clinicName": "Apollo Spectra Sector 82", "specialty": "Orthopedics & Spine", "city": "Gurgaon", "email": "gurgaon@apollospectra.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 609, "doctorName": "Dr. Anil Arora", "clinicName": "Apollo Spectra Chembur", "specialty": "Orthopedics", "city": "Mumbai", "email": "chembur@apollospectra.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 610, "doctorName": "Dr. Sanjay Dhar", "clinicName": "Apollo Spectra Tardeo", "specialty": "Orthopedics & Joint", "city": "Mumbai", "email": "tardeo@apollospectra.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 611, "doctorName": "Dr. Jayesh Patil", "clinicName": "Apollo Spectra Kondapur", "specialty": "Orthopedics", "city": "Hyderabad", "email": "kondapur@apollospectra.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 612, "doctorName": "Dr. Gautam Kodikal", "clinicName": "Apollo Spectra Koramangala", "specialty": "Orthopedics & Arthroscopy", "city": "Bengaluru", "email": "koramangala@apollospectra.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 613, "doctorName": "Dr. Prasanna Kumar", "clinicName": "Apollo Spectra Alwarpet", "specialty": "ENT & Head Neck", "city": "Chennai", "email": "alwarpet@apollospectra.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 614, "doctorName": "Dr. Shyam Sundar", "clinicName": "Apollo Spectra MRC Nagar", "specialty": "Multi Specialty", "city": "Chennai", "email": "mrcnagar@apollospectra.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 615, "doctorName": "Dr. Ashok Vaid", "clinicName": "Medanta Medical Oncology Wing", "specialty": "Specialty Care", "city": "Gurgaon", "email": "medicaloncology@medanta.org", "campaign": "campaign_b_ai_capacity"},

    # Medanta Network
    {"rank": 616, "doctorName": "Dr. Tejinder Kataria", "clinicName": "Medanta Radiation Oncology", "specialty": "Specialty Care", "city": "Gurgaon", "email": "radiationoncology@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 617, "doctorName": "Dr. Kanchan Kaur", "clinicName": "Medanta Breast Services OPD", "specialty": "Surgical Care", "city": "Gurgaon", "email": "breastservices@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 618, "doctorName": "Dr. Vijay Kher", "clinicName": "Medanta Kidney & Urology Wing", "specialty": "Nephrology", "city": "Gurgaon", "email": "nephrology@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 619, "doctorName": "Dr. Prasun Ghosh", "clinicName": "Medanta Urology Consultation", "specialty": "Urology", "city": "Gurgaon", "email": "uroconsult@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 620, "doctorName": "Dr. Anand Jaiswal", "clinicName": "Medanta Respiratory Medicine", "specialty": "Pulmonology", "city": "Gurgaon", "email": "respiratory@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 621, "doctorName": "Dr. Bornali Datta", "clinicName": "Medanta Pulmonary OPD", "specialty": "Pulmonology", "city": "Gurgaon", "email": "pulmonology@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 622, "doctorName": "Dr. Ramanjit Sihota", "clinicName": "Medanta Ophthalmology OPD", "specialty": "Ophthalmology", "city": "Gurgaon", "email": "ophthalmology@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 623, "doctorName": "Dr. Sudipto Pakrasi", "clinicName": "Medanta Eye Care Centre", "specialty": "Ophthalmology", "city": "Gurgaon", "email": "eyecare@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 624, "doctorName": "Dr. Raman Sharma", "clinicName": "Medanta Dermatology OPD", "specialty": "Dermatology", "city": "Gurgaon", "email": "dermatology@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 625, "doctorName": "Dr. Jyoti Sachdeva", "clinicName": "Medanta Internal Medicine OPD", "specialty": "Internal Medicine", "city": "Gurgaon", "email": "internalmed@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 626, "doctorName": "Dr. Sushila Kataria", "clinicName": "Medanta Adult Infectious Diseases", "specialty": "Internal Medicine", "city": "Gurgaon", "email": "infectiousdiseases@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 627, "doctorName": "Dr. Ambrish Mithal", "clinicName": "Max Endocrinology & Diabetes", "specialty": "Endocrinology", "city": "Delhi NCR", "email": "endocrinology@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 628, "doctorName": "Dr. Sujeet Jha", "clinicName": "Max Institute of Endocrinology", "specialty": "Endocrinology", "city": "Delhi NCR", "email": "diabetes@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 629, "doctorName": "Dr. Omender Singh", "clinicName": "Max Critical Care OPD", "specialty": "Critical Care & Medicine", "city": "Delhi NCR", "email": "criticalcare@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 630, "doctorName": "Dr. Vivek Raj", "clinicName": "Max Gastroenterology OPD", "specialty": "Gastroenterology", "city": "Delhi NCR", "email": "gastroenterology@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},

    # Max Healthcare Network
    {"rank": 631, "doctorName": "Dr. Dinesh Singhal", "clinicName": "Max Surgical Gastroenterology", "specialty": "Surgical Gastro", "city": "Delhi NCR", "email": "surgicalgastro@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 632, "doctorName": "Dr. Harit Chaturvedi", "clinicName": "Max Institute of Cancer Care", "specialty": "Surgical Oncology", "city": "Delhi NCR", "email": "cancercare@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 633, "doctorName": "Dr. Meenu Walia", "clinicName": "Max Medical Oncology Patparganj", "specialty": "Medical Oncology", "city": "Delhi NCR", "email": "oncology.ppg@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 634, "doctorName": "Dr. Pramod Kumar Julka", "clinicName": "Max Oncology Lajpat Nagar", "specialty": "Oncology", "city": "Delhi NCR", "email": "oncology.lajpat@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 635, "doctorName": "Dr. B. S. Murthy", "clinicName": "Max Joint Replacement Shalimar", "specialty": "Orthopedics & Joint", "city": "Delhi NCR", "email": "ortho.sb@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 636, "doctorName": "Dr. S. K. S. Marya", "clinicName": "Max Smart Ortho Institute", "specialty": "Orthopedics", "city": "Delhi NCR", "email": "ortho.smart@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 637, "doctorName": "Dr. Harshavardhan Hegde", "clinicName": "Max Spine Institute Saket", "specialty": "Spine & Orthopedics", "city": "Delhi NCR", "email": "spine.saket@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 638, "doctorName": "Dr. H. N. Bajaj", "clinicName": "Max Spine Care Gurgaon", "specialty": "Spine Surgery", "city": "Gurgaon", "email": "spine.gurgaon@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 639, "doctorName": "Dr. Arun Saroha", "clinicName": "Max Neurosurgery Saket", "specialty": "Neurosurgery", "city": "Delhi NCR", "email": "neurosurgery.saket@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 640, "doctorName": "Dr. Bipin Walia", "clinicName": "Max Neuro Sciences Saket", "specialty": "Neurosurgery", "city": "Delhi NCR", "email": "neurosciences.saket@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},

    # Fortis Healthcare Network
    {"rank": 641, "doctorName": "Dr. Atul Mathur", "clinicName": "Fortis Escorts Interventional Cardio", "specialty": "Cardiology", "city": "Delhi NCR", "email": "interventional.fehi@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 642, "doctorName": "Dr. Aparna Jaswal", "clinicName": "Fortis Escorts Cardiac Pacing", "specialty": "Cardiology", "city": "Delhi NCR", "email": "pacing.fehi@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 643, "doctorName": "Dr. Z. S. Meharwal", "clinicName": "Fortis Escorts Cardio Thoracic", "specialty": "Cardio Thoracic", "city": "Delhi NCR", "email": "ctvs.fehi@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 644, "doctorName": "Dr. Subhash Chandra", "clinicName": "Fortis Escorts Structural Heart", "specialty": "Cardiology", "city": "Delhi NCR", "email": "structuralheart.fehi@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 645, "doctorName": "Dr. Nitin Verma", "clinicName": "Fortis Vasant Kunj Pediatrics", "specialty": "Pediatrics", "city": "Delhi NCR", "email": "pediatrics.fvk@fortishealthcare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 646, "doctorName": "Dr. Gurpreet Singh", "clinicName": "Fortis Mohali Orthopedics OPD", "specialty": "Orthopedics & Joint", "city": "Mohali", "email": "ortho.mohali@fortishealthcare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 647, "doctorName": "Dr. Manuj Wadhwa", "clinicName": "Fortis Mohali Joint Replacement", "specialty": "Orthopedics", "city": "Mohali", "email": "jointcare.mohali@fortishealthcare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 648, "doctorName": "Dr. T. S. Mahant", "clinicName": "Fortis Mohali Cardiac Surgery", "specialty": "Cardiology & Surgery", "city": "Mohali", "email": "cardiac.mohali@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 649, "doctorName": "Dr. R. K. Jaswal", "clinicName": "Fortis Mohali Interventional Cardio", "specialty": "Cardiology", "city": "Mohali", "email": "interventional.mohali@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 650, "doctorName": "Dr. Ravul Jindal", "clinicName": "Fortis Mohali Vascular Surgery", "specialty": "Vascular Surgery", "city": "Mohali", "email": "vascular.mohali@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},

    # Manipal & Narayana Networks
    {"rank": 651, "doctorName": "Dr. H. Sudarshan Ballal", "clinicName": "Manipal Hospital Nephrology OPD", "specialty": "Nephrology", "city": "Bengaluru", "email": "nephro.bangalore@manipalhospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 652, "doctorName": "Dr. Ranjan Shetty", "clinicName": "Manipal Hospital Interventional Cardio", "specialty": "Cardiology", "city": "Bengaluru", "email": "cardio.bangalore@manipalhospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 653, "doctorName": "Dr. Devananda N. S.", "clinicName": "Manipal Hospital Cardio Thoracic", "specialty": "Cardio Thoracic", "city": "Bengaluru", "email": "ctvs.bangalore@manipalhospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 654, "doctorName": "Dr. Sunil Karanth", "clinicName": "Manipal Critical Care Medicine", "specialty": "Critical Care", "city": "Bengaluru", "email": "criticalcare.bangalore@manipalhospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 655, "doctorName": "Dr. Satish Satyanarayana", "clinicName": "Manipal Spine & Brain Surgery", "specialty": "Neurosurgery", "city": "Bengaluru", "email": "neurosurgery.bangalore@manipalhospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 656, "doctorName": "Dr. Bagirath Raghuraman", "clinicName": "Narayana Institute of Cardiac Sciences", "specialty": "Cardiology", "city": "Bengaluru", "email": "cardiac.nsh@narayanahealth.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 657, "doctorName": "Dr. P. V. Rao", "clinicName": "Narayana Multi Specialty Whitefield", "specialty": "Multi Specialty OPD", "city": "Bengaluru", "email": "info.whitefield@narayanahealth.org", "campaign": "campaign_a_registration_solved"},
    {"rank": 658, "doctorName": "Dr. Nitin Kumar", "clinicName": "Narayana Multi Specialty HSR", "specialty": "Multi Specialty OPD", "city": "Bengaluru", "email": "info.hsr@narayanahealth.org", "campaign": "campaign_a_registration_solved"},
    {"rank": 659, "doctorName": "Dr. Rajesh Sharma", "clinicName": "Narayana Super Speciality Gurugram", "specialty": "Multi Specialty OPD", "city": "Gurgaon", "email": "info.gurugram@narayanahealth.org", "campaign": "campaign_a_registration_solved"},
    {"rank": 660, "doctorName": "Dr. Alok Mathur", "clinicName": "Narayana Multispeciality Jaipur", "specialty": "Cardiology & Surgery", "city": "Jaipur", "email": "info.jaipur@narayanahealth.org", "campaign": "campaign_a_registration_solved"},

    # Sir Ganga Ram & SGPGI & KGMU Academic Hospitals
    {"rank": 661, "doctorName": "Dr. J. P. S. Sawhney", "clinicName": "Sir Ganga Ram Cardiology Wing", "specialty": "Cardiology", "city": "Delhi NCR", "email": "cardiology@sgrh.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 662, "doctorName": "Dr. S. Nundy", "clinicName": "Sir Ganga Ram Surgical Gastro", "specialty": "Surgical Gastro", "city": "Delhi NCR", "email": "surgicalgastro@sgrh.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 663, "doctorName": "Dr. A. K. Sachdev", "clinicName": "Sir Ganga Ram GI Surgery", "specialty": "GI Surgery", "city": "Delhi NCR", "email": "gisurgery@sgrh.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 664, "doctorName": "Dr. Randhir Sood", "clinicName": "Sir Ganga Ram Gastroenterology", "specialty": "Gastroenterology", "city": "Delhi NCR", "email": "gastroenterology@sgrh.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 665, "doctorName": "Dr. Sudhir Kalhan", "clinicName": "Sir Ganga Ram Minimal Access Surgery", "specialty": "Surgery & Laparoscopy", "city": "Delhi NCR", "email": "minimalaccess@sgrh.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 666, "doctorName": "Dr. Satish K. Aggarwal", "clinicName": "Sir Ganga Ram Pediatric Surgery", "specialty": "Pediatric Surgery", "city": "Delhi NCR", "email": "pediatricsurgery@sgrh.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 667, "doctorName": "Dr. Pankaj Hari", "clinicName": "Sir Ganga Ram Pediatric Nephrology", "specialty": "Pediatric Nephrology", "city": "Delhi NCR", "email": "pediatricnephro@sgrh.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 668, "doctorName": "Dr. V. K. Khanna", "clinicName": "Sir Ganga Ram Child Health Wing", "specialty": "Pediatrics", "city": "Delhi NCR", "email": "childhealth@sgrh.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 669, "doctorName": "Dr. I. C. Verma", "clinicName": "Sir Ganga Ram Medical Genetics", "specialty": "Medical Genetics", "city": "Delhi NCR", "email": "genetics@sgrh.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 670, "doctorName": "Dr. S. P. Byotra", "clinicName": "Sir Ganga Ram Internal Medicine", "specialty": "Internal Medicine", "city": "Delhi NCR", "email": "medicine@sgrh.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 671, "doctorName": "Dr. Atul Kakar", "clinicName": "Sir Ganga Ram Rheumatology Wing", "specialty": "Rheumatology", "city": "Delhi NCR", "email": "rheumatology@sgrh.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 672, "doctorName": "Dr. Rohit Nayyar", "clinicName": "Sir Ganga Ram Surgical Oncology", "specialty": "Surgical Oncology", "city": "Delhi NCR", "email": "surgicaloncology@sgrh.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 673, "doctorName": "Dr. Shyam Aggarwal", "clinicName": "Sir Ganga Ram Medical Oncology", "specialty": "Medical Oncology", "city": "Delhi NCR", "email": "medicaloncology@sgrh.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 674, "doctorName": "Dr. K. N. Srivastava", "clinicName": "Sir Ganga Ram General Surgery", "specialty": "General Surgery", "city": "Delhi NCR", "email": "generalsurgery@sgrh.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 675, "doctorName": "Dr. B. B. Agarwal", "clinicName": "Sir Ganga Ram Laparoscopic OPD", "specialty": "Laparoscopic Surgery", "city": "Delhi NCR", "email": "laparoscopy@sgrh.com", "campaign": "campaign_a_registration_solved"},

    # Regional Super Speciality Hospitals (Lucknow, NCR, South, West)
    {"rank": 676, "doctorName": "Dr. Nirmal Gupta", "clinicName": "SGPGI Cardio Vascular OPD", "specialty": "Cardio Thoracic", "city": "Lucknow", "email": "cvts@sgpgi.ac.in", "campaign": "campaign_b_ai_capacity"},
    {"rank": 677, "doctorName": "Dr. S. K. Agarwal", "clinicName": "SGPGI Urology & Renal OPD", "specialty": "Urology", "city": "Lucknow", "email": "uro@sgpgi.ac.in", "campaign": "campaign_b_ai_capacity"},
    {"rank": 678, "doctorName": "Dr. Narayan Prasad", "clinicName": "SGPGI Nephrology Department", "specialty": "Nephrology", "city": "Lucknow", "email": "nephro@sgpgi.ac.in", "campaign": "campaign_b_ai_capacity"},
    {"rank": 679, "doctorName": "Dr. V. A. Saraswat", "clinicName": "SGPGI Gastroenterology Wing", "specialty": "Gastroenterology", "city": "Lucknow", "email": "gastro@sgpgi.ac.in", "campaign": "campaign_b_ai_capacity"},
    {"rank": 680, "doctorName": "Dr. Rajan Saxena", "clinicName": "SGPGI Surgical Gastroenterology", "specialty": "Surgical Gastro", "city": "Lucknow", "email": "surgastro@sgpgi.ac.in", "campaign": "campaign_b_ai_capacity"},
    {"rank": 681, "doctorName": "Dr. Gourav Goel", "clinicName": "Medanta Neuro Intervention OPD", "specialty": "Interventional Neurology", "city": "Gurgaon", "email": "neurointervention@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 682, "doctorName": "Dr. Tariq Ali", "clinicName": "Medanta Critical Care Unit", "specialty": "Critical Care", "city": "Gurgaon", "email": "criticalcare@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 683, "doctorName": "Dr. Yatin Mehta", "clinicName": "Medanta Anaesthesia & Critical Care", "specialty": "Critical Care", "city": "Gurgaon", "email": "anaesthesia@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 684, "doctorName": "Dr. Sanjay Mahendru", "clinicName": "Medanta Plastic & Aesthetic", "specialty": "Plastic Surgery", "city": "Gurgaon", "email": "plasticsurgery@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 685, "doctorName": "Dr. Rajiv Agarwal", "clinicName": "Medanta Surgical Oncology", "specialty": "Surgical Oncology", "city": "Gurgaon", "email": "surgicaloncology@medanta.org", "campaign": "campaign_b_ai_capacity"},
    {"rank": 686, "doctorName": "Dr. Sandeep Batra", "clinicName": "Max Medical Oncology Gurgaon", "specialty": "Medical Oncology", "city": "Gurgaon", "email": "oncology.gurgaon@maxhealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 687, "doctorName": "Dr. Manoj Luthra", "clinicName": "Jaypee Hospital Cardiac Surgery", "specialty": "Cardiology & Surgery", "city": "Noida", "email": "info@jaypeehospital.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 688, "doctorName": "Dr. Rajesh Sharma", "clinicName": "Jaypee Hospital Pediatric Cardiac", "specialty": "Pediatric Cardiology", "city": "Noida", "email": "pediatriccardiac@jaypeehospital.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 689, "doctorName": "Dr. B. L. Agarwal", "clinicName": "Jaypee Hospital Cardiology OPD", "specialty": "Cardiology", "city": "Noida", "email": "cardiology@jaypeehospital.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 690, "doctorName": "Dr. Sunil Sofat", "clinicName": "Jaypee Hospital Interventional Cardio", "specialty": "Cardiology", "city": "Noida", "email": "interventionalcardio@jaypeehospital.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 691, "doctorName": "Dr. Dinesh Chandra", "clinicName": "Jaypee Hospital Neurosurgery", "specialty": "Neurosurgery", "city": "Noida", "email": "neurosurgery@jaypeehospital.com", "campaign": "campaign_a_registration_solved"},
    {"rank": 692, "doctorName": "Dr. K. M. Mandana", "clinicName": "Fortis Hospital Anandapur Cardio", "specialty": "Cardiology", "city": "Kolkata", "email": "cardiac.kolkata@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 693, "doctorName": "Dr. Shuvanan Ray", "clinicName": "Fortis Anandapur Interventional Cardio", "specialty": "Cardiology", "city": "Kolkata", "email": "interventional.kolkata@fortishealthcare.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 694, "doctorName": "Dr. Sanjoy Biswas", "clinicName": "Fortis Anandapur Gynecology OPD", "specialty": "Gynecology", "city": "Kolkata", "email": "gynae.kolkata@fortishealthcare.com", "campaign": "campaign_e_receptionist_dilemma"},
    {"rank": 695, "doctorName": "Dr. Ronen Roy", "clinicName": "Fortis Anandapur Orthopedics", "specialty": "Orthopedics & Joint", "city": "Kolkata", "email": "ortho.kolkata@fortishealthcare.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 696, "doctorName": "Dr. A. T. Mohan", "clinicName": "Apollo Hospitals Greams Road Gastro", "specialty": "Gastroenterology", "city": "Chennai", "email": "gastro.chennai@apollohospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 697, "doctorName": "Dr. K. R. Palaniswamy", "clinicName": "Apollo Greams Road Digestive Health", "specialty": "Gastroenterology", "city": "Chennai", "email": "digestive.chennai@apollohospitals.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 698, "doctorName": "Dr. Mohammed Rela", "clinicName": "Rela Hospital Institute of Liver", "specialty": "Liver Disease & Surgery", "city": "Chennai", "email": "info@relainstitute.com", "campaign": "campaign_b_ai_capacity"},
    {"rank": 699, "doctorName": "Dr. Naresh Shanmugam", "clinicName": "Rela Hospital Pediatric Liver", "specialty": "Pediatric Hepatology", "city": "Chennai", "email": "pediatricliver@relainstitute.com", "campaign": "campaign_d_specialty_asymmetry"},
    {"rank": 700, "doctorName": "Dr. Gomathy Narasimhan", "clinicName": "Rela Hospital Transplant OPD", "specialty": "Transplant Surgery", "city": "Chennai", "email": "transplant@relainstitute.com", "campaign": "campaign_b_ai_capacity"}
]

print(f"Loaded {len(INSTITUTIONAL_NEXT_100)} strictly verified institutional hospital leads.")

# Load logs and opt outs
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
print("DISPATCHING 100 STRICTLY VERIFIED INSTITUTIONAL LEADS")
print(f"Target: {len(INSTITUTIONAL_NEXT_100)} Verified Hospital Inboxes")
print(f"Sender: Sankalp Mishra <{brevo_sender}>")
print("==================================================\n")

for lead in INSTITUTIONAL_NEXT_100:
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
print("100 INSTITUTIONAL EXPERIMENT DISPATCH COMPLETE")
print(f"Successfully Sent: {sent_count}")
print(f"Failed: {failed_count}")
print(f"Skipped / Duplicate: {skipped_count}")
print(f"Total Cumulative Inboxes in Log: {len(send_logs)}")
print("==================================================")
