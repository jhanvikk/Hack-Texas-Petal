export interface SampleStory {
  id: string;
  alias: string;
  ageRange: string;
  duration: string;
  condition: string;
  supportGoal: string;
  summary: string;
  fullStoryCleaned: string;
  tags: string[];
  visitedClinicNames?: string[];
}

export const SAMPLE_STORIES: SampleStory[] = [
  {
    id: "sample-1",
    alias: "Quiet Willow",
    ageRange: "25-34",
    duration: "2-5 years",
    condition: "Endometriosis (Diagnosed)",
    supportGoal: "Coping tips & validation",
    summary: "Navigating deep pelvic pain and fatigue for 3+ years; seeking gentle coping routines and someone who understands chronic flare-ups.",
    fullStoryCleaned: "I was diagnosed with endometriosis three years ago after several doctor visits. The hardest part is the unpredictable flare-ups and feeling like no one in my immediate circle gets the level of exhaustion. Looking to connect with someone who shares daily coping strategies.",
    tags: ["Pelvic Pain", "Fatigue", "Endometriosis", "Daily Coping"],
  },
  {
    id: "sample-2",
    alias: "Mellow Meadow",
    ageRange: "18-24",
    duration: "6 months - 2 years",
    condition: "PCOS (Suspected)",
    supportGoal: "Doctor prep & advice",
    summary: "Experiencing irregular cycles and sudden adult acne; looking for encouragement on how to advocate for bloodwork with a new gynecologist.",
    fullStoryCleaned: "My cycles have been missing for months at a time, and I am nervous about an upcoming appointment with a new doctor. I want to know what questions to ask and how others got taken seriously.",
    tags: ["Irregular Cycles", "PCOS", "Doctor Advocacy", "Cycle Tracking"],
  },
  {
    id: "sample-3",
    alias: "Gentle Fern",
    ageRange: "25-34",
    duration: "5+ years",
    condition: "PMDD (Diagnosed)",
    supportGoal: "Emotional safe haven",
    summary: "Managing severe luteal phase mood drops and brain fog; seeking a judgment-free peer to check in with during tough weeks.",
    fullStoryCleaned: "Ten days before my period, my mood drops dramatically and simple tasks feel overwhelming. Once my cycle starts, the cloud clears. Looking for someone who experiences PMDD to exchange reassuring check-ins with.",
    tags: ["PMDD", "Mood Swings", "Luteal Phase", "Emotional Support"],
  },
  {
    id: "sample-4",
    alias: "Warm Amber",
    ageRange: "35-44",
    duration: "2-5 years",
    condition: "Heavy Menstrual Bleeding / Fibroids",
    supportGoal: "Workplace & life balance",
    summary: "Dealing with heavy bleeding and low ferritin while working full-time; wants practical tips for managing workdays during heavy cycles.",
    fullStoryCleaned: "Heavy flows have left me with low iron and anxiety about commuting or attending long meetings. Would love to hear how other professionals manage heavy days comfortably.",
    tags: ["Heavy Bleeding", "Fibroids", "Anemia", "Workplace Tips"],
  },
  {
    id: "sample-5",
    alias: "Silver Sage",
    ageRange: "45+",
    duration: "1-2 years",
    condition: "Perimenopause Transition",
    supportGoal: "Navigating change",
    summary: "Navigating unpredictable cycle timing, hot flashes, and sleep changes; looking for peers in a similar life transition.",
    fullStoryCleaned: "My periods went from like clockwork to completely unpredictable over the last year. Experiencing night sweats and brain fog. Would love peer solidarity in this transitional phase.",
    tags: ["Perimenopause", "Irregular Timing", "Sleep Changes", "Midlife Solidarity"],
  },
  {
    id: "sample-6",
    alias: "Sunlit River",
    ageRange: "18-24",
    duration: "2-5 years",
    condition: "Severe Dysmenorrhea",
    supportGoal: "Pain management support",
    summary: "Dealing with debilitating first-day cramps that impact college classes; looking for warmth and shared heat/nutrition self-care ideas.",
    fullStoryCleaned: "First two days of my period leave me in bed with debilitating cramps and nausea. Ultrasound was normal. I just need a peer who knows what it feels like to have your pain brushed off.",
    tags: ["Severe Cramps", "Dysmenorrhea", "School Support", "Pain Relief"],
  },
  {
    id: "sample-7",
    alias: "Calm Harbor",
    ageRange: "25-34",
    duration: "6 months - 2 years",
    condition: "Post-Birth Control Syndrome",
    supportGoal: "Cycle restoration",
    summary: "Stopped hormonal birth control 9 months ago and still waiting for regular periods; looking for peer encouragement and patience.",
    fullStoryCleaned: "Came off the pill last winter and my period hasn't returned yet. Lab tests look okay, but the waiting game feels very isolating. Just want someone to chat with who has been through post-pill recovery.",
    tags: ["Post-Pill", "Amenorrhea", "Hormonal Balance", "Patience"],
  },
  {
    id: "sample-8",
    alias: "Breezy Birch",
    ageRange: "25-34",
    duration: "5+ years",
    condition: "Adenomyosis (Suspected)",
    supportGoal: "Community validation",
    summary: "Navigating heavy pressure and prolonged periods; seeking a safe place to share feelings without feeling like a burden.",
    fullStoryCleaned: "Dealing with a heavy feeling in my lower abdomen and 8-9 day cycles. Family tells me periods are just supposed to hurt, but I know this isn't normal. Looking for validation and shared strength.",
    tags: ["Adenomyosis", "Long Cycles", "Family Understanding", "Validation"],
  },
  {
    id: "sample-9",
    alias: "Golden Clover",
    ageRange: "35-44",
    duration: "2-5 years",
    condition: "Endometriosis & Fertility Concerns",
    supportGoal: "Emotional solidarity",
    summary: "Balancing chronic pelvic discomfort with hopes for the future; seeking a caring companion who understands the dual emotional toll.",
    fullStoryCleaned: "Stage 2 endo has brought physical discomfort and emotional questions about family planning. I want a compassionate space to chat without unsolicited medical recommendations.",
    tags: ["Endometriosis", "Emotional Balance", "Future Planning", "Empathetic Listening"],
  },
  {
    id: "sample-10",
    alias: "Ocean Breeze",
    ageRange: "18-24",
    duration: "Under 6 months",
    condition: "Exploring / New to Symptoms",
    supportGoal: "Guidance on tracking",
    summary: "Recently began experiencing intense mood dips and pelvic aching; looking for a kind mentor who has navigated symptom tracking.",
    fullStoryCleaned: "My cycle symptoms changed rapidly this semester and I feel lost. Looking for someone who has successfully tracked their symptoms and can share how they learned to listen to their body.",
    tags: ["Symptom Tracking", "New Symptoms", "Mentorship", "Gentle Guidance"],
  },
];

export type MatchedStory = SampleStory & { score: number; why: string };