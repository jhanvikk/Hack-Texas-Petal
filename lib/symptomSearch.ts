export const STORY_CONDITIONS = [
  "Endometriosis",
  "PCOS",
  "PMDD",
  "Heavy Bleeding",
  "Severe Cramps",
  "Perimenopause",
  "Exploring / Unsure",
] as const;

export const SYMPTOM_SEARCH_PATTERNS = [
  { term: "pelvic pain", pattern: /pelvic (?:pain|ache|aching|soreness)|lower (?:abdominal|belly) (?:pain|ache)|pain in (?:my )?pelvis/i },
  { term: "menstrual cramps", pattern: /cramp(?:s|ing)?|dysmenorrhea|painful periods?|period pain/i },
  { term: "heavy menstrual bleeding", pattern: /heavy (?:periods?|bleeding|flow)|bleeding (?:a lot|heavily)|flow (?:is )?(?:really )?heavy|prolonged bleeding|flooding|menorrhagia/i },
  { term: "spotting or bleeding between periods", pattern: /spotting|bleeding between periods|bleeding in between|intermenstrual bleeding|breakthrough bleeding/i },
  { term: "long periods", pattern: /long periods?|periods? (?:lasting|last) (?:more than )?(?:7|eight|nine|\d+) days/i },
  { term: "irregular or missed periods", pattern: /irregular (?:cycles?|periods?)|cycles? (?:are )?all over the place|periods? (?:are )?all over the place|late periods?|periods? (?:are )?late|missed periods?|periods? (?:have )?not come|absent periods?|amenorrhea/i },
  { term: "fatigue", pattern: /fatigue|exhaust(?:ed|ion)|worn out|low energy|tired all the time/i },
  { term: "hot flashes and night sweats", pattern: /hot flashes?|night sweats/i },
  { term: "nausea", pattern: /nause(?:a|ous|ated|ating)|queas(?:y|iness)|sick to (?:my|the) stomach|stomach (?:is )?upset|vomit(?:ing)?|throwing up|threw up/i },
  { term: "dizziness or lightheadedness", pattern: /dizz(?:y|iness)|light[- ]?headed|vertigo|feel faint|(?:the )?room (?:is )?spinning/i },
  { term: "headaches or migraines", pattern: /headaches?|migraines?/i },
  { term: "bloating", pattern: /bloating|bloat/i },
  { term: "bowel changes", pattern: /diarrhea|constipation|bowel changes?/i },
  { term: "pain during sex", pattern: /painful sex|pain during sex|dyspareunia/i },
  { term: "breast tenderness", pattern: /breast tenderness|tender breasts?/i },
  { term: "lower back pain", pattern: /lower back pain|lower back ache/i },
  { term: "acne", pattern: /acne/i },
  { term: "premenstrual mood changes", pattern: /mood swings?|mood drops?|irritability|premenstrual depression/i },
] as const;

export type StoryCondition = (typeof STORY_CONDITIONS)[number];
export type SymptomSearchTerm = (typeof SYMPTOM_SEARCH_PATTERNS)[number]["term"];

export function extractSearchSymptoms(text: string): SymptomSearchTerm[] {
  return SYMPTOM_SEARCH_PATTERNS
    .filter(({ pattern }) => pattern.test(text))
    .map(({ term }) => term);
}