export const CLINIC_PRIORITIES = [
  "feeling heard",
  "longer appointments",
  "woman clinician",
  "knows the condition",
  "takes pain seriously",
] as const;

export type ClinicPriority = (typeof CLINIC_PRIORITIES)[number];

export type ClinicSymptom =
  | "heavy_bleeding"
  | "severe_cramps"
  | "irregular_cycles"
  | "pelvic_pain"
  | "pain_with_sex"
  | "fatigue"
  | "mood_changes_premenstrual"
  | "hot_flashes"
  | "spotting_between_periods"
  | "long_periods"
  | "clots";

export type SeveritySignal =
  | "soaking_pads_hourly"
  | "large_clots"
  | "fainting"
  | "dizziness_with_heavy_bleeding"
  | "severe_pain_with_pregnancy";

export interface ClinicProfile {
  symptoms: ClinicSymptom[];
  symptomLabels: string[];
  severitySignals: SeveritySignal[];
  priorities: ClinicPriority[];
  duration: string;
  ageRange: string;
  supportNeed: string;
  hintCondition: string | null;
  hasPriorDiagnosis: boolean;
  searchQueries: string[];
  zip: string;
}

export interface ClinicResult {
  name: string;
  rating: number | null;
  reviews: number;
  address: string;
  phone: string;
  website: string;
  hours: Record<string, string> | null;
  openState: string;
  placeId: string;
  lowCostOption: boolean;
  reviewSnippets: string[];
  fitScore: number;
  listeningScore: number;
  whyMatched: string;
}

