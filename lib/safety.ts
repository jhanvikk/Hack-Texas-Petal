export interface CrisisCheckResult {
  triggered: boolean;
  type?: "mental_health" | "medical_emergency";
  headline?: string;
  message?: string;
}

export interface ModerationResult {
  flagged: boolean;
  reason?: string;
  adviceSuggestion?: string;
}

// Crisis and Emergency Medical Keywords
const SUICIDE_KEYWORDS = [
  "kill myself",
  "suicide",
  "end it all",
  "want to die",
  "don't want to live",
  "dont want to live",
  "self-harm",
  "cutting myself",
  "take my own life",
];

const MEDICAL_EMERGENCY_PATTERNS = [
  /soak(?:ing)?\s+(?:a\s+)?pad\s+(?:in|every)\s+(?:an?\s+)?hour/i,
  /bleed(?:ing)?\s+through\s+(?:a\s+)?pad\s+(?:in|every)\s+(?:an?\s+)?hour/i,
  /faint(?:ed|ing)?\s+from\s+pain/i,
  /passed\s+out\s+from\s+pain/i,
  /unbearable\s+sudden\s+(?:stabbing\s+)?pain/i,
  /heavy\s+clots?\s+larger\s+than\s+a\s+quarter/i,
  /pregnancy\s+emergency/i,
  /possible\s+ectopic/i,
];

export function checkCrisisAndEmergency(text: string): CrisisCheckResult {
  const lower = text.toLowerCase();

  for (const phrase of SUICIDE_KEYWORDS) {
    if (lower.includes(phrase)) {
      return {
        triggered: true,
        type: "mental_health",
        headline: "You Are Not Alone. Immediate Support is Free & Confidential.",
        message:
          "If you are feeling overwhelmed, having thoughts of self-harm, or need someone to lean on right now, please reach out to the 988 Suicide & Crisis Lifeline. Call or text 988 (free, confidential, available 24/7 in the US & Canada).",
      };
    }
  }

  for (const regex of MEDICAL_EMERGENCY_PATTERNS) {
    if (regex.test(text)) {
      return {
        triggered: true,
        type: "medical_emergency",
        headline: "Urgent Medical Attention May Be Needed",
        message:
          "Severe bleeding (soaking through a pad or tampon in an hour or less), sudden fainting, or acute severe abdominal pain are red-flag symptoms that require immediate clinical evaluation. Please contact your doctor or visit your nearest Urgent Care or Emergency Room right away.",
      };
    }
  }

  return { triggered: false };
}

// PII Scrubber: strips emails, phone numbers, social handles, URLs
export function stripPII(text: string): string {
  let cleaned = text;

  // Emails
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[Email Removed]");

  // Phone numbers (US & international patterns)
  cleaned = cleaned.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[Phone Removed]");

  // URLs / Web links
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "[Link Removed]");

  // Social handles (@username)
  cleaned = cleaned.replace(/(?:^|\s)@([A-Za-z0-9_]{3,20})/g, " [Handle Removed]");

  return cleaned;
}

// Server & Client Moderation for Chat Messages
export function moderateChatMessage(text: string): ModerationResult {
  const lower = text.toLowerCase();

  // Red flags in chat (crisis)
  const crisis = checkCrisisAndEmergency(text);
  if (crisis.triggered) {
    return {
      flagged: true,
      reason: crisis.headline || "Crisis alert",
      adviceSuggestion:
        crisis.type === "mental_health"
          ? "Please call or text 988 for free, immediate crisis support."
          : "Please seek urgent medical care or emergency services right away.",
    };
  }

  // Medical Advice & Prescription directives
  const MED_ADVICE_PATTERNS = [
    /\b(?:take|drink|inject|dose|use)\s+\d+\s*(?:mg|ml|tablets?|pills?|capsules?|drops?)/i,
    /\b(?:you\s+should|you\s+must|you\s+need\s+to)\s+(?:take|stop\s+taking|switch\s+to)\s+(?:birth\s+control|progesterone|estrogen|ibuprofen|tylenol|spironolactone|metformin|antibiotics?|medication|pills?)/i,
    /\b(?:stop|discontinue)\s+(?:your\s+)?(?:medication|treatment|prescriptions?|pills?)/i,
    /\byou\s+(?:definitely|clearly|probably)?\s+have\s+(?:endometriosis|pcos|cancer|fibroids|adenomyosis|cysts?)\b/i,
  ];

  for (const pattern of MED_ADVICE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        flagged: true,
        reason: "Medical advice or prescription dosage detected.",
        adviceSuggestion:
          "Petal is for sharing lived experiences ('What helped me personally was...'), not prescribing medications or diagnosing. Please speak with your licensed clinician before changing treatments.",
      };
    }
  }

  // Harassment / Hate speech
  const HARASSMENT_TERMS = ["hate you", "freak", "stupid", "disgusting", "shut up", "bitch", "ugly"];
  for (const term of HARASSMENT_TERMS) {
    if (lower.includes(term)) {
      return {
        flagged: true,
        reason: "Disrespectful or unkind language detected.",
        adviceSuggestion:
          "Petal is a gentle, supportive sanctuary. Please keep all conversations compassionate and respectful.",
      };
    }
  }

  return { flagged: false };
}
