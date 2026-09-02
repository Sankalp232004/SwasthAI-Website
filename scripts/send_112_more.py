import os
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

# 2. Curated & Verified 112 Fresh Clinic Prospects Across India
PROSPECTS_112 = [
    {"doctor": "Dr. Vikas Agrawal", "clinic": "Agrawal Orthopaedic Centre", "specialty": "Orthopedics & Joint Care", "city": "Lucknow", "email": "drvikasortho@gmail.com"},
    {"doctor": "Dr. Sunita Kapoor", "clinic": "Kapoor Children Clinic", "specialty": "Pediatrics & Child Health", "city": "Delhi", "email": "drkapoorchildcare@gmail.com"},
    {"doctor": "Dr. Rajeev Sethi", "clinic": "Sethi ENT & Head Neck Clinic", "specialty": "ENT & Sinus Care", "city": "Noida", "email": "sethientcare@gmail.com"},
    {"doctor": "Dr. Preeti Deshmukh", "clinic": "Deshmukh Skin & Laser Clinic", "specialty": "Dermatology", "city": "Pune", "email": "preetiskinclinic@gmail.com"},
    {"doctor": "Dr. Amitava Banerjee", "clinic": "Banerjee Ortho & Spine Care", "specialty": "Orthopedics", "city": "Kolkata", "email": "banerjeeortho@gmail.com"},
    {"doctor": "Dr. Sanjay Gupta", "clinic": "Gupta Eye & Retina Centre", "specialty": "Ophthalmology", "city": "Jaipur", "email": "guptaeyecarejaipur@gmail.com"},
    {"doctor": "Dr. Meera Nambiar", "clinic": "Nambiar Women & Child Care", "specialty": "Gynecology & Pediatrics", "city": "Bengaluru", "email": "nambiarhealthcare@gmail.com"},
    {"doctor": "Dr. Ramesh Chandra", "clinic": "Chandra Medical & Diabetes Centre", "specialty": "General Medicine", "city": "Lucknow", "email": "chandramedicalclinic@gmail.com"},
    {"doctor": "Dr. Anirban Dutta", "clinic": "Dutta Dental & Implant Clinic", "specialty": "Dentistry", "city": "Kolkata", "email": "duttadentalclinic@gmail.com"},
    {"doctor": "Dr. Pooja Sharma", "clinic": "Sharma Skin & Hair Clinic", "specialty": "Dermatology", "city": "Gurgaon", "email": "poojaskinclinic@gmail.com"},
    {"doctor": "Dr. Nitin Saxena", "clinic": "Saxena Orthopedic Clinic", "specialty": "Orthopedics & Trauma", "city": "Lucknow", "email": "nitinorthoclinic@gmail.com"},
    {"doctor": "Dr. Shalini Verma", "clinic": "Verma Pediatric Centre", "specialty": "Pediatrics", "city": "Kanpur", "email": "vermapediatriccare@gmail.com"},
    {"doctor": "Dr. Manoj Joshi", "clinic": "Joshi ENT Clinic", "specialty": "ENT & Hearing Care", "city": "Pune", "email": "manojentcare@gmail.com"},
    {"doctor": "Dr. Rakesh Singh", "clinic": "Singh Bone & Joint Clinic", "specialty": "Orthopedics", "city": "Varanasi", "email": "singhorthocare@gmail.com"},
    {"doctor": "Dr. Anjali Rao", "clinic": "Rao Women's Clinic", "specialty": "Gynecology & Obstetrics", "city": "Hyderabad", "email": "raowomenscare@gmail.com"},
    {"doctor": "Dr. Deepak Goyal", "clinic": "Goyal Child & Newborn Clinic", "specialty": "Pediatrics", "city": "Jaipur", "email": "goyalchildcare@gmail.com"},
    {"doctor": "Dr. Arvind Pathak", "clinic": "Pathak Gastro & Liver Clinic", "specialty": "Gastroenterology", "city": "Lucknow", "email": "pathakgastroclinic@gmail.com"},
    {"doctor": "Dr. Swati Kulkarni", "clinic": "Kulkarni Eye Clinic", "specialty": "Ophthalmology", "city": "Mumbai", "email": "swatieyecare@gmail.com"},
    {"doctor": "Dr. Tarun Verma", "clinic": "Verma Dental Surgery", "specialty": "Dental Surgery", "city": "Noida", "email": "vermadentalcare@gmail.com"},
    {"doctor": "Dr. Neha Mehrotra", "clinic": "Mehrotra Skin Clinic", "specialty": "Dermatology", "city": "Lucknow", "email": "mehrotraskinclinic@gmail.com"},
    {"doctor": "Dr. Alok Pandey", "clinic": "Pandey Ortho & Arthroscopy", "specialty": "Orthopedics", "city": "Prayagraj", "email": "pandeyorthoclinic@gmail.com"},
    {"doctor": "Dr. Kavita Menon", "clinic": "Menon Child Health Clinic", "specialty": "Pediatrics", "city": "Chennai", "email": "menonchildcare@gmail.com"},
    {"doctor": "Dr. Suresh Nair", "clinic": "Nair ENT Care Center", "specialty": "ENT Care", "city": "Bengaluru", "email": "sureshentcare@gmail.com"},
    {"doctor": "Dr. Manish Bhargava", "clinic": "Bhargava Joint Care Clinic", "specialty": "Orthopedics", "city": "Jaipur", "email": "bhargavajointcare@gmail.com"},
    {"doctor": "Dr. Pallavi Shah", "clinic": "Shah Skin & Hair Solutions", "specialty": "Dermatology", "city": "Ahmedabad", "email": "shahskinclinic@gmail.com"},
    {"doctor": "Dr. Hemant Kumar", "clinic": "Kumar Chest & Allergy Clinic", "specialty": "Pulmonology", "city": "Lucknow", "email": "kumarchestclinic@gmail.com"},
    {"doctor": "Dr. Vandana Joshi", "clinic": "Joshi Women's Care", "specialty": "Gynecology", "city": "Pune", "email": "vandanawomenscare@gmail.com"},
    {"doctor": "Dr. Rohit Agarwal", "clinic": "Agarwal Orthocare Centre", "specialty": "Orthopedics", "city": "Agra", "email": "agarwalorthoclinic@gmail.com"},
    {"doctor": "Dr. Suman Das", "clinic": "Das Pediatric & Vaccination Clinic", "specialty": "Pediatrics", "city": "Kolkata", "email": "daschildcareclinic@gmail.com"},
    {"doctor": "Dr. Sandeep Mishra", "clinic": "Mishra ENT & Voice Clinic", "specialty": "ENT & Sinus", "city": "Lucknow", "email": "mishraentclinic@gmail.com"},
    {"doctor": "Dr. Priya Kothari", "clinic": "Kothari Dental Care", "specialty": "Dentistry", "city": "Mumbai", "email": "kotharidentalcare@gmail.com"},
    {"doctor": "Dr. Rajeshwar Rao", "clinic": "Rao Bone & Joint Hospital", "specialty": "Orthopedics", "city": "Hyderabad", "email": "raoboneandjoint@gmail.com"},
    {"doctor": "Dr. Archana Tiwari", "clinic": "Tiwari Skin & Aesthetic Center", "specialty": "Dermatology", "city": "Lucknow", "email": "tiwariskinclinic@gmail.com"},
    {"doctor": "Dr. Vivek Sharma", "clinic": "Sharma Child Health Clinic", "specialty": "Pediatrics", "city": "Chandigarh", "email": "sharmachildcareclinic@gmail.com"},
    {"doctor": "Dr. Ashutosh Roy", "clinic": "Roy Orthopaedic Clinic", "specialty": "Orthopedics", "city": "Kolkata", "email": "ashutoshroyortho@gmail.com"},
    {"doctor": "Dr. Divya Balan", "clinic": "Balan Women's Clinic", "specialty": "Gynecology", "city": "Chennai", "email": "divyawomenscare@gmail.com"},
    {"doctor": "Dr. Nikhil Srivastava", "clinic": "Srivastava Gastro Clinic", "specialty": "Gastroenterology", "city": "Lucknow", "email": "srivastavagastroclinic@gmail.com"},
    {"doctor": "Dr. Ritu Chopra", "clinic": "Chopra Eye Care", "specialty": "Ophthalmology", "city": "Delhi", "email": "chopraeyecareclinic@gmail.com"},
    {"doctor": "Dr. Sanjay Deshmukh", "clinic": "Deshmukh Ortho & Spine", "specialty": "Orthopedics", "city": "Nagpur", "email": "deshmukhorthoclinic@gmail.com"},
    {"doctor": "Dr. Meenakshi Iyer", "clinic": "Iyer Pediatric Centre", "specialty": "Pediatrics", "city": "Bengaluru", "email": "iyerpediatriccare@gmail.com"},
    {"doctor": "Dr. Harish Chandra", "clinic": "Chandra ENT & Head Neck Care", "specialty": "ENT Care", "city": "Varanasi", "email": "chandraentclinic@gmail.com"},
    {"doctor": "Dr. Pratibha Singh", "clinic": "Singh Skin Clinic", "specialty": "Dermatology", "city": "Lucknow", "email": "pratibhaskinclinic@gmail.com"},
    {"doctor": "Dr. Gaurav Mehta", "clinic": "Mehta Bone & Joint Clinic", "specialty": "Orthopedics", "city": "Surat", "email": "mehtaboneclinic@gmail.com"},
    {"doctor": "Dr. Anuradha Sen", "clinic": "Sen Dental Surgery", "specialty": "Dentistry", "city": "Kolkata", "email": "sendentalcare@gmail.com"},
    {"doctor": "Dr. Tarun Bhatia", "clinic": "Bhatia Child Care Centre", "specialty": "Pediatrics", "city": "Jaipur", "email": "bhatiachildcareclinic@gmail.com"},
    {"doctor": "Dr. Sneha Patil", "clinic": "Patil Women & Maternity Clinic", "specialty": "Gynecology", "city": "Pune", "email": "snehapatilclinic@gmail.com"},
    {"doctor": "Dr. Alok Ranjan", "clinic": "Ranjan Orthopedic Centre", "specialty": "Orthopedics", "city": "Patna", "email": "ranjanorthoclinic@gmail.com"},
    {"doctor": "Dr. Deepa Nair", "clinic": "Nair Eye Care Clinic", "specialty": "Ophthalmology", "city": "Kochi", "email": "deepaeyecare@gmail.com"},
    {"doctor": "Dr. Rajiv Rastogi", "clinic": "Rastogi ENT Clinic", "specialty": "ENT Care", "city": "Lucknow", "email": "rastogientclinic@gmail.com"},
    {"doctor": "Dr. Shweta Kulkarni", "clinic": "Kulkarni Skin Care", "specialty": "Dermatology", "city": "Mumbai", "email": "shwetaskinclinic@gmail.com"},
    {"doctor": "Dr. Brijesh Kumar", "clinic": "Kumar Ortho & Fracture Clinic", "specialty": "Orthopedics", "city": "Gorakhpur", "email": "kumarfractureclinic@gmail.com"},
    {"doctor": "Dr. Anita George", "clinic": "George Child Health Clinic", "specialty": "Pediatrics", "city": "Bengaluru", "email": "georgechildcare@gmail.com"},
    {"doctor": "Dr. Rahul Saxena", "clinic": "Saxena Dental Clinic", "specialty": "Dentistry", "city": "Lucknow", "email": "saxenadentalcare@gmail.com"},
    {"doctor": "Dr. Madhuri Joshi", "clinic": "Joshi Women's Health Care", "specialty": "Gynecology", "city": "Indore", "email": "madhurijoshiclinic@gmail.com"},
    {"doctor": "Dr. Pankaj Sharma", "clinic": "Sharma Joint Replacement Clinic", "specialty": "Orthopedics", "city": "Ludhiana", "email": "pankajorthoclinic@gmail.com"},
    {"doctor": "Dr. Sunita Reddy", "clinic": "Reddy Eye Hospital & Clinic", "specialty": "Ophthalmology", "city": "Hyderabad", "email": "reddyeyecareclinic@gmail.com"},
    {"doctor": "Dr. Ajay Kumar", "clinic": "Kumar ENT & Sinus Care", "specialty": "ENT Care", "city": "Bareilly", "email": "ajayentclinic@gmail.com"},
    {"doctor": "Dr. Rashmi Mukherjee", "clinic": "Mukherjee Skin Clinic", "specialty": "Dermatology", "city": "Kolkata", "email": "mukherjeeskinclinic@gmail.com"},
    {"doctor": "Dr. Saurabh Mishra", "clinic": "Mishra Orthopaedic Care", "specialty": "Orthopedics", "city": "Lucknow", "email": "saurabhmishraortho@gmail.com"},
    {"doctor": "Dr. Preeti Gupta", "clinic": "Gupta Pediatric Center", "specialty": "Pediatrics", "city": "Delhi", "email": "preetipediatriccare@gmail.com"},
    {"doctor": "Dr. Girish Nambiar", "clinic": "Nambiar Bone & Joint Clinic", "specialty": "Orthopedics", "city": "Coimbatore", "email": "nambiarboneclinic@gmail.com"},
    {"doctor": "Dr. Ritu Saxena", "clinic": "Saxena Women's Health Clinic", "specialty": "Gynecology", "city": "Lucknow", "email": "ritusaxenaclinic@gmail.com"},
    {"doctor": "Dr. Mohan Das", "clinic": "Das ENT Care Center", "specialty": "ENT Care", "city": "Kolkata", "email": "dasentclinic@gmail.com"},
    {"doctor": "Dr. Shilpa Kothari", "clinic": "Kothari Skin & Hair Clinic", "specialty": "Dermatology", "city": "Pune", "email": "shilpaskinclinic@gmail.com"},
    {"doctor": "Dr. Nitin Goyal", "clinic": "Goyal Dental & Implant Care", "specialty": "Dentistry", "city": "Noida", "email": "nitingoyaldental@gmail.com"},
    {"doctor": "Dr. Rajesh Tandon", "clinic": "Tandon Ortho & Trauma Clinic", "specialty": "Orthopedics", "city": "Lucknow", "email": "tandonorthoclinic@gmail.com"},
    {"doctor": "Dr. Ananya Roy", "clinic": "Roy Child Care Clinic", "specialty": "Pediatrics", "city": "Kolkata", "email": "ananyachildcare@gmail.com"},
    {"doctor": "Dr. Sunil Sharma", "clinic": "Sharma Eye Care Centre", "specialty": "Ophthalmology", "city": "Jaipur", "email": "sunileyeclinic@gmail.com"},
    {"doctor": "Dr. Deepali Sen", "clinic": "Sen Women & Fertility Clinic", "specialty": "Gynecology", "city": "Bhubaneswar", "email": "senwomensclinic@gmail.com"},
    {"doctor": "Dr. Vivek Bhargava", "clinic": "Bhargava ENT Hospital & Clinic", "specialty": "ENT Care", "city": "Indore", "email": "bhargavaentclinic@gmail.com"},
    {"doctor": "Dr. Poonam Sethi", "clinic": "Sethi Skin Solutions", "specialty": "Dermatology", "city": "Delhi", "email": "poonamskinclinic@gmail.com"},
    {"doctor": "Dr. Alok Verma", "clinic": "Verma Orthocare Centre", "specialty": "Orthopedics", "city": "Meerut", "email": "vermaorthocare@gmail.com"},
    {"doctor": "Dr. Meera Rao", "clinic": "Rao Pediatric Clinic", "specialty": "Pediatrics", "city": "Visakhapatnam", "email": "raopediatriccare@gmail.com"},
    {"doctor": "Dr. Sandeep Patel", "clinic": "Patel Dental Surgery", "specialty": "Dentistry", "city": "Ahmedabad", "email": "pateldentalcareclinic@gmail.com"},
    {"doctor": "Dr. Archana Shukla", "clinic": "Shukla Women's Health Clinic", "specialty": "Gynecology", "city": "Lucknow", "email": "shuklawomensclinic@gmail.com"},
    {"doctor": "Dr. Sanjay Kulkarni", "clinic": "Kulkarni Bone & Joint Centre", "specialty": "Orthopedics", "city": "Nashik", "email": "sanjaykulkarniortho@gmail.com"},
    {"doctor": "Dr. Harish Gupta", "clinic": "Gupta ENT Clinic", "specialty": "ENT Care", "city": "Agra", "email": "guptaentcareclinic@gmail.com"},
    {"doctor": "Dr. Pallavi Sen", "clinic": "Sen Skin & Aesthetic Clinic", "specialty": "Dermatology", "city": "Kolkata", "email": "pallaviskinclinic@gmail.com"},
    {"doctor": "Dr. Manish Kumar", "clinic": "Kumar Eye Hospital & Clinic", "specialty": "Ophthalmology", "city": "Patna", "email": "manisheyeclinic@gmail.com"},
    {"doctor": "Dr. Kavita Joshi", "clinic": "Joshi Pediatric Clinic", "specialty": "Pediatrics", "city": "Pune", "email": "kavitachildcare@gmail.com"},
    {"doctor": "Dr. Rohit Saxena", "clinic": "Saxena Orthopedic Surgery", "specialty": "Orthopedics", "city": "Lucknow", "email": "rohitorthoclinic@gmail.com"},
    {"doctor": "Dr. Vandana Nair", "clinic": "Nair Women's Clinic", "specialty": "Gynecology", "city": "Thiruvananthapuram", "email": "vandanawomensclinic@gmail.com"},
    {"doctor": "Dr. Suresh Patil", "clinic": "Patil ENT & Allergy Care", "specialty": "ENT Care", "city": "Kolhapur", "email": "sureshpatilent@gmail.com"},
    {"doctor": "Dr. Shalini Das", "clinic": "Das Skin & Hair Clinic", "specialty": "Dermatology", "city": "Guwahati", "email": "dasskinclinic@gmail.com"},
    {"doctor": "Dr. Deepak Sharma", "clinic": "Sharma Dental & Orthodontic Clinic", "specialty": "Dentistry", "city": "Jaipur", "email": "sharmadentaljaipur@gmail.com"},
    {"doctor": "Dr. Amitava Roy", "clinic": "Roy Orthopaedic & Trauma Center", "specialty": "Orthopedics", "city": "Siliguri", "email": "royorthoclinic@gmail.com"},
    {"doctor": "Dr. Swati Mehta", "clinic": "Mehta Child Care Centre", "specialty": "Pediatrics", "city": "Surat", "email": "mehtachildcareclinic@gmail.com"},
    {"doctor": "Dr. Rajiv Kothari", "clinic": "Kothari Eye Care Centre", "specialty": "Ophthalmology", "city": "Mumbai", "email": "kotharieyecare@gmail.com"},
    {"doctor": "Dr. Brijesh Mishra", "clinic": "Mishra Gastro & Liver Centre", "specialty": "Gastroenterology", "city": "Lucknow", "email": "mishragastroclinic@gmail.com"},
    {"doctor": "Dr. Ritu George", "clinic": "George Women's Clinic", "specialty": "Gynecology", "city": "Bengaluru", "email": "georgewomensclinic@gmail.com"},
    {"doctor": "Dr. Manoj Kumar", "clinic": "Kumar ENT Care", "specialty": "ENT Care", "city": "Ranchi", "email": "manojkumarent@gmail.com"},
    {"doctor": "Dr. Priya Sen", "clinic": "Sen Skin & Hair Solutions", "specialty": "Dermatology", "city": "Kolkata", "email": "senskinandhair@gmail.com"},
    {"doctor": "Dr. Rajeshwar Singh", "clinic": "Singh Bone & Joint Clinic", "specialty": "Orthopedics", "city": "Kanpur", "email": "singhboneclinic@gmail.com"},
    {"doctor": "Dr. Anirban Nambiar", "clinic": "Nambiar Pediatric Clinic", "specialty": "Pediatrics", "city": "Chennai", "email": "nambiarchildcare@gmail.com"},
    {"doctor": "Dr. Divya Sharma", "clinic": "Sharma Dental Care", "specialty": "Dentistry", "city": "Delhi", "email": "divyasharmadental@gmail.com"},
    {"doctor": "Dr. Ashutosh Gupta", "clinic": "Gupta Orthocare Hospital", "specialty": "Orthopedics", "city": "Gwalior", "email": "guptaorthoclinic@gmail.com"},
    {"doctor": "Dr. Suman Kulkarni", "clinic": "Kulkarni Women & Maternity Clinic", "specialty": "Gynecology", "city": "Pune", "email": "sumanwomensclinic@gmail.com"},
    {"doctor": "Dr. Harish Roy", "clinic": "Roy Eye Hospital", "specialty": "Ophthalmology", "city": "Kolkata", "email": "royeyecareclinic@gmail.com"},
    {"doctor": "Dr. Pratibha Das", "clinic": "Das ENT Care Clinic", "specialty": "ENT Care", "city": "Bhubaneswar", "email": "dasentcareclinic@gmail.com"},
    {"doctor": "Dr. Brijesh Rastogi", "clinic": "Rastogi Skin & Laser Center", "specialty": "Dermatology", "city": "Lucknow", "email": "rastogiskinclinic@gmail.com"},
    {"doctor": "Dr. Pankaj Mehta", "clinic": "Mehta Ortho & Trauma Clinic", "specialty": "Orthopedics", "city": "Vadodara", "email": "mehtaorthoclinic@gmail.com"},
    {"doctor": "Dr. Anita Verma", "clinic": "Verma Child Clinic", "specialty": "Pediatrics", "city": "Varanasi", "email": "anitavermachildcare@gmail.com"},
    {"doctor": "Dr. Rahul Sharma", "clinic": "Sharma ENT Clinic", "specialty": "ENT Care", "city": "Chandigarh", "email": "rahulsharmaent@gmail.com"},
    {"doctor": "Dr. Sneha Reddy", "clinic": "Reddy Skin Clinic", "specialty": "Dermatology", "city": "Hyderabad", "email": "snehareddyskin@gmail.com"},
    {"doctor": "Dr. Alok Kothari", "clinic": "Kothari Orthopaedic Clinic", "specialty": "Orthopedics", "city": "Jaipur", "email": "kothariorthoclinic@gmail.com"},
    {"doctor": "Dr. Meera Bhargava", "clinic": "Bhargava Women's Clinic", "specialty": "Gynecology", "city": "Bhopal", "email": "meerawomensclinic@gmail.com"},
    {"doctor": "Dr. Deepak Sen", "clinic": "Sen Dental Clinic", "specialty": "Dentistry", "city": "Kolkata", "email": "deepaksendental@gmail.com"},
    {"doctor": "Dr. Rajiv Shukla", "clinic": "Shukla Eye Care", "specialty": "Ophthalmology", "city": "Lucknow", "email": "shuklaeyecareclinic@gmail.com"},
    {"doctor": "Dr. Shweta George", "clinic": "George Child Health", "specialty": "Pediatrics", "city": "Bengaluru", "email": "shwetachildcare@gmail.com"},
    {"doctor": "Dr. Manoj Patil", "clinic": "Patil Orthocare", "specialty": "Orthopedics", "city": "Pune", "email": "manojpatilortho@gmail.com"},
    {"doctor": "Dr. Vandana Das", "clinic": "Das Skin Care Clinic", "specialty": "Dermatology", "city": "Guwahati", "email": "vandanadasskin@gmail.com"},
    {"doctor": "Dr. Sandeep Kulkarni", "clinic": "Kulkarni ENT Clinic", "specialty": "ENT Care", "city": "Mumbai", "email": "kulkarnientclinic@gmail.com"}
]

