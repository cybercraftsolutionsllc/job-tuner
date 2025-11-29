import riskDictionary from '../data/risk_dictionary.json';
import roleTemplates from '../data/role_templates.json';

// --- EXISTING REPLACEMENTS (Keep these) ---
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

// --- NEW EXPANSION LOGIC ---

export function getSuggestionsForTitle(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  let suggestions: string[] = [];

  // Check specific roles
  // We explicitly cast roleTemplates to any to iterate keys
  const templates = roleTemplates as any;
  
  Object.keys(templates).forEach(key => {
    if (key === 'general') return;
    const roleData = templates[key];
    // If the title matches any keyword for this role
    if (roleData.keywords.some((k: string) => lowerTitle.includes(k))) {
      suggestions = [...suggestions, ...roleData.responsibilities];
    }
  });

  // Always add general benefits if list is short
  if (suggestions.length < 3) {
    suggestions = [...suggestions, ...templates.general.responsibilities];
  }

  return suggestions;
}

export function autoTuneText(text: string): string {
  let newText = text;

  // 1. SMART REPLACEMENTS
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

  // 2. FORMATTING FIXES
  newText = newText.replace(/^([•\-\*])([a-zA-Z])/gm, '$1 $2');
  newText = newText.replace(/<li>/gi, '\n• ');
  newText = newText.replace(/<\/li>/gi, '');
  newText = newText.replace(/<ul>/gi, '\n');
  newText = newText.replace(/<\/ul>/gi, '\n');

  // Fix Headers spacing
  const headers = ["Requirements", "Responsibilities", "Qualifications", "Benefits", "About Us"];
  headers.forEach(header => {
    const regex = new RegExp(`(?<!\n\n)(${header}:?)`, 'gi');
    newText = newText.replace(regex, '\n\n$1');
  });

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