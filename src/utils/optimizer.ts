import riskDictionary from '../data/risk_dictionary.json';

// --- Types ---

export interface Issue {
  id: string;
  type: 'SEO' | 'CONVERSION' | 'RISK';
  severity: 'low' | 'medium' | 'high';
  message: string;
  context?: string; // The problematic word/phrase
}

export interface ScoreReport {
  overallScore: number;
  seoScore: number;
  conversionScore: number;
  riskScore: number;
  issues: Issue[];
  meta: {
    wordCount: number;
    paragraphCount: number;
    youWeRatio: string;
  };
}

// --- Helper Functions ---

const countOccurrences = (text: string, word: string): number => {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  return (text.match(regex) || []).length;
};

// --- Main Logic ---

export function analyzeJobDescription(text: string, jobTitle: string): ScoreReport {
  const issues: Issue[] = [];
  let seoScore = 100;
  let conversionScore = 100;
  let riskScore = 100;

  const lowerText = text.toLowerCase();
  const lowerTitle = jobTitle.toLowerCase();
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0);
  const wordCount = text.trim().split(/\s+/).length;

  // ============================================
  // PILLAR 1: SEARCHABILITY (SEO)
  // ============================================

  // 1. Title Check (Vague words)
  // We check the Job Title itself, not the body text
  const vagueTitles = ['ninja', 'guru', 'rockstar', 'wizard', 'magician'];
  vagueTitles.forEach((term) => {
    if (lowerTitle.includes(term)) {
      seoScore -= 15;
      issues.push({
        id: `seo-title-${term}`,
        type: 'SEO',
        severity: 'high',
        message: `Job Title contains vague term "${term}". Use standard industry titles for better Google Jobs ranking.`,
        context: term,
      });
    }
  });

  // 2. Keyword Density (Title in First Paragraph)
  if (paragraphs.length > 0) {
    const firstPara = paragraphs[0].toLowerCase();
    // Simple check: does the title (or significant parts of it) appear in the first paragraph?
    if (!firstPara.includes(lowerTitle)) {
      seoScore -= 10;
      issues.push({
        id: 'seo-keyword-density',
        type: 'SEO',
        severity: 'medium',
        message: 'The Job Title does not appear in the first paragraph. This hurts SEO rankings.',
      });
    }
  }

  // 3. Word Count
  if (wordCount < 300) {
    seoScore -= 10;
    issues.push({
      id: 'seo-short',
      type: 'SEO',
      severity: 'medium',
      message: 'Job description is too short (under 300 words). Google may penalize thin content.',
    });
  } else if (wordCount > 1000) {
    seoScore -= 5;
    issues.push({
      id: 'seo-long',
      type: 'SEO',
      severity: 'low',
      message: 'Job description is very long (over 1000 words). Consider trimming for better readability.',
    });
  }

  // ============================================
  // PILLAR 2: CONVERSION (Readability)
  // ============================================

  // 1. Wall of Text (Paragraphs > 5 lines)
  // Heuristic: Approx 80-100 characters per line. Let's say 500 chars is a "long paragraph"
  paragraphs.forEach((para, index) => {
    if (para.length > 500) {
      conversionScore -= 5;
      issues.push({
        id: `conv-wall-${index}`,
        type: 'CONVERSION',
        severity: 'medium',
        message: `Paragraph ${index + 1} is too long ("Wall of Text"). Break it up to improve scanability.`,
      });
    }
  });

  // 2. Bullet Point Check
  const bulletCount = (text.match(/^[•\-\*]|\n[•\-\*]/gm) || []).length;
  // Also check for HTML li tags if user pasted HTML
  const liCount = (text.match(/<li>/gi) || []).length;
  const totalBullets = bulletCount + liCount;

  if (totalBullets < 3) {
    conversionScore -= 15;
    issues.push({
      id: 'conv-bullets',
      type: 'CONVERSION',
      severity: 'high',
      message: 'Hard to scan. Use at least 3 bullet points to list responsibilities or requirements.',
    });
  }

  // 3. You vs We Ratio
  const youCount = countOccurrences(text, 'you') + countOccurrences(text, 'your');
  const weCount = countOccurrences(text, 'we') + countOccurrences(text, 'our') + countOccurrences(text, 'us');

  // Avoid division by zero
  const ratio = youCount / (weCount || 1); 

  if (weCount > youCount) {
    conversionScore -= 10;
    issues.push({
      id: 'conv-ratio',
      type: 'CONVERSION',
      severity: 'medium',
      message: `Self-centered text. You used "We/Our" ${weCount} times and "You/Your" ${youCount} times. Focus more on the candidate.`,
    });
  }

  // ============================================
  // PILLAR 3: RISK (Liability & Compliance)
  // ============================================

  riskDictionary.forEach((item) => {
    // Regex matches whole word to avoid partial matches (e.g. "shaven" matching inside "unshaven" - wait, that's actually okay. 
    // But we want to avoid "age" matching "message").
    // Let's use flexible matching for phrases.
    const regex = new RegExp(`\\b${item.term}\\b`, 'gi');
    if (regex.test(text)) {
      // Severity based on category
      let impact = 5;
      let severity: 'low' | 'medium' | 'high' = 'medium';

      if (item.category === 'legal') {
        impact = 20; // Heavy penalty for legal risks
        severity = 'high';
      } else if (item.category === 'toxic') {
        impact = 10;
        severity = 'medium';
      }

      riskScore -= impact;
      issues.push({
        id: `risk-${item.term.replace(/\s/g, '-')}`,
        type: 'RISK',
        severity: severity,
        message: item.reason,
        context: item.term,
      });
    }
  });

  // ============================================
  // FINAL CALCULATION
  // ============================================

  // Clamp scores between 0 and 100
  seoScore = Math.max(0, seoScore);
  conversionScore = Math.max(0, conversionScore);
  riskScore = Math.max(0, riskScore);

  // Weighted Average for Overall Score
  // Risk is most important (40%), then Conversion (35%), then SEO (25%)
  const overallScore = Math.round(
    (seoScore * 0.25) + (conversionScore * 0.35) + (riskScore * 0.40)
  );

  return {
    overallScore,
    seoScore,
    conversionScore,
    riskScore,
    issues,
    meta: {
      wordCount,
      paragraphCount: paragraphs.length,
      youWeRatio: `${youCount}:${weCount}`,
    },
  };
}