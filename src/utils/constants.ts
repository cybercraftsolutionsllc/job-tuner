// Single source of truth for Application Configuration

export const AI_CONFIG = {
  defaultModel: "gpt-3.5-turbo",
  premiumModel: "gpt-4", // Ready for future upgrade
  temperature: 0.7,
};

export const CREDIT_COSTS = {
  expand: 1,
  rewrite: 1,
  autoTune: 0, // Free
};

export type ToneKey = keyof typeof TONE_PROFILES;

export const TONE_PROFILES = {
  professional: {
    label: "👔 Corporate",
    prompt: "Tone: Corporate, polished, authoritative, and structured. Suitable for banking, enterprise, or legal roles.",
  },
  startup: {
    label: "🚀 Startup",
    prompt: "Tone: High-energy, exciting, mission-driven, and slightly informal. Focus on impact, growth, and ownership.",
  },
  executive: {
    label: "💼 Executive",
    prompt: "Tone: Sophisticated, strategic, and visionary. Focus on leadership, ROI, and long-term goals.",
  },
  inclusive: {
    label: "🤝 Inclusive",
    prompt: "Tone: Warm, welcoming, and community-focused. Heavily emphasize culture, belonging, and work-life balance.",
  },
  technical: {
    label: "🤖 Engineering",
    prompt: "Tone: Precise, detailed, and developer-centric. Emphasize tech stack, scale, and interesting engineering challenges.",
  },
  marketing: {
    label: "📢 Persuasive",
    prompt: "Tone: Compelling, vibrant, and story-driven. Sell the dream and the brand vision.",
  }
};