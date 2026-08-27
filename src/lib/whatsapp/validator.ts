/**
 * SwasthAI WhatsApp Outreach System — Phone & Prospect Validator
 * ================================================================
 * Validates, normalizes to E.164, and sanitizes input data.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalizedPhone: string; // "+91XXXXXXXXXX"
  countryCode: string; // "+91"
  nationalNumber: string; // "9876543210"
  error?: string;
}

/**
 * Normalizes any Indian or international phone number into standard E.164 format.
 * Defaults to India (+91) if country code is omitted on a 10-digit number.
 */
export function normalizePhoneNumber(rawInput: string | undefined | null): PhoneValidationResult {
  if (!rawInput || typeof rawInput !== "string") {
    return {
      isValid: false,
      normalizedPhone: "",
      countryCode: "",
      nationalNumber: "",
      error: "Phone number is empty or undefined"
    };
  }

  // Remove whitespace, hyphens, brackets, dots, plus signs for digit analysis
  const cleaned = rawInput.trim();
  const digitsOnly = cleaned.replace(/\D/g, "");

  if (digitsOnly.length === 0) {
    return {
      isValid: false,
      normalizedPhone: "",
      countryCode: "",
      nationalNumber: "",
      error: "Phone number contains no numeric digits"
    };
  }

  // Case 1: 10-digit Indian Phone Number (mobile or clinic landline)
  if (digitsOnly.length === 10) {
    return {
      isValid: true,
      normalizedPhone: `+91${digitsOnly}`,
      countryCode: "+91",
      nationalNumber: digitsOnly
    };
  }

  // Case 2: 12-digit Indian number starting with 91 (e.g. 919822038038)
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    const national = digitsOnly.slice(2);
    const firstDigit = national[0];
    if (!["6", "7", "8", "9"].includes(firstDigit)) {
      return {
        isValid: false,
        normalizedPhone: "",
        countryCode: "+91",
        nationalNumber: national,
        error: `Invalid Indian mobile number: national part must start with 6-9 (got ${firstDigit})`
      };
    }
    return {
      isValid: true,
      normalizedPhone: `+91${national}`,
      countryCode: "+91",
      nationalNumber: national
    };
  }

  // Case 3: 11-digit number with leading 0 (e.g. 09822038038)
  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    const national = digitsOnly.slice(1);
    const firstDigit = national[0];
    if (!["6", "7", "8", "9"].includes(firstDigit)) {
      return {
        isValid: false,
        normalizedPhone: "",
        countryCode: "+91",
        nationalNumber: national,
        error: `Invalid Indian mobile number after removing leading 0: got ${national}`
      };
    }
    return {
      isValid: true,
      normalizedPhone: `+91${national}`,
      countryCode: "+91",
      nationalNumber: national
    };
  }

  // Case 4: 10-12 digit Indian landline format (e.g. 020-27654321, 912027654321)
  if (digitsOnly.length >= 10 && digitsOnly.length <= 12) {
    let national = digitsOnly;
    if (national.startsWith("91") && national.length >= 11) {
      national = national.slice(2);
    } else if (national.startsWith("0")) {
      national = national.slice(1);
    }
    return {
      isValid: true,
      normalizedPhone: `+91${national}`,
      countryCode: "+91",
      nationalNumber: national
    };
  }

  // Other length / international formats
  return {
    isValid: false,
    normalizedPhone: "",
    countryCode: "",
    nationalNumber: digitsOnly,
    error: `Unsupported phone number length (${digitsOnly.length} digits). Expected Indian phone number.`
  };
}

/**
 * Sanitizes doctor names (ensures 'Dr.' prefix is clean and not duplicated)
 */
export function sanitizeDoctorName(name: string | undefined | null): string {
  if (!name || !name.trim()) return "Doctor";
  let cleaned = name.trim();
  // Strip duplicate 'Dr. Dr.' or 'Doctor Dr.'
  cleaned = cleaned.replace(/^(Dr\.?|Doctor)\s+/i, "");
  return `Dr. ${cleaned}`;
}

/**
 * Sanitizes clinic names
 */
export function sanitizeClinicName(name: string | undefined | null, city?: string): string {
  if (!name || !name.trim()) {
    return city ? `your clinic in ${city}` : "your clinic";
  }
  return name.trim();
}
