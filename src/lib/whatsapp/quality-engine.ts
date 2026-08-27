/**
 * SwasthAI WhatsApp Outreach System — Message Quality & Safety Engine
 * ====================================================================
 * Rigorous 100-point scoring algorithm, placeholder scanner, hype detector,
 * and clinical boundaries enforcement.
 */

import { QualityScoreResult } from "./types";

// Patterns that identify unresolved template placeholders
const PLACEHOLDER_PATTERNS = [
  /\[[a-zA-Z0-9_\s]+\]/g, // e.g. [Doctor Name], [Clinic Name], [City]
  /\{\{[a-zA-Z0-9_\s]+\}\}/g, // e.g. {{doctorName}}, {{1}}
  /\{[a-zA-Z0-9_\s]+\}/g, // e.g. {name}
  /<[a-zA-Z0-9_\s]+>/g, // e.g. <Doctor>
  /undefined/gi,
  /null/gi,
  /\[insert\s+[^\]]+\]/gi
];

// Words and phrases banned in professional doctor outreach
const BANNED_HYPE_WORDS = [
  "revolutionary",
  "game-changing",
  "game changer",
  "cutting-edge",
  "cutting edge",
  "seamless",
  "seamlessly",
  "unlock",
  "unleash",
  "dear sir",
  "dear madam",
  "dear sir/madam",
  "guaranteed cure",
  "ai doctor",
  "replaces the doctor",
  "replaces doctor",
  "ai diagnosis",
  "autonomous diagnosis",
  "automated treatment",
  "growth hacking",
  "10x your clinic",
  "10x revenue",
  "skyrocket",
  "cheap software"
];

// Regex for emoji counting
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;

/**
 * Executes a full quality, safety, and compliance audit on any WhatsApp message.
 */
