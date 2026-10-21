export type Mood = 'lake' | 'dusk' | 'sand';
export const moodNames: Record<Mood,string> = { lake:'Still water', dusk:'Evening hush', sand:'A little warmth' };
// A decorative response to words, never a classification of the person.
export function moodFromWords(text:string):Mood|null {
  const words=text.toLowerCase().replace(/[’]/g,"'").replace(/\b(?:not|never|no longer|isn't|aren't|don't feel|not feeling)\s+(?:very\s+|so\s+|really\s+)?(?:anxious|overwhelmed|stressed|sad|lonely|tired|exhausted|happy|calm|worried)\b/g,'');
  if (/\b(anxious|anxiety|overwhelmed|racing|panic|panicking|stressed|worried|worrying|restless)\b/.test(words)) return 'lake';
  if (/\b(sad|lonely|alone|grief|grieving|miss|missing|happy|hopeful|grateful|joy|lighter)\b/.test(words)) return 'sand';
  if (/\b(tired|exhausted|sleepy|sleep|drained|rest|quiet|calm|peaceful)\b/.test(words)) return 'dusk';
  return null;
}
