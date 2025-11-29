import riskDictionary from '../data/risk_dictionary.json';

// --- Types ---
export interface Issue {
  id: string;
  type: 'SEO' | 'CONVERSION' | 'RISK';
  severity: 'low' | 'medium' | 'high';
  message: string;
  context?: string;
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
  
  // CLEAN INPUT
  // If text is extremely short or garbage, return a failing score immediately.
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 10) {
    return {
      overallScore: 10,
      seoScore: 10,
      conversionScore: 10,
      riskScore: 10,
      issues: [{
        id: 'critical-length',
        type: 'CONVERSION',
        severity: 'high',
        message: 'Content is too short or invalid to analyze. Please add a real job description.'
      }],
      meta: { wordCount, paragraphCount: 0, youWeRatio: '0:0' }
    };
  }

  let seoScore = 100;
  let conversionScore = 100;
  let riskScore = 100;

  const lowerText = text.toLowerCase();
  const lowerTitle = jobTitle.toLowerCase();
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0);

  // ============================================
  // PILLAR 1: SEARCHABILITY (SEO)
  // ============================================

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

  if (paragraphs.length > 0) {
    const firstPara = paragraphs[0].toLowerCase();
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

  if (wordCount < 300) {
    seoScore -= 15; // Increased penalty
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

  paragraphs.forEach((para, index) => {
    if (para.length > 600) { // Slightly increased threshold
      conversionScore -= 8;
      issues.push({
        id: `conv-wall-${index}`,
        type: 'CONVERSION',
        severity: 'medium',
        message: `Paragraph ${index + 1} is too long ("Wall of Text"). Break it up to improve scanability.`,
      });
    }
  });

  const bulletCount = (text.match(/^[•\-\*]|\n[•\-\*]/gm) || []).length;
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

  const youCount = countOccurrences(text, 'you') + countOccurrences(text, 'your');
  const weCount = countOccurrences(text, 'we') + countOccurrences(text, 'our') + countOccurrences(text, 'us');

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
    const regex = new RegExp(`\\b${item.term}\\b`, 'gi');
    if (regex.test(text)) {
      let impact = 5;
      let severity: 'low' | 'medium' | 'high' = 'medium';

      if (item.category === 'legal') {
        impact = 20;
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

  seoScore = Math.max(0, seoScore);
  conversionScore = Math.max(0, conversionScore);
  riskScore = Math.max(0, riskScore);

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