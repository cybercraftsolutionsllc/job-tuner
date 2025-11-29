import riskDictionary from '../data/risk_dictionary.json';

// A map of "Bad Word" -> "Good Replacement"
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

export function autoTuneText(text: string): string {
  let newText = text;

  // 1. SMART REPLACEMENTS
  // We iterate through our known bad words and swap them.
  Object.keys(REPLACEMENTS).forEach((badWord) => {
    // Regex matches whole word, case insensitive
    const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
    
    // We try to preserve case (simple capitalization check)
    newText = newText.replace(regex, (match) => {
      const goodWord = REPLACEMENTS[badWord];
      // If original was capitalized, capitalize replacement
      if (match[0] === match[0].toUpperCase()) {
        return goodWord.charAt(0).toUpperCase() + goodWord.slice(1);
      }
      return goodWord;
    });
  });

  // 2. FORMATTING FIXES
  
  // Fix A: Ensure bullet points have a space after them (e.g., "-Task" -> "- Task")
  newText = newText.replace(/^([•\-\*])([a-zA-Z])/gm, '$1 $2');

  // Fix B: Convert HTML list items <li> to text bullets if they were pasted raw
  newText = newText.replace(/<li>/gi, '\n• ');
  newText = newText.replace(/<\/li>/gi, '');
  newText = newText.replace(/<ul>/gi, '\n');
  newText = newText.replace(/<\/ul>/gi, '\n');

  // Fix C: "Wall of Text" Breaker (Simple Heuristic)
  // If we see a "Requirements:" header followed by a long paragraph with commas,
  // we can try to break it (this is risky, so we keep it simple for now).
  // Instead, let's just ensure double spacing between major sections.
  const headers = ["Requirements", "Responsibilities", "Qualifications", "Benefits", "About Us"];
  headers.forEach(header => {
    // Ensure there is a newline before headers
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