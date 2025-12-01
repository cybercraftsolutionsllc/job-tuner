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
  const headers = ["Requirements", "Responsibilities", "Qualifications", "Benefits", "About Us", "What You'll Do", "What You Bring"];
  headers.forEach(header => {
    const regex = new RegExp(`(?<!\n\n)(${header}:?)`, 'gi');
    newText = newText.replace(regex, '\n\n$1');
  });

  // Capitalize start of sentences (Basic)
  newText = newText.replace(/(^\s*|[.!?]\s+)([a-z])/g, (match) => match.toUpperCase());

  return newText;
}

export const GOLD_STANDARD_TEMPLATE = `JOB TITLE: Senior [Role Name]

ABOUT THE COMPANY:
At [Company Name], we are on a mission to [Mission Statement]. We value innovation, collaboration, and diversity. We are looking for a driven [Role Name] to join our growing team and help us build the future of [Industry].

ABOUT THE ROLE:
As a Senior [Role Name], you will play a pivotal role in shaping our [Department/Product]. You will work closely with cross-functional teams to drive strategy and execution. This is a unique opportunity to make a high-impact contribution in a fast-paced environment.

WHAT YOU'LL DO:
• Lead the design and implementation of [Key Project/Area].
• Collaborate with product management, design, and engineering to define requirements.
• Mentor junior team members and foster a culture of continuous learning.
• Analyze data and user feedback to identify opportunities for improvement.
• Develop and maintain scalable processes that support business growth.
• Troubleshoot complex issues and propose effective solutions.

WHAT YOU BRING:
• [Number]+ years of experience in [Field] or a related role.
• Proven track record of delivering high-quality results on time.
• Strong proficiency in [Key Skill 1], [Key Skill 2], and [Key Skill 3].
• Excellent communication and interpersonal skills.
• Ability to thrive in an ambiguous and dynamic environment.
• Bachelor's degree in [Field] or equivalent practical experience.

BENEFITS & PERKS:
• Competitive salary and equity package.
• Comprehensive health, dental, and vision insurance.
• Unlimited Paid Time Off (PTO) and flexible work hours.
• Remote-first culture with optional coworking stipends.
• Annual learning and development budget.
• 401(k) matching program.

[Company Name] is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.`;