const SYMPTOM_PATTERNS: Record<ClinicSymptom, RegExp> = {
  heavy_bleeding: /\b(?:heavy bleeding|heavy periods?|bleeding heavily|bleed(?:ing)? a lot|very heavy flow|soak(?:ing)? (?:through )?(?:a )?(?:pads?|tampons?)|flooding)\b/i,
  severe_cramps: /\b(?:severe|debilitating|unbearable|awful|terrible) cramps?\b|\bcramps? so bad\b|\b(?:can't|cannot|couldn't|could not) get out of bed from cramps\b|\bperiod pain.{0,24}(?:miss work|can't work|bedbound)\b/i,
  irregular_cycles: /\b(?:irregular|unpredictable|missed|skipped) (?:periods?|cycles?)\b|\bperiods? (?:(?:happen|come|occur) )?(?:every|once every) (?:two|2|three|3) months\b|\bcycles? (?:every|once every) (?:two|2|three|3) months\b|\bperiods? (?:won't|will not) come\b|\bperiods? (?:are )?two months apart\b/i,
  pelvic_pain: /\b(?:pelvic pain|pain in my pelvis|chronic pelvic|lower abdominal pain|endometriosis|adenomyosis)\b/i,
  pain_with_sex: /\b(?:pain during sex|pain with sex|painful sex|sex is painful|pain with intercourse|painful intercourse)\b/i,
  fatigue: /\b(?:fatigue|exhaust(?:ed|ion)|constant tiredness|worn out|no energy)\b/i,
  mood_changes_premenstrual: /\b(?:premenstrual|before my period|before periods?|before menstruation|pmdd|mood (?:changes?|swings?|crashes?).{0,30}(?:before|around) (?:my )?(?:period|cycle)|(?:before|around) (?:my )?(?:period|cycle).{0,30}mood (?:changes?|swings?|crashes?))\b/i,
  hot_flashes: /\b(?:hot flashes?|hot flushes?|night sweats?)\b/i,
  spotting_between_periods: /\b(?:spotting between periods?|bleeding between periods?|between-period spotting|intermenstrual bleeding)\b/i,
  long_periods: /\b(?:long|prolonged) periods?\b|\bperiods? (?:that )?(?:won't|will not|don't|do not|never) stop\b|\bbleed(?:ing)? for (?:more than|over) (?:a )?week\b/i,
  clots: /\b(?:blood clots?|clots? (?:during|with) (?:my )?period|passing clots?)\b/i,
};

const SYMPTOM_LABELS: Record<ClinicSymptom, string> = {
  heavy_bleeding: "heavy periods",
  severe_cramps: "severe cramps",
  irregular_cycles: "irregular cycles",
  pelvic_pain: "pelvic pain",
  pain_with_sex: "pain with sex",
  fatigue: "fatigue",
  mood_changes_premenstrual: "premenstrual mood changes",
  hot_flashes: "hot flashes",
  spotting_between_periods: "spotting between periods",
  long_periods: "long periods",
  clots: "blood clots",
};

const SYMPTOM_QUERIES: Partial<Record<ClinicSymptom, string>> = {
  heavy_bleeding: "abnormal uterine bleeding gynecologist",
  long_periods: "abnormal uterine bleeding gynecologist",
  clots: "abnormal uterine bleeding gynecologist",
  severe_cramps: "gynecologist pelvic pain",
  pelvic_pain: "gynecologist pelvic pain",
  pain_with_sex: "gynecologist pelvic pain",
  irregular_cycles: "gynecologist irregular periods",
  hot_flashes: "menopause specialist",
  mood_changes_premenstrual: "women's health PMDD",
};

const HINT_QUERIES: Record<string, string> = {
  Endometriosis: "endometriosis specialist gynecologist",
  PCOS: "PCOS specialist gynecologist",
  PMDD: "women's health PMDD",
  "Heavy Bleeding": "abnormal uterine bleeding gynecologist",
  "Severe Cramps": "gynecologist pelvic pain",
  Perimenopause: "menopause specialist",
};

const GENERIC_QUERIES = ["OBGYN", "women's health clinic"];

const SEVERITY_PATTERNS: Record<SeveritySignal, RegExp> = {
  soaking_pads_hourly: /\b(?:soak(?:ing)?\s+(?:through\s+)?(?:a\s+)?(?:pads?|tampons?)|bleed(?:ing)?\s+through\s+(?:a\s+)?(?:pads?|tampons?)).{0,24}\b(?:in|every|per)\s+(?:an?\s+|one\s+|1\s+)?hour\b|\b(?:pads?|tampons?)\s+(?:every|per)\s+hour\b/i,
  large_clots: /\b(?:large|golf[ -]ball[ -]sized|egg[ -]sized) clots?\b|\bclots? (?:larger|bigger) than a quarter\b/i,
  fainting: /\b(?:faint(?:ed|ing)?|passed out|black(?:ed)? out)\b/i,
  dizziness_with_heavy_bleeding: /\b(?:dizz(?:y|iness)|lightheaded)\b/i,
  severe_pain_with_pregnancy: /\b(?:pregnan\w*).{0,60}\b(?:severe|intense|unbearable)\s+(?:(?:abdominal|pelvic)\s+)?pain\b|\b(?:severe|intense|unbearable)\s+(?:(?:abdominal|pelvic)\s+)?pain.{0,60}\b(?:pregnan\w*)\b/i,
};

export function deriveClinicProfile(
  scrubbedStory: string,
  zip: string,
  details: { duration: string; ageRange: string; supportNeed: string; hintCondition: string },
): ClinicProfile {
  const normalized = scrubbedStory.toLowerCase();
  const symptoms = (Object.keys(SYMPTOM_PATTERNS) as ClinicSymptom[])
    .filter((symptom) => SYMPTOM_PATTERNS[symptom].test(normalized));
  const severitySignals = (Object.keys(SEVERITY_PATTERNS) as SeveritySignal[])
    .filter((signal) => SEVERITY_PATTERNS[signal].test(normalized));
  const hintCondition = details.hintCondition === "Exploring / Unsure" ? null : details.hintCondition;
  const searchQueries = buildSearchQueries(symptoms, details.ageRange, hintCondition);
  const priorities: ClinicPriority[] = [];

  if (/listen|heard|dismiss|taken seriously|believ/.test(normalized)) {
    priorities.push("feeling heard", "takes pain seriously");
  }
  if (/long appointment|more time|rushed|enough time|thorough/.test(normalized)) {
    priorities.push("longer appointments");
  }
  if (/woman doctor|female doctor|woman clinician|female clinician|prefer a woman/.test(normalized)) {
    priorities.push("woman clinician");
  }
  if (/specialist|knows? (?:about|the)|experienced with|understands? (?:my|this)/.test(normalized)) {
    priorities.push("knows the condition");
  }
  if (!priorities.length) priorities.push("feeling heard", "knows the condition");

  return {
    symptoms,
    symptomLabels: symptoms.map((symptom) => SYMPTOM_LABELS[symptom]),
    severitySignals: [...new Set(severitySignals)],
    priorities: [...new Set(priorities)],
    duration: details.duration,
    ageRange: details.ageRange,
    supportNeed: details.supportNeed,
    hintCondition,
    hasPriorDiagnosis: /\b(?:diagnosed with|my diagnosis of|doctor confirmed|was diagnosed|received a diagnosis)\b/i.test(normalized)
      && !/\b(?:never|not|no) (?:been )?diagnosed\b/i.test(normalized),
    searchQueries,
    zip,
  };
}

function buildSearchQueries(symptoms: ClinicSymptom[], ageRange: string, hintCondition: string | null): string[] {
  const weights = new Map<string, number>();
  for (const symptom of symptoms) {
    const query = SYMPTOM_QUERIES[symptom];
    if (query) weights.set(query, (weights.get(query) || 0) + 1);
  }
  if (ageRange === "45+") weights.set("menopause specialist", (weights.get("menopause specialist") || 0) + 1);
  const hintQuery = hintCondition ? HINT_QUERIES[hintCondition] : undefined;
  if (hintQuery) weights.set(hintQuery, (weights.get(hintQuery) || 0) + 2);

  if (!weights.size) return GENERIC_QUERIES;
  const ranked = [...weights.entries()].sort((first, second) => second[1] - first[1]).map(([query]) => query);
  if (hintQuery && !ranked.slice(0, 2).includes(hintQuery)) ranked.splice(1, 0, hintQuery);
  if (ranked.length === 1) ranked.push("OBGYN");
  return ranked.slice(0, 2);
}

const POSITIVE_PHRASES = [
  "listened",
  "took me seriously",
  "heard",
  "thorough",
  "didn't dismiss",
  "did not dismiss",
  "took the time",
];
const NEGATIVE_PHRASES = ["dismissed", "rushed", "ignored", "brushed off"];

export function scoreClinics(clinics: ClinicResult[], profile: ClinicProfile): ClinicResult[] {
  const ranked = clinics
    .map((clinic) => {
      const snippets = clinic.reviewSnippets.map((review) => review.toLowerCase());
      const positiveReviews = snippets.filter((review) =>
        POSITIVE_PHRASES.some((phrase) => review.includes(phrase)),
      ).length;
      const negativeReviews = snippets.filter((review) =>
        NEGATIVE_PHRASES.some((phrase) => review.includes(phrase)),
      ).length;
      const listeningScore = snippets.length
        ? Math.max(0, Math.round((positiveReviews / snippets.length) * 30 - (negativeReviews / snippets.length) * 15))
        : 0;
      const ratingScore = clinic.rating == null
        ? 0
        : (clinic.rating / 5) * 40 * (clinic.reviews < 10 ? clinic.reviews / 10 : 1);
      const reviewText = snippets.join(" ");
      const searchableText = `${clinic.name} ${reviewText}`.toLowerCase();
      const queryTerms = profile.searchQueries.join(" ").toLowerCase().split(/\W+/)
        .filter((word) => word.length > 4 && !["specialist", "gynecologist", "women", "health"].includes(word));
      const specialtyMatch = queryTerms.some((word) => searchableText.includes(word));
      const matchedPriorities = profile.priorities.filter((priority) => {
        if (priority === "woman clinician") return /woman clinician|female physician|women's health provider/i.test(clinic.name);
        if (priority === "longer appointments") return /took the time|never rushed|long appointment|unhurried/i.test(reviewText);
        if (priority === "feeling heard") return positiveReviews > 0;
        if (priority === "takes pain seriously") return /pain seriously|took my pain|didn't dismiss my pain|did not dismiss my pain/i.test(reviewText);
        return specialtyMatch;
      }).length;
      const priorityScore = profile.priorities.length
        ? Math.round((matchedPriorities / profile.priorities.length) * 20)
        : 0;
      const openNow = /^open\b/i.test(clinic.openState);
      const opensWithinDay = openNow
        || /\bopens?\s+(?:today|tomorrow|within 24 hours|in (?:\d+\s*)?(?:minutes?|hours?)|at \d{1,2}(?::\d{2})?\s*(?:am|pm))/i.test(clinic.openState);
      const openScore = opensWithinDay ? 10 : 0;
      const fitScore = Math.max(0, Math.min(100, Math.round(ratingScore + listeningScore + priorityScore + openScore)));
      return {
        ...clinic,
        fitScore,
        listeningScore,
        whyMatched: profile.symptomLabels.length
          ? `Matched for: ${profile.symptomLabels.slice(0, 3).join(", ")}`
          : "Matched for: women's health care",
      };
    })
    .sort((first, second) => second.fitScore - first.fitScore);

  const promotedLowCost = ranked.filter((clinic) => clinic.lowCostOption).slice(0, 2);
  for (const [index, clinic] of promotedLowCost.entries()) {
    const currentIndex = ranked.indexOf(clinic);
    const targetIndex = Math.min(index === 0 ? 2 : 4, ranked.length - 1);
    if (currentIndex > targetIndex) {
      ranked.splice(currentIndex, 1);
      ranked.splice(targetIndex, 0, clinic);
    }
  }
  return ranked;
}