export function auditWhatsAppMessage(text: string, doctorName?: string, clinicName?: string): QualityScoreResult {
  const reasons: string[] = [];
  let passed = true;

  if (!text || !text.trim()) {
    return {
      overallScore: 0,
      personalizationScore: 0,
      clarityScore: 0,
      brevityScore: 0,
      spamRisk: "HIGH",
      wordCount: 0,
      emojiCount: 0,
      hasPlaceholders: true,
      detectedPlaceholders: ["Empty message text"],
      hasMedicalClaims: false,
      hasBannedWords: false,
      bannedWordsFound: [],
      reasons: ["Message is completely empty"],
      passed: false
    };
  }

  const cleanedText = text.trim();
  const words = cleanedText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. PLACEHOLDER SCAN (Zero Tolerance)
  const detectedPlaceholders: string[] = [];
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const matches = cleanedText.match(pattern);
    if (matches) {
      detectedPlaceholders.push(...matches);
    }
  }

  const hasPlaceholders = detectedPlaceholders.length > 0;
  if (hasPlaceholders) {
    passed = false;
    reasons.push(`CRITICAL: Detected unresolved placeholders: ${detectedPlaceholders.join(", ")}`);
  }

  // 2. BANNED HYPE WORDS SCAN
  const lowerText = cleanedText.toLowerCase();
  const bannedWordsFound: string[] = [];
  for (const banned of BANNED_HYPE_WORDS) {
    if (lowerText.includes(banned)) {
      bannedWordsFound.push(banned);
    }
  }

  const hasBannedWords = bannedWordsFound.length > 0;
  if (hasBannedWords) {
    passed = false;
    reasons.push(`Banned hype/spam phrases detected: ${bannedWordsFound.join(", ")}`);
  }

  // 3. MEDICAL CLAIMS & BOUNDARY SCAN
  const hasMedicalClaims =
    lowerText.includes("diagnose diseases") ||
    lowerText.includes("prescribes medicine") ||
    lowerText.includes("replaces clinical judgment") ||
    lowerText.includes("replaces doctor");

  if (hasMedicalClaims) {
    passed = false;
    reasons.push("Violation: Made unsupported medical diagnosis or treatment claims.");
  }

  // 4. EMOJI AUDIT (Max 2 emojis)
  const emojiMatches = cleanedText.match(EMOJI_REGEX) || [];
  const emojiCount = emojiMatches.length;
  if (emojiCount > 2) {
    passed = false;
    reasons.push(`Too many emojis (${emojiCount}). Maximum allowed for professional doctor outreach is 2.`);
  }

  // 5. WORD COUNT BOUNDS (70 - 120 target, max 150)
  let brevityScore = 100;
  if (wordCount < 40) {
    brevityScore -= 30;
    reasons.push(`Message is too brief (${wordCount} words).`);
  } else if (wordCount > 150) {
    brevityScore -= 40;
    passed = false;
    reasons.push(`Message exceeds maximum WhatsApp length (${wordCount} words > 150 words).`);
  } else if (wordCount > 125) {
    brevityScore -= 15;
  }

  // 6. PERSONALIZATION AUDIT
  let personalizationScore = 100;
  const hasDoctorName = doctorName ? lowerText.includes(doctorName.toLowerCase().replace(/^dr\.?\s*/i, "")) : false;
  const hasClinicName = clinicName ? lowerText.includes(clinicName.toLowerCase().slice(0, 8)) : false;

  if (!hasDoctorName && !lowerText.includes("dr.")) {
    personalizationScore -= 30;
    reasons.push("Missing doctor personalization prefix.");
  }
  if (!hasClinicName && !lowerText.includes("your clinic")) {
    personalizationScore -= 20;
    reasons.push("Missing clinic context.");
  }

  // 7. CLARITY & CTA QUALITY
  let clarityScore = 95;
  const hasClearCTA =
    lowerText.includes("2-minute demo") ||
    lowerText.includes("2-minute video") ||
    lowerText.includes("quick demo") ||
    lowerText.includes("how it works");

  if (!hasClearCTA) {
    clarityScore -= 25;
    reasons.push("Missing clear low-friction 2-minute demo CTA.");
  }

  const mentionsDoctorControl =
    lowerText.includes("doctor in control") ||
    lowerText.includes("doctor in full control") ||
    lowerText.includes("100% control") ||
    lowerText.includes("override control") ||
    lowerText.includes("override authority") ||
    lowerText.includes("how you consult");

  if (!mentionsDoctorControl) {
    clarityScore -= 10;
  }

  // 8. SPAM RISK CALCULATION
  let spamRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (hasPlaceholders || hasBannedWords || hasMedicalClaims || wordCount > 150) {
    spamRisk = "HIGH";
  } else if (emojiCount > 1 || wordCount > 130 || !hasClearCTA) {
    spamRisk = "MEDIUM";
  }

  // 9. OVERALL QUALITY SCORE (0 - 100)
  let overallScore = Math.round(
    clarityScore * 0.35 +
    personalizationScore * 0.35 +
    brevityScore * 0.30
  );

  if (hasPlaceholders) overallScore = Math.min(overallScore, 20);
  if (hasBannedWords) overallScore = Math.min(overallScore, 40);
  if (hasMedicalClaims) overallScore = Math.min(overallScore, 30);
  if (emojiCount > 2) overallScore = Math.min(overallScore, 50);

  overallScore = Math.max(0, Math.min(100, overallScore));

  if (overallScore < 70) {
    passed = false;
  }

  return {
    overallScore,
    personalizationScore: Math.max(0, Math.min(100, personalizationScore)),
    clarityScore: Math.max(0, Math.min(100, clarityScore)),
    brevityScore: Math.max(0, Math.min(100, brevityScore)),
    spamRisk,
    wordCount,
    emojiCount,
    hasPlaceholders,
    detectedPlaceholders,
    hasMedicalClaims,
    hasBannedWords,
    bannedWordsFound,
    reasons,
    passed
  };
}