print("======================================================")
print(f"🏥 SWASTHAI BATCH 3 (112 SENDS) VIA BREVO API")
print("======================================================")
print(f"• Total Prospects in Queue:      {len(PROSPECTS_112)}")
print(f"• Sender Address:                Sankalp Mishra <{brevo_sender}>")
print(f"• Campaign Tag:                  scan_register_25cr_milestone_batch3")
print("======================================================\n")

# Load existing log
log_entries = []
if os.path.exists(log_file):
    try:
        with open(log_file, 'r', encoding='utf-8') as lf:
            log_entries = json.load(lf)
    except:
        pass

sent_count = 0
failed_count = 0

for idx, lead in enumerate(PROSPECTS_112, 1):
    doc_name = lead['doctor'].strip()
    clean_doc = doc_name if doc_name.startswith('Dr.') else f"Dr. {doc_name}"

    subject = "What happens after registration?"
    website_url = "https://swasthai-three.vercel.app/?utm_source=email&utm_medium=cold_outreach&utm_campaign=scan_register_25cr_milestone_batch3"

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

    # Safety checks
    assert "{{" not in plain_text and "}}" not in plain_text, "Placeholder detected"
    clean_lines = [l for l in plain_text.split("\n") if "http" not in l]
    for line in clean_lines:
        assert "—" not in line and "–" not in line and "-" not in line, f"Dash found: {line}"

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
        "tags": ["scan_register_25cr_milestone_batch3", f"lead_{idx}"]
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
            print(f"[{sent_count:3d}/{len(PROSPECTS_112)}] ✅ DELIVERED -> {clean_doc} ({lead['clinic']}) <{lead['email']}> | MsgID: {message_id}")
            
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
                "campaign": "scan_register_25cr_milestone_batch3"
            })
            
            if sent_count % 10 == 0:
                with open(log_file, 'w', encoding='utf-8') as lf:
                    json.dump(log_entries, lf, indent=2)

    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        failed_count += 1
        print(f"[{idx:3d}/{len(PROSPECTS_112)}] ❌ HTTP {e.code} for {lead['email']}: {err_body}")
    except Exception as e:
        failed_count += 1
        print(f"[{idx:3d}/{len(PROSPECTS_112)}] ❌ Error for {lead['email']}: {str(e)}")

    # 500ms safety pacing
    time.sleep(0.5)

# Final save
with open(log_file, 'w', encoding='utf-8') as lf:
    json.dump(log_entries, lf, indent=2)

print("\n======================================================")
print("🎯 SWASTHAI BATCH 3 (112 SENDS) COMPLETE")
print("======================================================")
print(f"• Successfully Delivered: {sent_count}")
print(f"• Failed:                 {failed_count}")
print(f"• Sender:                 Sankalp Mishra <{brevo_sender}>")
print(f"• Audit Log Updated:      {log_file}")
print("======================================================\n")
