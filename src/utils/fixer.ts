import riskDictionary from '../data/risk_dictionary.json';
import roleTemplates from '../data/role_templates.json';

// --- DICTIONARY ---
const REPLACEMENTS: Record<string, string> = {
  "ninja": "Specialist",
  "guru": "Subject Matter Expert",
  "rockstar": "High Performer",
  "wizard": "Expert",
  "magician": "Expert",
  "recent graduate": "Entry-level candidate",
  "digital native": "Tech-savvy individual",
  "young": "motivated",
  "energetic": "motivated",
  "waitress": "Server",
  "salesman": "Salesperson",
  "he": "the candidate",
  "she": "the candidate",
  "him": "them",
  "her": "them",
  "guys": "team",
  "mankind": "humanity",
  "manpower": "workforce",
  "master": "primary",
  "slave": "replica",
  "blacklist": "denylist",
  "whitelist": "allowlist",
  "native english speaker": "fluent in English",
  "hustle": "work effectively",
  "work hard play hard": "collaborative culture",
};

// --- LOGIC ---

export function getSuggestionsForTitle(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  let suggestions: string[] = [];

  const templates = roleTemplates as any;
  Object.keys(templates).forEach(key => {
    if (key === 'general') return;
    const roleData = templates[key];
    if (roleData.keywords.some((k: string) => lowerTitle.includes(k))) {
      suggestions = [...suggestions, ...roleData.responsibilities];
    }
  });

  if (suggestions.length < 3) {
    suggestions = [...suggestions, ...templates.general.responsibilities];
  }
  return suggestions;
}

export function autoTuneText(text: string): string {
  let newText = text;

  // 1. SMART WORD REPLACEMENTS
  Object.keys(REPLACEMENTS).forEach((badWord) => {
    const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
    newText = newText.replace(regex, (match) => {
      const goodWord = REPLACEMENTS[badWord];
      if (match[0] === match[0].toUpperCase()) {
        return goodWord.charAt(0).toUpperCase() + goodWord.slice(1);
      }
      return goodWord;
    });
  });

  // 2. GRAMMAR & FORMATTING SCRUBBER
  
  // Fix "a energetic" -> "an energetic" (Basic Vowel Check)
  newText = newText.replace(/\ba ([aeiou])/gi, 'an $1');

  // Fix Bullet Points (Add space if missing: "-Task" -> "- Task")
  newText = newText.replace(/^([•\-\*])([a-zA-Z])/gm, '$1 $2');
  
  // Cleanup HTML artifacts
  newText = newText.replace(/<li>/gi, '\n• ').replace(/<\/li>/gi, '').replace(/<ul>/gi, '\n').replace(/<\/ul>/gi, '\n');

  // Fix Double Spacing
  newText = newText.replace(/  +/g, ' ');

  // Fix Punctuation Spacing ( "word ." -> "word.")
  newText = newText.replace(/\s+([.,!?:])/g, '$1');

  // Fix Headers spacing (Ensure newline before Requirements:)
  const headers = ["Requirements", "Responsibilities", "Qualifications", "Benefits", "About Us"];
  headers.forEach(header => {
    const regex = new RegExp(`(?<!\n\n)(${header}:?)`, 'gi');
    newText = newText.replace(regex, '\n\n$1');
  });

  // Capitalize start of sentences (Basic)
  newText = newText.replace(/(^\s*|[.!?]\s+)([a-z])/g, (match) => match.toUpperCase());

  return newText;
}

export const GOLD_STANDARD_TEMPLATE = `JOB TITLE: [Insert Title]

ABOUT THE ROLE:
[2-3 sentences explaining the mission of this role. Why does it exist?]

KEY RESPONSIBILITIES:
• [Action verb] [Specific task] [Outcome]
• Collaborate with cross-functional teams to...
• Manage the lifecycle of...
• Analyze data to drive...

QUALIFICATIONS:
• [Number] years of experience in...
• Proficiency with [Tool/Language]
• Strong understanding of...

BENEFITS & PERKS:
• Competitive salary range: $[X]k - $[Y]k
• Comprehensive health, dental, and vision insurance
• Remote work options / Flexible schedule
• Professional development budget

We are an equal opportunity employer and value diversity at our company.`;