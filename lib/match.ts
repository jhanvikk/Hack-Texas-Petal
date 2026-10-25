import type { SampleStory } from "./sampleData";

export const toEmbedText = (s: { condition: string; duration: string; text: string }) =>
  `condition: ${s.condition}. duration: ${s.duration}. ${s.text.slice(0, 1500)}`;

const AGES = ["18-24", "25-34", "35-44", "45+"];
function ageCloseness(a: string, b: string) {
  const i = AGES.indexOf(a), j = AGES.indexOf(b);
  if (i < 0 || j < 0) return 0;
  const d = Math.abs(i - j);
  return d === 0 ? 1 : d === 1 ? 0.5 : 0;
}

// gte-small scores on short texts cluster high, so stretch them into a usable range.
// 0.75 is a starting guess: log a few real similarities and tune it.
export function finalScore(sim: number, myAge: string, theirAge: string) {
  const stretched = Math.min(1, Math.max(0, (sim - 0.75) / 0.25));
  return 0.85 * stretched + 0.15 * ageCloseness(myAge, theirAge);
}

export function whyText(user: { condition: string; ageRange: string }, peer: SampleStory) {
  const parts: string[] = [];
  if (peer.condition.toLowerCase().includes(user.condition.toLowerCase()))
    parts.push(`you both mentioned ${user.condition.toLowerCase()}`);
  if (peer.ageRange === user.ageRange) parts.push("you're at a similar life stage");
  return parts.length
    ? `Matched because ${parts.join(" and ")}.`
    : "Your stories describe similar experiences.";
}