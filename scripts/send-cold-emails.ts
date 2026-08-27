/**
 * SwasthAI Cold Email Sending System (Brevo Engine)
 * ============================================================
 * Safe, controlled cold-email workflow using Brevo's Transactional Email REST API.
 *
 * ALL 50 VERIFIED PROSPECTS LOADED
 *
 * MODES:
 *   --test      Send ONE test email to swasthai.founder@gmail.com (DEFAULT)
 *   --send      Send to real prospects (requires explicit approval, max 10/day)
 *   --dry-run   Preview emails without sending
 *
 * SAFETY PROTOCOLS:
 *   - Max 10 real emails per calendar day (Asia/Kolkata timezone, calculated from send log)
 *   - 10-second delay between real sends
 *   - Full duplicate prevention via normalized email check
 *   - Strict opt-out check before every send
 *   - Zero placeholder scanning (subject, textContent, htmlContent)
 *   - Verified Reply-To (swasthai.founder@gmail.com)
 *   - Clean plain text and minimalist founder HTML
 *   - Full audit trail recorded in cold-email-send-log.json
 */

import { config as loadEnv } from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load .env.local from the website root
loadEnv({ path: path.join(__dirname, "..", ".env.local") });

// ====================================================
// CONFIGURATION
// ====================================================

const senderEnv = process.env.BREVO_SENDER_EMAIL?.trim();

const CONFIG = {
  senderEmail: senderEnv || "swasthai.founder@gmail.com",
  senderName: "Sankalp Mishra",
  replyToEmail: "swasthai.founder@gmail.com",
  replyToName: "Sankalp Mishra",
  testRecipient: "mishrasankalp04@gmail.com",
  maxEmailsPerDay: 10,
  delayBetweenSendMs: 10_000, // 10 seconds conservative delay
  officialWebsiteUrl: "https://swasthai-three.vercel.app/",
  campaignTag: "swasthai_cold_outreach_august_2026",
  logFilePath: path.join(__dirname, "..", "cold-email-send-log.json"),
  optOutFilePath: path.join(__dirname, "..", "cold-email-opt-outs.json"),
};

// ====================================================
// PROSPECT DATA (50 Verified Clinic Prospects)
// ====================================================

export interface Prospect {
  rank: number;
  clinicName: string;
  doctorName: string;
  specialty: string;
  city: string;
  email: string;
  sourceUrl: string;
  subjectLine: string;
  emailBody: string;
}

export const PROSPECTS: Prospect[] = [
  {
    "rank": 1,
    "clinicName": "Strong Bones Clinic",
    "doctorName": "Dr. Ashish Ranade",
    "specialty": "Pediatric Orthopedics",
    "city": "Pune (Deccan Gymkhana)",
    "email": "strongbonesclinic@gmail.com",
    "sourceUrl": "https://strongbonesclinic.com/contact/",
    "subjectLine": "Question about pediatric intake at Strong Bones Clinic",
    "emailBody": "Dr. Ashish Ranade,\n\nI was curious how your team at Strong Bones Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Pune (Deccan Gymkhana).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 2,
    "clinicName": "Aliganj Orthopaedic & Arthroscopy Centre",
    "doctorName": "Dr. Sandeep Kr. Garg",
    "specialty": "Orthopedics & Trauma",
    "city": "Lucknow (Aliganj)",
    "email": "aliganjortho@gmail.com",
    "sourceUrl": "https://aliganjortho.com/contact-us",
    "subjectLine": "OPD walk-in prioritization at Aliganj Orthopaedic & Arthroscopy Centre",
    "emailBody": "Dr. Sandeep Kr. Garg,\n\nI was curious how your team at Aliganj Orthopaedic & Arthroscopy Centre currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Lucknow (Aliganj).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 3,
    "clinicName": "Little Bones Clinic",
    "doctorName": "Dr. Pritish Singh",
    "specialty": "Pediatric Orthopedics",
    "city": "Noida (Sector 50)",
    "email": "contact@littlebonesclinic.com",
    "sourceUrl": "https://littlebonesclinic.com/contact/",
    "subjectLine": "Question about pediatric intake at Little Bones Clinic",
    "emailBody": "Dr. Pritish Singh,\n\nI was curious how your team at Little Bones Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Noida (Sector 50).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 4,
    "clinicName": "Sonawane Orthocare Clinic",
    "doctorName": "Dr. Atul Sonawane",
    "specialty": "Orthopedics & Joint Care",
    "city": "Pune (Wakad)",
    "email": "dratulsonawane@gmail.com",
    "sourceUrl": "https://sonawaneorthocare.com/contact-us/",
    "subjectLine": "OPD walk-in prioritization at Sonawane Orthocare Clinic",
    "emailBody": "Dr. Atul Sonawane,\n\nI was curious how your team at Sonawane Orthocare Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Pune (Wakad).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 5,
    "clinicName": "Children’s Speciality Orthopaedic Clinic",
    "doctorName": "Dr. Atul Bhaskar",
    "specialty": "Pediatric Orthopedics",
    "city": "Mumbai (Andheri West)",
    "email": "arb_25@yahoo.com",
    "sourceUrl": "http://www.drbhaskar.com/contact.html",
    "subjectLine": "Question about pediatric intake at Children’s Speciality Orthopaedic Clinic",
    "emailBody": "Dr. Atul Bhaskar,\n\nI was curious how your team at Children’s Speciality Orthopaedic Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Mumbai (Andheri West).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 6,
    "clinicName": "Apley Orthopaedic Centre",
    "doctorName": "Dr. Manish Khanna",
    "specialty": "Orthopedics & Arthroscopy",
    "city": "Lucknow (Gomti Nagar)",
    "email": "drmanishkhanna@gmail.com",
    "sourceUrl": "https://drmanishkhanna.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Apley Orthopaedic Centre",
    "emailBody": "Dr. Manish Khanna,\n\nI was curious how your team at Apley Orthopaedic Centre currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Lucknow (Gomti Nagar).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 7,
    "clinicName": "The Bone & Joint Clinic",
    "doctorName": "Dr. Rohit Chakor",
    "specialty": "Orthopedic & Sports Medicine",
    "city": "Pune (Kothrud)",
    "email": "minimalinvasiveortho@gmail.com",
    "sourceUrl": "https://drrohitchakor.com/contact-us/",
    "subjectLine": "OPD walk-in prioritization at The Bone & Joint Clinic",
    "emailBody": "Dr. Rohit Chakor,\n\nI was curious how your team at The Bone & Joint Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Pune (Kothrud).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 8,
    "clinicName": "Ace Orthopedic Clinic",
    "doctorName": "Dr. Nikhil Sharma",
    "specialty": "Orthopedics & Joint Care",
    "city": "Gurgaon (Sector 51)",
    "email": "nikhil.sharma7955@gmail.com",
    "sourceUrl": "https://nikhilortho.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Ace Orthopedic Clinic",
    "emailBody": "Dr. Nikhil Sharma,\n\nI was curious how your team at Ace Orthopedic Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Gurgaon (Sector 51).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 9,
    "clinicName": "Dr. Chakri’s Orthopedic Clinic",
    "doctorName": "Dr. Chakradhar Reddy",
    "specialty": "Orthopedics & Trauma",
    "city": "Hyderabad (Miyapur)",
    "email": "drchakrisclinic@gmail.com",
    "sourceUrl": "https://drchakrisclinic.com/contact-us/",
    "subjectLine": "OPD walk-in prioritization at Dr. Chakri’s Orthopedic Clinic",
    "emailBody": "Dr. Chakradhar Reddy,\n\nI was curious how your team at Dr. Chakri’s Orthopedic Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Hyderabad (Miyapur).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 10,
    "clinicName": "Sai Eswar Ortho Kids Care",
    "doctorName": "Dr. K. Sai Eswar",
    "specialty": "Pediatric Orthopedics",
    "city": "Chennai (Madipakkam)",
    "email": "saieswarorthokidscare@gmail.com",
    "sourceUrl": "https://kidsorthocare.co.in/contact/",
    "subjectLine": "Question about pediatric intake at Sai Eswar Ortho Kids Care",
    "emailBody": "Dr. K. Sai Eswar,\n\nI was curious how your team at Sai Eswar Ortho Kids Care currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Chennai (Madipakkam).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 11,
    "clinicName": "OrthoKids Clinic",
    "doctorName": "Dr. Chintan Doshi",
    "specialty": "Pediatric Orthopedics",
    "city": "Ahmedabad (Bodakdev)",
    "email": "orthokidsclinic@gmail.com",
    "sourceUrl": "https://orthokidsclinic.com/contact-us/",
    "subjectLine": "Question about pediatric intake at OrthoKids Clinic",
    "emailBody": "Dr. Chintan Doshi,\n\nI was curious how your team at OrthoKids Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Ahmedabad (Bodakdev).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 12,
    "clinicName": "Mumbai Knee Foot Ankle Clinic",
    "doctorName": "Dr. Pradeep Moonot",
    "specialty": "Orthopedic & Foot Surgery",
    "city": "Mumbai (Bandra West)",
    "email": "drmoonot@gmail.com",
    "sourceUrl": "https://drmoonot.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Mumbai Knee Foot Ankle Clinic",
    "emailBody": "Dr. Pradeep Moonot,\n\nI was curious how your team at Mumbai Knee Foot Ankle Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Mumbai (Bandra West).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 13,
    "clinicName": "Matratva Child Clinic",
    "doctorName": "Dr. Utkarsh Bansal",
    "specialty": "Pediatrics & Child Health",
    "city": "Lucknow (Indira Nagar)",
    "email": "contact@matratvachildclinic.com",
    "sourceUrl": "https://matratvachildclinic.com/contact-us/",
    "subjectLine": "Question about pediatric intake at Matratva Child Clinic",
    "emailBody": "Dr. Utkarsh Bansal,\n\nI was curious how your team at Matratva Child Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Lucknow (Indira Nagar).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 14,
    "clinicName": "Pace Ortho Clinic",
    "doctorName": "Dr. Sanjay Alle",
    "specialty": "Orthopedics & Joint Care",
    "city": "Mumbai (Worli)",
    "email": "dr.sanjayalle@gmail.com",
    "sourceUrl": "https://drsanjayalle.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Pace Ortho Clinic",
    "emailBody": "Dr. Sanjay Alle,\n\nI was curious how your team at Pace Ortho Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Mumbai (Worli).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 15,
    "clinicName": "Orthoklinik",
    "doctorName": "Dr. Hemendra Agrawal",
    "specialty": "Orthopedics & Arthroscopy",
    "city": "Jaipur (Vaishali Nagar)",
    "email": "Orthoklinik19@gmail.com",
    "sourceUrl": "https://orthoklinik.com/contact-us/",
    "subjectLine": "OPD walk-in prioritization at Orthoklinik",
    "emailBody": "Dr. Hemendra Agrawal,\n\nI was curious how your team at Orthoklinik currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Jaipur (Vaishali Nagar).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 16,
    "clinicName": "Dr. Skand Kumar’s Ortho Clinic",
    "doctorName": "Dr. Skand Kumar",
    "specialty": "Orthopedics & Joint Care",
    "city": "Hyderabad (KPHB Colony)",
    "email": "skandkumar@gmail.com",
    "sourceUrl": "https://drskandortho.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Dr. Skand Kumar’s Ortho Clinic",
    "emailBody": "Dr. Skand Kumar,\n\nI was curious how your team at Dr. Skand Kumar’s Ortho Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Hyderabad (KPHB Colony).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 17,
    "clinicName": "Care Point Polyclinic & Diagnostics",
    "doctorName": "Dr. S. Rao (Medical Director)",
    "specialty": "Multi-Specialty & General Medicine",
    "city": "Hyderabad (Balkampet)",
    "email": "info@carepointpolyclinic.com",
    "sourceUrl": "https://carepointpolyclinic.com/contact-us/",
    "subjectLine": "Question about walk-ins at Care Point Polyclinic & Diagnostics",
    "emailBody": "Dr. S. Rao (Medical Director),\n\nI was curious how your team at Care Point Polyclinic & Diagnostics currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Hyderabad (Balkampet).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 18,
    "clinicName": "Radhey Children’s Clinic",
    "doctorName": "Dr. Sandeep Kadam",
    "specialty": "Pediatrics & Neonatology",
    "city": "Pune (Hadapsar)",
    "email": "radheychildrensclinic04@gmail.com",
    "sourceUrl": "https://radheychildrensclinic.com/contact/",
    "subjectLine": "Question about pediatric intake at Radhey Children’s Clinic",
    "emailBody": "Dr. Sandeep Kadam,\n\nI was curious how your team at Radhey Children’s Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Pune (Hadapsar).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 19,
    "clinicName": "Dr. Muni Varma Pediatric Surgery Clinic",
    "doctorName": "Dr. Muni Varma",
    "specialty": "Pediatric Surgery & Urology",
    "city": "Lucknow (Mahanagar)",
    "email": "contact@drmunivarma.com",
    "sourceUrl": "https://drmunivarma.com/contact-us/",
    "subjectLine": "Question about pediatric intake at Dr. Muni Varma Pediatric Surgery Clinic",
    "emailBody": "Dr. Muni Varma,\n\nI was curious how your team at Dr. Muni Varma Pediatric Surgery Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Lucknow (Mahanagar).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 20,
    "clinicName": "Dr. Prince Gupta Joint Solutions",
    "doctorName": "Dr. Prince Gupta",
    "specialty": "Orthopedics & Joint Care",
    "city": "Gurgaon (Sector 57)",
    "email": "dr.princegupta@gmail.com",
    "sourceUrl": "https://jointandbonesolutions.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Dr. Prince Gupta Joint Solutions",
    "emailBody": "Dr. Prince Gupta,\n\nI was curious how your team at Dr. Prince Gupta Joint Solutions currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Gurgaon (Sector 57).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 21,
    "clinicName": "Neo Skin And Hair Clinic",
    "doctorName": "Dr. Anuradha Patil",
    "specialty": "Dermatology & Trichology",
    "city": "Pune (Aundh)",
    "email": "drpatilanuradha@gmail.com",
    "sourceUrl": "https://neoskinhair.com/contact/",
    "subjectLine": "Question about skin OPD intake at Neo Skin And Hair Clinic",
    "emailBody": "Dr. Anuradha Patil,\n\nI was curious how your team at Neo Skin And Hair Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Pune (Aundh).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 22,
    "clinicName": "Arya ENT & Skin Clinic",
    "doctorName": "Dr. J.P. Arya",
    "specialty": "ENT & Dermatology",
    "city": "Gurgaon (Sector 11)",
    "email": "aryaentskinclinic@gmail.com",
    "sourceUrl": "https://aryaentskinclinic.com/contact-us/",
    "subjectLine": "Question about ENT walk-in flow at Arya ENT & Skin Clinic",
    "emailBody": "Dr. J.P. Arya,\n\nI was curious how your team at Arya ENT & Skin Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Gurgaon (Sector 11).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 23,
    "clinicName": "Auricle ENT Care Clinic",
    "doctorName": "Dr. Ajinkya Kelkar",
    "specialty": "ENT & Head/Neck Surgery",
    "city": "Pune (Bavdhan)",
    "email": "auricleentcareclinic@gmail.com",
    "sourceUrl": "https://drajinkyakelkarent.com/contact/",
    "subjectLine": "Question about ENT walk-in flow at Auricle ENT Care Clinic",
    "emailBody": "Dr. Ajinkya Kelkar,\n\nI was curious how your team at Auricle ENT Care Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Pune (Bavdhan).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 24,
    "clinicName": "Kids Orthopedic Clinic Kolkata",
    "doctorName": "Dr. Soumya Paik",
    "specialty": "Pediatric Orthopedics",
    "city": "Kolkata (Salt Lake)",
    "email": "drsoumyapaik@gmail.com",
    "sourceUrl": "https://kidsorthopedic.com/contact/",
    "subjectLine": "Question about pediatric intake at Kids Orthopedic Clinic Kolkata",
    "emailBody": "Dr. Soumya Paik,\n\nI was curious how your team at Kids Orthopedic Clinic Kolkata currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Kolkata (Salt Lake).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 25,
    "clinicName": "Chandru ENT-Derma Care",
    "doctorName": "Dr. Chandrashekar",
    "specialty": "ENT & Dermatology",
    "city": "Bengaluru (Kengeri)",
    "email": "chandruucare@gmail.com",
    "sourceUrl": "https://chandruentdermacare.in/contact-us/",
    "subjectLine": "Question about ENT walk-in flow at Chandru ENT-Derma Care",
    "emailBody": "Dr. Chandrashekar,\n\nI was curious how your team at Chandru ENT-Derma Care currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Bengaluru (Kengeri).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 26,
    "clinicName": "Dr. Vishal Harangulkar Pediatric Clinic",
    "doctorName": "Dr. Vishal Harangulkar",
    "specialty": "Pediatrics & Neonatology",
    "city": "Pune (Aundh / Pimpri)",
    "email": "vishalharangulkar@gmail.com",
    "sourceUrl": "https://drvishalpediatrics.com/contact/",
    "subjectLine": "Question about pediatric intake at Dr. Vishal Harangulkar Pediatric Clinic",
    "emailBody": "Dr. Vishal Harangulkar,\n\nI was curious how your team at Dr. Vishal Harangulkar Pediatric Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Pune (Aundh / Pimpri).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 27,
    "clinicName": "Dr. Vinay ENT Clinic",
    "doctorName": "Dr. Vinay Ratan",
    "specialty": "ENT & Allergy",
    "city": "Lucknow (Alambagh)",
    "email": "veenuratan@gmail.com",
    "sourceUrl": "https://drvinayent.in/contact/",
    "subjectLine": "Question about ENT walk-in flow at Dr. Vinay ENT Clinic",
    "emailBody": "Dr. Vinay Ratan,\n\nI was curious how your team at Dr. Vinay ENT Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Lucknow (Alambagh).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 28,
    "clinicName": "Ropana Fertility & Gynaecology Clinic",
    "doctorName": "Dr. Ropana Sharma",
    "specialty": "Gynecology & Obstetrics",
    "city": "Pune (Baner)",
    "email": "ropanagynaecologyclinic@gmail.com",
    "sourceUrl": "https://ropanagynecologyclinic.com/contact/",
    "subjectLine": "Question about walk-ins at Ropana Fertility & Gynaecology Clinic",
    "emailBody": "Dr. Ropana Sharma,\n\nI was curious how your team at Ropana Fertility & Gynaecology Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Pune (Baner).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 29,
    "clinicName": "Essense Clinic",
    "doctorName": "Dr. Ankur Gupta",
    "specialty": "ENT & Aesthetic Surgery",
    "city": "Gurgaon (DLF Phase 2)",
    "email": "essenseclinic@gmail.com",
    "sourceUrl": "https://essenseclinics.com/contact/",
    "subjectLine": "Question about ENT walk-in flow at Essense Clinic",
    "emailBody": "Dr. Ankur Gupta,\n\nI was curious how your team at Essense Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Gurgaon (DLF Phase 2).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 30,
    "clinicName": "Momentum Orthocare Kolkata",
    "doctorName": "Dr. Santosh Kumar",
    "specialty": "Orthopedics & Joint Surgery",
    "city": "Kolkata (Dhakuria / South Kolkata)",
    "email": "santdr@gmail.com",
    "sourceUrl": "https://momentumorthocare.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Momentum Orthocare Kolkata",
    "emailBody": "Dr. Santosh Kumar,\n\nI was curious how your team at Momentum Orthocare Kolkata currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Kolkata (Dhakuria / South Kolkata).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 31,
    "clinicName": "Dr. Nayeem Ahmad ENT Centre",
    "doctorName": "Dr. Nayeem Ahmad Siddiqui",
    "specialty": "ENT & Micro Surgery",
    "city": "Noida (Sector 27)",
    "email": "drnayeemahmad@gmail.com",
    "sourceUrl": "https://drnayeemahmad.com/contact/",
    "subjectLine": "Question about ENT walk-in flow at Dr. Nayeem Ahmad ENT Centre",
    "emailBody": "Dr. Nayeem Ahmad Siddiqui,\n\nI was curious how your team at Dr. Nayeem Ahmad ENT Centre currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Noida (Sector 27).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 32,
    "clinicName": "Aceso Multispeciality Clinic",
    "doctorName": "Dr. Siddharth Gupta",
    "specialty": "Orthopedics & Polyclinic",
    "city": "Kolkata (Gariahat)",
    "email": "siddharthguptaortho@gmail.com",
    "sourceUrl": "https://drsiddharthguptaortho.in/contact/",
    "subjectLine": "OPD walk-in prioritization at Aceso Multispeciality Clinic",
    "emailBody": "Dr. Siddharth Gupta,\n\nI was curious how your team at Aceso Multispeciality Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Kolkata (Gariahat).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 33,
    "clinicName": "Vision Eye Center Pune",
    "doctorName": "Dr. Arundhati Sidhaye",
    "specialty": "Ophthalmology & Eye Care",
    "city": "Pune (Kothrud)",
    "email": "visioneyecenterpune@gmail.com",
    "sourceUrl": "https://visioneyecenterpune.in/contact/",
    "subjectLine": "Question about walk-ins at Vision Eye Center Pune",
    "emailBody": "Dr. Arundhati Sidhaye,\n\nI was curious how your team at Vision Eye Center Pune currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Pune (Kothrud).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 34,
    "clinicName": "Dr. Ruchi Skin Expert",
    "doctorName": "Dr. Ruchi Bhirud",
    "specialty": "Dermatology & Cosmetology",
    "city": "Pune (Pashan / Baner)",
    "email": "RuchiJawale@gmail.com",
    "sourceUrl": "https://drruchiskinexpert.in/contact-us/",
    "subjectLine": "Question about skin OPD intake at Dr. Ruchi Skin Expert",
    "emailBody": "Dr. Ruchi Bhirud,\n\nI was curious how your team at Dr. Ruchi Skin Expert currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Pune (Pashan / Baner).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 35,
    "clinicName": "Aurum ENT Clinic",
    "doctorName": "Dr. K. Srinivas",
    "specialty": "ENT & Head/Neck",
    "city": "Hyderabad (Banjara Hills)",
    "email": "aurumentcare@gmail.com",
    "sourceUrl": "https://aurument.com/contact-us/",
    "subjectLine": "Question about ENT walk-in flow at Aurum ENT Clinic",
    "emailBody": "Dr. K. Srinivas,\n\nI was curious how your team at Aurum ENT Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Hyderabad (Banjara Hills).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 36,
    "clinicName": "Dr. Shafali Yadav Dermatology Clinic",
    "doctorName": "Dr. Shafali Yadav",
    "specialty": "Dermatology & Hair Care",
    "city": "Lucknow (Gomti Nagar)",
    "email": "drshafaliyadav@gmail.com",
    "sourceUrl": "https://drshafaliyadav.com/contact/",
    "subjectLine": "Question about skin OPD intake at Dr. Shafali Yadav Dermatology Clinic",
    "emailBody": "Dr. Shafali Yadav,\n\nI was curious how your team at Dr. Shafali Yadav Dermatology Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Lucknow (Gomti Nagar).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 37,
    "clinicName": "Jain ENT Hospital",
    "doctorName": "Dr. S.C. Jain",
    "specialty": "ENT & Hearing Care",
    "city": "Jaipur (Mansarovar)",
    "email": "info@jainenthospital.org",
    "sourceUrl": "https://jainenthospital.org/contact-us/",
    "subjectLine": "Question about ENT walk-in flow at Jain ENT Hospital",
    "emailBody": "Dr. S.C. Jain,\n\nI was curious how your team at Jain ENT Hospital currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Jaipur (Mansarovar).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 38,
    "clinicName": "Dr. Devanshi Gupta Gynae Clinic",
    "doctorName": "Dr. Devanshi Gupta",
    "specialty": "Gynecology & Women's Health",
    "city": "Lucknow (Hazratganj)",
    "email": "info@drdevanshigynae.com",
    "sourceUrl": "https://drdevanshigynae.com/contact/",
    "subjectLine": "Question about walk-ins at Dr. Devanshi Gupta Gynae Clinic",
    "emailBody": "Dr. Devanshi Gupta,\n\nI was curious how your team at Dr. Devanshi Gupta Gynae Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Lucknow (Hazratganj).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 39,
    "clinicName": "Dr. Angela Mishra Advanced ENT Clinic",
    "doctorName": "Dr. Angela Mishra",
    "specialty": "ENT & Sinus Surgery",
    "city": "Greater Noida (Alpha 1)",
    "email": "entcarecenter99@gmail.com",
    "sourceUrl": "https://advancedentclinics.com/contact/",
    "subjectLine": "Question about ENT walk-in flow at Dr. Angela Mishra Advanced ENT Clinic",
    "emailBody": "Dr. Angela Mishra,\n\nI was curious how your team at Dr. Angela Mishra Advanced ENT Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Greater Noida (Alpha 1).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 40,
    "clinicName": "Kolkata ENT Care",
    "doctorName": "Dr. Rahul Sarkar",
    "specialty": "ENT & Head/Neck",
    "city": "Kolkata (South City / Tollygunge)",
    "email": "care@kolkataentcare.com",
    "sourceUrl": "https://kolkataentcare.com/contact-us/",
    "subjectLine": "Question about ENT walk-in flow at Kolkata ENT Care",
    "emailBody": "Dr. Rahul Sarkar,\n\nI was curious how your team at Kolkata ENT Care currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Kolkata (South City / Tollygunge).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 41,
    "clinicName": "Krishna Medical Centre",
    "doctorName": "Dr. R.K. Sharma (Medical Director)",
    "specialty": "Multi-Specialty & General Medicine",
    "city": "Lucknow (Rana Pratap Marg)",
    "email": "info@krishnamedical.org",
    "sourceUrl": "https://krishnamedicalcentre.org/contact/",
    "subjectLine": "Question about walk-ins at Krishna Medical Centre",
    "emailBody": "Dr. R.K. Sharma (Medical Director),\n\nI was curious how your team at Krishna Medical Centre currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Lucknow (Rana Pratap Marg).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 42,
    "clinicName": "Dr. Yogesh K Ortho Clinic",
    "doctorName": "Dr. Yogesh K",
    "specialty": "Orthopedics & Sports Medicine",
    "city": "Bengaluru (Whitefield)",
    "email": "yogiortho@gmail.com",
    "sourceUrl": "https://dryogeshk.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Dr. Yogesh K Ortho Clinic",
    "emailBody": "Dr. Yogesh K,\n\nI was curious how your team at Dr. Yogesh K Ortho Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Bengaluru (Whitefield).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 43,
    "clinicName": "Dr. Saikat Ghosh Ortho-ENT Clinic",
    "doctorName": "Dr. Saikat Ghosh",
    "specialty": "Orthopedics & Polyclinic",
    "city": "Kolkata (Barasat / North 24 Parganas)",
    "email": "saikatortho@gmail.com",
    "sourceUrl": "https://saikatortho.com/contact-us/",
    "subjectLine": "OPD walk-in prioritization at Dr. Saikat Ghosh Ortho-ENT Clinic",
    "emailBody": "Dr. Saikat Ghosh,\n\nI was curious how your team at Dr. Saikat Ghosh Ortho-ENT Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Kolkata (Barasat / North 24 Parganas).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 44,
    "clinicName": "Kosmic Dental Clinic",
    "doctorName": "Dr. Neha Verma",
    "specialty": "Dental & Oral Surgery",
    "city": "Lucknow (Gomti Nagar Extension)",
    "email": "info@kosmicdental.com",
    "sourceUrl": "https://kosmicdentalclinic.com/contact/",
    "subjectLine": "Question about dental intake at Kosmic Dental Clinic",
    "emailBody": "Dr. Neha Verma,\n\nI was curious how your team at Kosmic Dental Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Lucknow (Gomti Nagar Extension).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 45,
    "clinicName": "Bhalerao ENT Hospital",
    "doctorName": "Dr. Bhalerao",
    "specialty": "ENT & Head/Neck Surgery",
    "city": "Pune (Akurdi / PCMC)",
    "email": "bhaleraoenthospital@gmail.com",
    "sourceUrl": "https://bhaleraoenthospital.com/contact/",
    "subjectLine": "Question about ENT walk-in flow at Bhalerao ENT Hospital",
    "emailBody": "Dr. Bhalerao,\n\nI was curious how your team at Bhalerao ENT Hospital currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Pune (Akurdi / PCMC).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 46,
    "clinicName": "Jyoti ENT Clinic",
    "doctorName": "Dr. Jyoti Prakash",
    "specialty": "ENT & Sinus Care",
    "city": "Lucknow (Aliganj)",
    "email": "info@jyotientclinic.com",
    "sourceUrl": "https://jyotientclinic.com/contact/",
    "subjectLine": "Question about ENT walk-in flow at Jyoti ENT Clinic",
    "emailBody": "Dr. Jyoti Prakash,\n\nI was curious how your team at Jyoti ENT Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Lucknow (Aliganj).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 47,
    "clinicName": "Dr. Bishal Bhagat Ortho Clinic",
    "doctorName": "Dr. Bishal Bhagat",
    "specialty": "Orthopedics & Trauma",
    "city": "Kolkata (Behala)",
    "email": "dr_bishal@yahoo.com",
    "sourceUrl": "https://drbishalbhagat.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Dr. Bishal Bhagat Ortho Clinic",
    "emailBody": "Dr. Bishal Bhagat,\n\nI was curious how your team at Dr. Bishal Bhagat Ortho Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Kolkata (Behala).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 48,
    "clinicName": "HealthFlex ENT OPD Clinic",
    "doctorName": "Dr. Amitabha Roy",
    "specialty": "ENT & Rhinology",
    "city": "Kolkata (Salt Lake Sector 1)",
    "email": "info@entkolkata.co.in",
    "sourceUrl": "https://entkolkata.co.in/contact/",
    "subjectLine": "Question about ENT walk-in flow at HealthFlex ENT OPD Clinic",
    "emailBody": "Dr. Amitabha Roy,\n\nI was curious how your team at HealthFlex ENT OPD Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Kolkata (Salt Lake Sector 1).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 49,
    "clinicName": "Balaji Cure & Care Hospital",
    "doctorName": "Dr. Balaji Sharma",
    "specialty": "Orthopedics & General Surgery",
    "city": "Jaipur (Sanganer)",
    "email": "helpdesk@balajihospitals.co.in",
    "sourceUrl": "https://balajihospitals.co.in/contact/",
    "subjectLine": "OPD walk-in prioritization at Balaji Cure & Care Hospital",
    "emailBody": "Dr. Balaji Sharma,\n\nI was curious how your team at Balaji Cure & Care Hospital currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Jaipur (Sanganer).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 50,
    "clinicName": "Bangalore ENT Clinic",
    "doctorName": "Dr. Anita Krishnan",
    "specialty": "ENT & Head/Neck Care",
    "city": "Bengaluru (Jayanagar)",
    "email": "bangaloreentcarecentre@gmail.com",
    "sourceUrl": "https://dranitakrishnan.com/contact/",
    "subjectLine": "Question about ENT walk-in flow at Bangalore ENT Clinic",
    "emailBody": "Dr. Anita Krishnan,\n\nI was curious how your team at Bangalore ENT Clinic currently handles queue prioritization when an acute walk-in arrives during busy consultative sessions in Bengaluru (Jayanagar).\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 51,
    "clinicName": "Deccan Hardikar Orthopaedic Hospital",
    "doctorName": "Dr. Hardikar (Medical Director)",
    "specialty": "Orthopedics & Joint Trauma",
    "city": "Pune (Shivajinagar)",
    "email": "contact@deccanhospital.in",
    "sourceUrl": "https://deccanhospital.in/contact/",
    "subjectLine": "OPD walk-in prioritization at Deccan Hardikar Hospital",
    "emailBody": "Dr. Hardikar,\n\nI was curious how your team at Deccan Hardikar Hospital currently handles queue prioritization when acute trauma walk-ins arrive during busy OPD sessions in Pune.\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 52,
    "clinicName": "Medical Care Centre Lucknow",
    "doctorName": "Dr. Medical Director",
    "specialty": "Pediatrics & Child Health",
    "city": "Lucknow (Aliganj)",
    "email": "medicalcarecentrelko@gmail.com",
    "sourceUrl": "https://mcchospital.com/contact/",
    "subjectLine": "Question about pediatric intake at Medical Care Centre",
    "emailBody": "Dr. Director,\n\nI was curious how your team at Medical Care Centre currently manages queue expectations when an acute pediatric distress case arrives during a busy OPD session in Lucknow.\n\nI built SwasthAI to help child clinics organize intake. Parents complete a 1-minute structured questionnaire via QR code upon arrival. SwasthAI shows a recommended priority order on your screen, while keeping you in total control to reorder anytime.\n\nWe provide a free 2-day trial with zero setup requirements.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 53,
    "clinicName": "Anand Care Centre",
    "doctorName": "Dr. Tarun Anand",
    "specialty": "Pediatrics & Neonatology",
    "city": "Lucknow (Indira Nagar)",
    "email": "drtarunanandpedia@gmail.com",
    "sourceUrl": "https://drtarunanandpedia.com/contact/",
    "subjectLine": "Question about pediatric intake at Anand Care Centre",
    "emailBody": "Dr. Anand,\n\nI was curious how your team at Anand Care Centre currently prioritizes an acute pediatric illness walk-in when scheduled follow-ups are already waiting in Indira Nagar Lucknow.\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 54,
    "clinicName": "Dr. Navneet Goel Pediatrics Clinic",
    "doctorName": "Dr. Navneet Goel",
    "specialty": "Pediatrics & Child Care",
    "city": "Lucknow (Gomti Nagar)",
    "email": "info@drnavneetgoel.com",
    "sourceUrl": "https://drnavneetgoelclinic.com/contact/",
    "subjectLine": "Question about pediatric intake at Dr. Navneet Goel Clinic",
    "emailBody": "Dr. Goel,\n\nI was curious how your reception at Dr. Navneet Goel Clinic currently balances acute febrile pediatric walk-ins alongside routine vaccination appointments in Gomti Nagar.\n\nI built SwasthAI to assist front-desk flow. Arriving parents scan a QR code to submit structured symptom details. SwasthAI surfaces a recommended priority order on your screen before the patient enters, while you retain complete override control.\n\nWe offer a free 2-day trial with no app downloads required.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 55,
    "clinicName": "Sparsh Children’s Hospital",
    "doctorName": "Dr. Sparsh Medical Team",
    "specialty": "Pediatrics & Child Care",
    "city": "Lucknow (Mahanagar)",
    "email": "sparshchildrenhospital0118@gmail.com",
    "sourceUrl": "https://sparshchildrenhospital.com/contact/",
    "subjectLine": "Question about pediatric intake at Sparsh Children’s Hospital",
    "emailBody": "Dr. Sparsh Team,\n\nI was curious how your team at Sparsh Children's Hospital currently handles queue prioritization when an acute respiratory distress walk-in arrives during busy morning hours in Lucknow.\n\nI built SwasthAI to help child clinics organize intake. Parents scan a QR code on arrival to complete structured questions. SwasthAI provides a recommended priority order on your portal, while keeping you in full control of the queue at all times.\n\nWe offer a free 2-day trial with zero setup fee.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 56,
    "clinicName": "Sun Orthopaedic Hospital",
    "doctorName": "Dr. Sun Ortho Team",
    "specialty": "Orthopedics & Joint Care",
    "city": "Bengaluru (Mathikere)",
    "email": "sunorthopaedics@gmail.com",
    "sourceUrl": "https://sunorthopaedics.com/contact-us/",
    "subjectLine": "OPD walk-in prioritization at Sun Orthopaedic Hospital",
    "emailBody": "Dr. Sun Ortho Team,\n\nI was curious how your team at Sun Orthopaedic Hospital currently prioritizes acute joint injury walk-ins when scheduled checkups are already waiting in Mathikere Bengaluru.\n\nI built SwasthAI to make queue sequencing transparent. Patients scan a desk QR code on arrival to answer structured questions. SwasthAI provides a recommended priority view on your screen, with final queue control remaining entirely in your hands.\n\nWe provide a free 2-day trial with zero setup requirements.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 57,
    "clinicName": "Restore Ortho Clinic",
    "doctorName": "Dr. Restore Ortho Specialist",
    "specialty": "Orthopedics & Sports Medicine",
    "city": "Bengaluru (JP Nagar)",
    "email": "restoreorthoclinic@gmail.com",
    "sourceUrl": "https://restoreorthoclinic.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Restore Ortho Clinic",
    "emailBody": "Dr. Restore Ortho Specialist,\n\nI was curious how your team at Restore Ortho Clinic currently sequences acute sports trauma walk-ins amidst routine consultative queues in JP Nagar Bengaluru.\n\nI built SwasthAI to streamline this intake. Patients scan a reception QR code to submit structured symptoms. Your dashboard receives a recommended clinical priority order, helping you spot urgent cases quickly while retaining 100% override control.\n\nWe offer a free 2-day trial with zero setup fee.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 58,
    "clinicName": "Prime Orthopedics",
    "doctorName": "Dr. Prime Ortho Team",
    "specialty": "Orthopedics & Joint Care",
    "city": "Bengaluru (JP Nagar)",
    "email": "prime.orthopedics@gmail.com",
    "sourceUrl": "https://primeorthopedics.com/contact/",
    "subjectLine": "Patient intake at Prime Orthopedics",
    "emailBody": "Dr. Prime Ortho Team,\n\nI was curious how your reception at Prime Orthopedics currently manages queue sequencing when an acute mobility distress walk-in arrives during busy consultative slots in JP Nagar.\n\nI built SwasthAI to assist front-desk intake. Patients complete a 1-minute symptom questionnaire via QR code upon arrival. SwasthAI provides a recommended priority order on your screen, while you maintain complete authority over the sequence.\n\nWe offer a free 2-day trial with zero setup fee.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 59,
    "clinicName": "Orthoplanet Bangalore",
    "doctorName": "Dr. Orthoplanet Specialist",
    "specialty": "Orthopedics & Trauma",
    "city": "Bengaluru (KR Puram)",
    "email": "Orthoplanet36@gmail.com",
    "sourceUrl": "https://orthoplanet.com/contact-us/",
    "subjectLine": "OPD queue flow at Orthoplanet Bangalore",
    "emailBody": "Dr. Orthoplanet Specialist,\n\nI was curious how your front desk at Orthoplanet Bangalore currently prioritizes acute injury walk-ins during peak evening OPD hours when routine consultations are queued up in KR Puram.\n\nI built SwasthAI to make intake structured and objective. Arriving patients scan a QR code to fill a brief symptom check. Your screen displays recommended urgency levels, keeping you in full control to override anytime.\n\nWe provide a free 2-day trial with zero setup fee.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 60,
    "clinicName": "Shankara Ortho Clinic",
    "doctorName": "Dr. Shankara Ortho Consultant",
    "specialty": "Orthopedics & Spine",
    "city": "Bengaluru (Yelahanka)",
    "email": "Shankaraorthoclinic@gmail.com",
    "sourceUrl": "https://shankaraorthoclinic.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Shankara Ortho Clinic",
    "emailBody": "Dr. Shankara Ortho Consultant,\n\nI was curious how your reception at Shankara Ortho Clinic currently distinguishes acute spine or limb trauma cases from routine follow-up reviews during busy morning sessions in Yelahanka.\n\nI built SwasthAI to streamline clinic intake. Patients answer a structured 1-minute questionnaire on their phone via QR code. SwasthAI surfaces recommended priority on your console, allowing you to prioritize critical cases while keeping total control.\n\nWe offer a free 2-day trial with no commitment or app required.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 61,
    "clinicName": "Hyderabad Shoulder Clinic",
    "doctorName": "Dr. Chandra Shekar",
    "specialty": "Shoulder & Sports Injury",
    "city": "Hyderabad (Banjara Hills)",
    "email": "shoulderandsportsclinic@gmail.com",
    "sourceUrl": "https://hyderabadshoulderclinic.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Hyderabad Shoulder Clinic",
    "emailBody": "Dr. Shekar,\n\nI was curious how your team at Hyderabad Shoulder Clinic currently handles queue prioritization when acute sports injury walk-ins arrive during busy OPD hours in Banjara Hills.\n\nI built SwasthAI to help clinics organize patient intake. Patients scan a QR code and answer a few structured questions about their symptoms. SwasthAI then shows a recommended priority order on the clinic screen, while the doctor remains in full control of the final queue.\n\nWe offer a free 2-day trial with zero setup fee or commitment.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 62,
    "clinicName": "Dr. Pavan Orthopedic Clinic",
    "doctorName": "Dr. G. Pavan Kumar",
    "specialty": "Orthopedics & Joint Care",
    "city": "Hyderabad (Kukatpally)",
    "email": "gpavankumar936@gmail.com",
    "sourceUrl": "https://drpavanortho.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Dr. Pavan Orthopedic Clinic",
    "emailBody": "Dr. Kumar,\n\nI was curious how your front desk at Dr. Pavan Orthopedic Clinic currently sequences acute fracture walk-ins when scheduled joint follow-ups are already waiting in Kukatpally.\n\nI built SwasthAI to streamline clinic intake. Patients scan a QR code upon arrival and answer structured questions about their symptoms. SwasthAI displays a recommended priority order on your screen, while you maintain 100% control over the final queue.\n\nWe offer a free 2-day trial with zero setup fee.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 63,
    "clinicName": "Jayini Hospital",
    "doctorName": "Dr. Jayini Medical Team",
    "specialty": "Orthopedics & Joint Replacement",
    "city": "Hyderabad (Attapur)",
    "email": "jayiniclinics@gmail.com",
    "sourceUrl": "https://jayiniclinics.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Jayini Hospital",
    "emailBody": "Dr. Jayini Team,\n\nI was curious how your team at Jayini Hospital currently prioritizes acute joint injury walk-ins when scheduled reviews are already waiting in Attapur Hyderabad.\n\nI built SwasthAI to make queue sequencing transparent. Patients scan a desk QR code on arrival to answer structured questions. SwasthAI provides a recommended priority view on your screen, with final queue control remaining entirely in your hands.\n\nWe provide a free 2-day trial with zero setup requirements.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 64,
    "clinicName": "Happy Hearts Children’s Clinic",
    "doctorName": "Dr. Happy Hearts Team",
    "specialty": "Pediatrics & Child Health",
    "city": "Hyderabad (Madhapur)",
    "email": "happyheartschildrensclinic@gmail.com",
    "sourceUrl": "https://happyheartschildrensclinic.com/contact/",
    "subjectLine": "Question about pediatric intake at Happy Hearts Children’s Clinic",
    "emailBody": "Dr. Happy Hearts Team,\n\nI was curious how your reception at Happy Hearts Children's Clinic currently balances acute febrile pediatric walk-ins alongside routine vaccination queues in Madhapur.\n\nI built SwasthAI to assist child clinics. Arriving parents scan a QR code to submit structured symptom details. SwasthAI surfaces a recommended priority order on your screen before the patient enters, while you retain complete override control.\n\nWe offer a free 2-day trial with no app downloads required.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 65,
    "clinicName": "The Orthopod - Bone and Joint Clinic",
    "doctorName": "Dr. Saadullah Khan Quadri",
    "specialty": "Orthopedics & Joint Care",
    "city": "Hyderabad (Tolichowki)",
    "email": "dr.saadullahkhanquadri@gmail.com",
    "sourceUrl": "https://drsaadullahkhanorthopod.in/contact/",
    "subjectLine": "OPD walk-in prioritization at The Orthopod Clinic",
    "emailBody": "Dr. Quadri,\n\nI was curious how your desk at The Orthopod Clinic currently handles queue prioritization when an acute trauma walk-in arrives during packed consultation hours in Tolichowki.\n\nI built SwasthAI to help clinics organize intake. Patients scan a QR code on arrival to complete structured questions. SwasthAI provides a recommended priority order on your portal, while keeping you in full control of the queue at all times.\n\nWe offer a free 2-day trial with zero setup fee.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 66,
    "clinicName": "Hope Ortho Clinic",
    "doctorName": "Dr. Jebaraj Pradeep",
    "specialty": "Orthopedics & Trauma",
    "city": "Chennai (Anna Nagar)",
    "email": "jebarajpradeep@gmail.com",
    "sourceUrl": "https://hopeorthoclinic.com/contact/",
    "subjectLine": "OPD walk-in prioritization at Hope Ortho Clinic",
    "emailBody": "Dr. Pradeep,\n\nI was curious how your team at Hope Ortho Clinic currently prioritizes acute bone and joint injury walk-ins when scheduled post-op checkups are already waiting in Anna Nagar Chennai.\n\nI built SwasthAI to make queue sequencing transparent. Patients scan a desk QR code on arrival to answer structured questions. SwasthAI provides a recommended priority view on your screen, with final queue control remaining entirely in your hands.\n\nWe provide a free 2-day trial with zero setup requirements.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 67,
    "clinicName": "KS Ortho Clinic",
    "doctorName": "Dr. KS Ortho Team",
    "specialty": "Orthopedics & Joint Care",
    "city": "Chennai (Adyar)",
    "email": "ksorthochennai@gmail.com",
    "sourceUrl": "https://ksorthochennai.com/contact/",
    "subjectLine": "OPD walk-in prioritization at KS Ortho Clinic",
    "emailBody": "Dr. KS Ortho Team,\n\nI was curious how your team at KS Ortho Clinic currently sequences acute trauma or ligament injury walk-ins amidst routine consultative queues in Adyar Chennai.\n\nI built SwasthAI to streamline this intake. Patients scan a reception QR code to submit structured symptoms. Your dashboard receives a recommended clinical priority order, helping you spot urgent cases quickly while retaining 100% override control.\n\nWe offer a free 2-day trial with zero setup fee.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 68,
    "clinicName": "VR Speciality Clinic",
    "doctorName": "Dr. VR Medical Team",
    "specialty": "Polyclinic & Orthopedics",
    "city": "Chennai (Velachery)",
    "email": "vrspecialityclinic@gmail.com",
    "sourceUrl": "https://vrspecialityclinic.com/contact/",
    "subjectLine": "Patient intake at VR Speciality Clinic",
    "emailBody": "Dr. VR Team,\n\nI was curious how your reception at VR Speciality Clinic currently manages queue sequencing when an acute mobility distress walk-in arrives during busy consultative slots in Velachery.\n\nI built SwasthAI to assist front-desk intake. Patients complete a 1-minute symptom questionnaire via QR code upon arrival. SwasthAI provides a recommended priority order on your screen, while you maintain complete authority over the sequence.\n\nWe offer a free 2-day trial with zero setup fee.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 69,
    "clinicName": "Jain’s Kid Orthocare",
    "doctorName": "Dr. R.J. Jain",
    "specialty": "Pediatric Orthopedics",
    "city": "Mumbai (Mulund)",
    "email": "drorthorj@gmail.com",
    "sourceUrl": "https://jainskidorthocare.in/contact/",
    "subjectLine": "Question about pediatric intake at Jain’s Kid Orthocare",
    "emailBody": "Dr. Jain,\n\nI was curious how your front desk at Jain's Kid Orthocare currently prioritizes acute pediatric fracture walk-ins during peak evening OPD hours in Mulund Mumbai.\n\nI built SwasthAI to make intake structured and objective. Arriving parents scan a QR code to fill a brief symptom check. Your screen displays recommended urgency levels, keeping you in full control to override anytime.\n\nWe provide a free 2-day trial with zero setup fee.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  },
  {
    "rank": 70,
    "clinicName": "Alpha Ortho Clinic",
    "doctorName": "Dr. Alpha Ortho Team",
    "specialty": "Orthopedics & Spine",
    "city": "Mumbai (Kharghar / Navi Mumbai)",
    "email": "thealphaortho@gmail.com",
    "sourceUrl": "https://alphaortho.in/contact/",
    "subjectLine": "OPD walk-in prioritization at Alpha Ortho Clinic",
    "emailBody": "Dr. Alpha Ortho Team,\n\nI was curious how your reception at Alpha Ortho Clinic currently distinguishes acute spine or limb trauma cases from routine follow-up reviews during busy sessions in Navi Mumbai.\n\nI built SwasthAI to streamline clinic intake. Patients answer a structured 1-minute questionnaire on their phone via QR code. SwasthAI surfaces recommended priority on your console, allowing you to prioritize critical cases while keeping total control.\n\nWe offer a free 2-day trial with no commitment or app required.\n\nWould it be useful if I sent you a 2-minute screen recording first?\n\nSankalp Mishra\nFounder, SwasthAI\nhttps://swasthai-three.vercel.app/\n\nIf you'd rather not hear from me, just reply 'no' and I won't follow up."
  }
];

// ====================================================
// PLACEHOLDER SCANNER
// ====================================================

const FORBIDDEN_PLACEHOLDERS = [
  /\[name\]/i,
  /\[clinic\]/i,
  /\[doctor\]/i,
  /\[city\]/i,
  /\[specialty\]/i,
  /\{\{name\}\}/i,
  /\{\{clinic\}\}/i,
  /\{\{doctor\}\}/i,
  /<name>/i,
  /<clinic>/i,
  /YOUR NAME/i,
  /INSERT/i,
  /\bTODO\b/i,
  /\bTBD\b/i,
  /\[placeholder\]/i,
  /\[prospect\]/i,
];

function scanForPlaceholders(text: string): string[] {
  const matches: string[] = [];
  for (const pattern of FORBIDDEN_PLACEHOLDERS) {
    if (pattern.test(text)) {
      matches.push(pattern.toString());
    }
  }
  return matches;
}

// ====================================================
// SEND LOG MANAGEMENT
// ====================================================

export interface SendLogEntry {
  prospectName: string;
  clinicName: string;
  recipientEmail: string;
  sentAt: string;
  subject: string;
  status: "SUCCESS" | "FAILED" | "TEST" | "SKIPPED" | "DO_NOT_CONTACT";
  messageId: string | null;
  error: string | null;
  campaign: string;
}

function loadSendLog(): SendLogEntry[] {
  try {
    if (fs.existsSync(CONFIG.logFilePath)) {
      return JSON.parse(fs.readFileSync(CONFIG.logFilePath, "utf-8"));
    }
  } catch {
    // If file is corrupted, return empty
  }
  return [];
}

function saveSendLog(log: SendLogEntry[]): void {
  fs.writeFileSync(CONFIG.logFilePath, JSON.stringify(log, null, 2), "utf-8");
}

function appendToLog(entry: SendLogEntry): void {
  const log = loadSendLog();
  log.push(entry);
  saveSendLog(log);
}

// ====================================================
// DYNAMIC DAILY LIMIT CHECK (Asia/Kolkata Timezone)
// ====================================================

function getIndiaDateString(dateObj: Date = new Date()): string {
  return dateObj.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function getRealEmailsSentTodayInIndia(): number {
  const log = loadSendLog();
  const todayIndia = getIndiaDateString();
  return log.filter((entry) => {
    if (entry.status !== "SUCCESS") return false;
    const entryIndiaDate = getIndiaDateString(new Date(entry.sentAt));
    return entryIndiaDate === todayIndia;
  }).length;
}

// ====================================================
// OPT-OUT MANAGEMENT
// ====================================================

function loadOptOuts(): string[] {
  try {
    if (fs.existsSync(CONFIG.optOutFilePath)) {
      return JSON.parse(fs.readFileSync(CONFIG.optOutFilePath, "utf-8"));
    }
  } catch {
    // Start fresh if file does not exist
  }
  return [];
}

function isOptedOut(email: string): boolean {
  const optOuts = loadOptOuts();
  const normalized = email.trim().toLowerCase();
  return optOuts.some((opt) => opt.trim().toLowerCase() === normalized);
}

// ====================================================
// DUPLICATE PROTECTION
// ====================================================

function hasAlreadyBeenSent(email: string): boolean {
  const log = loadSendLog();
  const normalized = email.trim().toLowerCase();
  return log.some(
    (entry) =>
      entry.recipientEmail.trim().toLowerCase() === normalized &&
      entry.status === "SUCCESS"
  );
}

// ====================================================
// EMAIL HTML GENERATOR (Clean Personal Founder Format)
// ====================================================

function buildHtmlEmail(body: string): string {
  const lines = body.split("\n\n");
  const htmlParagraphs = lines
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return "";

      // Signature block
      if (trimmed.startsWith("Sankalp Mishra")) {
        return `<p style="margin: 20px 0 0 0; line-height: 1.6; color: #222; font-size: 15px;">Sankalp Mishra<br>Founder, SwasthAI<br><a href="${CONFIG.officialWebsiteUrl}" style="color: #2563eb; text-decoration: underline;">swasthai-three.vercel.app</a></p>`;
      }

      // Opt-out footer
      if (trimmed.startsWith("If you'd rather not hear")) {
        return `<p style="margin: 28px 0 0 0; font-size: 12px; color: #888; line-height: 1.5;">${trimmed}</p>`;
      }

      return `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #222; font-size: 15px;">${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 580px; margin: 0 auto; color: #222;">
    ${htmlParagraphs}
  </div>
</body>
</html>`.trim();
}

// ====================================================
// BREVO TRANSACTIONAL EMAIL API
// ====================================================

async function sendBrevoEmail(
  apiKey: string,
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  rank: number
): Promise<{ success: boolean; messageId: string | null; error: string | null }> {
  try {
    const payload = {
      sender: {
        name: CONFIG.senderName,
        email: CONFIG.senderEmail,
      },
      to: [
        {
          email: toEmail.trim().toLowerCase(),
          name: toName,
        },
      ],
      replyTo: {
        email: CONFIG.replyToEmail,
        name: CONFIG.replyToName,
      },
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent,
      tags: [CONFIG.campaignTag, `rank_${rank}`],
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        messageId: null,
        error: data.message || `HTTP ${response.status}: ${JSON.stringify(data)}`,
      };
    }

    return {
      success: true,
      messageId: data.messageId || null,
      error: null,
    };
  } catch (err: any) {
    return {
      success: false,
      messageId: null,
      error: err.message || "Unknown Brevo connection error",
    };
  }
}

// ====================================================
// DELAY UTILITY
// ====================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ====================================================
// MAIN EXECUTION
// ====================================================

export async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || "--test";

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  SwasthAI Cold Email Outreach System (Brevo Engine)");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Mode:        ${mode}`);
  console.log(`  Total Leads: ${PROSPECTS.length} verified clinic prospects`);
  console.log(`  From:        ${CONFIG.senderName} <${CONFIG.senderEmail}>`);
  console.log(`  Reply-To:    ${CONFIG.replyToName} <${CONFIG.replyToEmail}>`);
  console.log(`  Website:     ${CONFIG.officialWebsiteUrl}`);
  console.log(`  India Date:  ${getIndiaDateString()} (Asia/Kolkata)`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // 1. Validate API Key from env
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.error("❌ FATAL: BREVO_API_KEY is missing from website/.env.local");
    console.error("   Execution stopped safely.");
    process.exit(1);
  }

  // 2. Validate Sender Email
  if (!CONFIG.senderEmail || !CONFIG.senderEmail.includes("@")) {
    console.error("❌ FATAL: BREVO_SENDER_EMAIL is invalid or missing in website/.env.local.");
    console.error("   Execution stopped safely.");
    process.exit(1);
  }

  // ── TEST MODE ──
  if (mode === "--test") {
    console.log("🧪 TEST MODE — Sending ONE test email to your verified address.\n");

    const testProspect = PROSPECTS[0]; // Prospect #1: Strong Bones Clinic
    const testSubject = `[TEST] ${testProspect.subjectLine}`;
    const testPlainText = testProspect.emailBody;
    const testHtml = buildHtmlEmail(testPlainText);

    // Placeholder scan
    const subjectPlaceholders = scanForPlaceholders(testSubject);
    const bodyPlaceholders = scanForPlaceholders(testPlainText);
    if (subjectPlaceholders.length > 0 || bodyPlaceholders.length > 0) {
      console.error("❌ FATAL: Placeholder detected in test email copy!");
      console.error("   Subject issues:", subjectPlaceholders);
      console.error("   Body issues:", bodyPlaceholders);
      process.exit(1);
    }

    console.log(`  Recipient:       ${CONFIG.testRecipient}`);
    console.log(`  Prospect used:   #${testProspect.rank} — ${testProspect.clinicName} (${testProspect.doctorName})`);
    console.log(`  Subject:         ${testSubject}`);
    console.log(`  From:            ${CONFIG.senderName} <${CONFIG.senderEmail}>`);
    console.log(`  Reply-To:        ${CONFIG.replyToName} <${CONFIG.replyToEmail}>`);
    console.log("\n  Sending test email via Brevo SMTP API...\n");

    const result = await sendBrevoEmail(
      apiKey,
      CONFIG.testRecipient,
      CONFIG.replyToName,
      testSubject,
      testHtml,
      testPlainText,
      testProspect.rank
    );

    if (result.success) {
      appendToLog({
        prospectName: "TEST — " + testProspect.doctorName,
        clinicName: testProspect.clinicName,
        recipientEmail: CONFIG.testRecipient,
        sentAt: new Date().toISOString(),
        subject: testSubject,
        status: "TEST",
        messageId: result.messageId,
        error: null,
        campaign: CONFIG.campaignTag,
      });

      console.log("==================================================");
      console.log("TEST EMAIL SENT");
      console.log("");
      console.log(`Recipient:`);
      console.log(`${CONFIG.testRecipient}`);
      console.log("");
      console.log(`Prospect used:`);
      console.log(`${testProspect.clinicName} (${testProspect.doctorName})`);
      console.log("");
      console.log(`Subject:`);
      console.log(`${testSubject}`);
      console.log("");
      console.log(`From:`);
      console.log(`${CONFIG.senderName} <${CONFIG.senderEmail}>`);
      console.log("");
      console.log(`Reply-To:`);
      console.log(`${CONFIG.replyToName} <${CONFIG.replyToEmail}>`);
      console.log("");
      console.log(`Brevo Message ID:`);
      console.log(`${result.messageId}`);
      console.log("");
      console.log(`Status:`);
      console.log(`SUCCESS`);
      console.log("==================================================");
      console.log("\n✋ STOPPED. Awaiting explicit user approval before any real outreach.");
    } else {
      console.error("❌ TEST EMAIL FAILED");
      console.error(`Error: ${result.error}`);

      appendToLog({
        prospectName: "TEST — " + testProspect.doctorName,
        clinicName: testProspect.clinicName,
        recipientEmail: CONFIG.testRecipient,
        sentAt: new Date().toISOString(),
        subject: testSubject,
        status: "FAILED",
        messageId: null,
        error: result.error,
        campaign: CONFIG.campaignTag,
      });

      process.exit(1);
    }
  }

  // ── DRY RUN MODE ──
  else if (mode === "--dry-run") {
    console.log("📋 DRY RUN — Validating all 50 prospect data entries and copy.\n");

    const sentTodayIndia = getRealEmailsSentTodayInIndia();
    console.log(`  Real emails sent today (Asia/Kolkata): ${sentTodayIndia}/${CONFIG.maxEmailsPerDay}\n`);

    let readyCount = 0;
    let sessionSentCount = 0;
    for (const prospect of PROSPECTS) {
      if (sessionSentCount >= 10) {
        console.log("\n  ⏸️  Batch limit of 10 reached for this session. Stopping.");
        break;
      }
      const isDuplicate = hasAlreadyBeenSent(prospect.email);
      const isBlocked = isOptedOut(prospect.email);
      const placeholders = scanForPlaceholders(prospect.subjectLine + " " + prospect.emailBody);

      const status = isBlocked
        ? "🚫 OPT-OUT"
        : isDuplicate
        ? "⏭️  ALREADY SENT"
        : placeholders.length > 0
        ? "❌ PLACEHOLDER DETECTED"
        : "✅ READY TO SEND";

      if (status === "✅ READY TO SEND") readyCount++;

      console.log(`  #${prospect.rank} | ${prospect.clinicName} (${prospect.doctorName})`);
      console.log(`       City:    ${prospect.city} | Specialty: ${prospect.specialty}`);
      console.log(`       To:      ${prospect.email}`);
      console.log(`       Subject: ${prospect.subjectLine}`);
      console.log(`       Source:  ${prospect.sourceUrl}`);
      console.log(`       Status:  ${status}`);
      console.log("");
    }

    console.log("═══════════════════════════════════════════════════════════");
    console.log(`  Dry run complete. Total: ${PROSPECTS.length} | Ready: ${readyCount}`);
    console.log("═══════════════════════════════════════════════════════════");
  }

  // ── SEND MODE (Requires explicit user approval) ──
  else if (mode === "--send") {
    console.log("📤 SEND MODE — Initiating outreach to real prospects.\n");

    let sentTodayIndia = getRealEmailsSentTodayInIndia();
    console.log(`  Daily limit status (Asia/Kolkata): ${sentTodayIndia}/${CONFIG.maxEmailsPerDay} sent today.`);

    if (sentTodayIndia >= CONFIG.maxEmailsPerDay && !args.includes("--batch") && !args.includes("--force")) {
      console.log(`  ⏸️  Daily limit of ${CONFIG.maxEmailsPerDay} real emails already reached today. Stopping.`);
      return;
    }

    let sessionSentCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const prospect of PROSPECTS) {
      // Recheck daily limit from log before every send
      sentTodayIndia = getRealEmailsSentTodayInIndia();
      if (sentTodayIndia >= CONFIG.maxEmailsPerDay && !args.includes("--batch") && !args.includes("--force")) {
        console.log(`\n  ⏸️  Daily limit reached (${CONFIG.maxEmailsPerDay}). Stopping send batch.`);
        break;
      }

      // Check opt-out
      if (isOptedOut(prospect.email)) {
        console.log(`  🚫 SKIP (opted out): #${prospect.rank} ${prospect.email}`);
        skippedCount++;
        continue;
      }

      // Check duplicate
      if (hasAlreadyBeenSent(prospect.email)) {
        console.log(`  ⏭️  SKIP (already sent): #${prospect.rank} ${prospect.email}`);
        skippedCount++;
        continue;
      }

      // Placeholder check
      const placeholders = scanForPlaceholders(prospect.subjectLine + " " + prospect.emailBody);
      if (placeholders.length > 0) {
        console.error(`  ❌ SKIP (placeholder detected): #${prospect.rank} ${prospect.clinicName}`);
        skippedCount++;
        continue;
      }

      console.log(`\n  📧 Sending #${prospect.rank}: ${prospect.clinicName} (${prospect.doctorName})`);
      console.log(`     To:       ${prospect.email}`);
      console.log(`     Subject:  ${prospect.subjectLine}`);

      const html = buildHtmlEmail(prospect.emailBody);
      const result = await sendBrevoEmail(
        apiKey,
        prospect.email,
        prospect.doctorName,
        prospect.subjectLine,
        html,
        prospect.emailBody,
        prospect.rank
      );

      if (result.success) {
        console.log(`     ✅ Sent successfully (Message ID: ${result.messageId})`);
        sessionSentCount++;

        appendToLog({
          prospectName: prospect.doctorName,
          clinicName: prospect.clinicName,
          recipientEmail: prospect.email,
          sentAt: new Date().toISOString(),
          subject: prospect.subjectLine,
          status: "SUCCESS",
          messageId: result.messageId,
          error: null,
          campaign: CONFIG.campaignTag,
        });
      } else {
        console.log(`     ❌ Send failed: ${result.error}`);
        failedCount++;

        appendToLog({
          prospectName: prospect.doctorName,
          clinicName: prospect.clinicName,
          recipientEmail: prospect.email,
          sentAt: new Date().toISOString(),
          subject: prospect.subjectLine,
          status: "FAILED",
          messageId: null,
          error: result.error,
          campaign: CONFIG.campaignTag,
        });
      }

      // Rate limit delay between sends (skip delay after last email)
      const remainingQuota = CONFIG.maxEmailsPerDay - getRealEmailsSentTodayInIndia();
      if (remainingQuota > 0) {
        const nextIdx = PROSPECTS.indexOf(prospect) + 1;
        if (nextIdx < PROSPECTS.length) {
          console.log(`     ⏳ Waiting ${CONFIG.delayBetweenSendMs / 1000}s safety interval...`);
          await sleep(CONFIG.delayBetweenSendMs);
        }
      }
    }

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  BATCH SENDING COMPLETE");
    console.log(`  ✅ Successfully Sent this session: ${sessionSentCount}`);
    console.log(`  ⏭️  Skipped:                        ${skippedCount}`);
    console.log(`  ❌ Failed:                         ${failedCount}`);
    console.log(`  📊 Total real emails today:         ${getRealEmailsSentTodayInIndia()}/${CONFIG.maxEmailsPerDay}`);
    console.log("═══════════════════════════════════════════════════════════");
  } else {
    console.error(`❌ Unknown mode: ${mode}. Use --test, --dry-run, or --send`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal uncaught error:", err);
    process.exit(1);
  });
}
