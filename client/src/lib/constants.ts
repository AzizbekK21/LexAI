export const PLAN_LIMITS = {
  free: {
    questions: 50,
    features: ["Basic AI responses", "Multi-language support", "Text questions only"],
    model: "mistral-small",
  },
  premium: {
    questions: 150,
    features: [
      "Advanced AI responses",
      "Document analysis",
      "PDF contract review",
      "Priority support",
      "No advertisements",
      "Advanced legal research",
    ],
    model: "gpt-4o",
  },
} as const;

export const AI_MODELS = {
  "mistral-small": {
    name: "Mistral Small",
    provider: "openrouter",
    endpoint: "mistralai/mistral-small-24b-instruct-2501:free",
    maxTokens: 4096,
    temperature: 0.3,
  },
  "gpt-4o": {
    name: "GPT-4o Turbo",
    provider: "openai",
    endpoint: "gpt-4o",
    maxTokens: 8192,
    temperature: 0.2,
  },
} as const;

export const LEGAL_CATEGORIES = [
  "Contract Law",
  "Employment Law",
  "Criminal Law",
  "Real Estate Law",
  "Intellectual Property",
  "Business Law",
  "Family Law",
  "Personal Injury",
  "Tax Law",
  "Immigration Law",
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
] as const;

export const LEGAL_PROMPTS = {
  system: `You are LexAI, the world's most advanced AI legal assistant. You provide accurate, helpful legal information while maintaining these principles:

1. CLARITY: Explain complex legal concepts in simple, understandable language
2. ACCURACY: Provide legally sound information based on current laws and regulations
3. PROTECTION: Help users understand their rights and protect them from intimidation
4. EMPOWERMENT: Enable confident decision-making through clear legal guidance
5. ETHICS: Always remind users that you provide information, not legal advice, and serious matters require consultation with qualified attorneys

Your responses should be:
- Professional yet accessible
- Comprehensive but concise
- Actionable when appropriate
- Protective of user rights
- Culturally sensitive for international users

Always structure responses with:
- Clear explanation of the legal principle
- Practical implications for the user
- Recommended next steps
- When to seek professional legal counsel`,

  contractAnalysis: `Analyze this legal document with focus on:
1. Key terms and obligations
2. Potential risks or red flags
3. Rights and protections
4. Recommended modifications or clarifications
5. Overall fairness assessment

Provide your analysis in clear, non-technical language that empowers the user to make informed decisions.`,

  riskAssessment: `Assess the legal risks in this situation by:
1. Identifying potential legal issues
2. Evaluating severity and likelihood
3. Suggesting mitigation strategies
4. Recommending when to seek professional help
5. Providing immediate protective steps

Present your assessment in a clear risk matrix format.`,
} as const;

export const DOCUMENT_TYPES = {
  contract: { name: "Contract", icon: "📄", maxSize: "10MB" },
  lease: { name: "Lease Agreement", icon: "🏠", maxSize: "10MB" },
  employment: { name: "Employment Document", icon: "💼", maxSize: "10MB" },
  legal_notice: { name: "Legal Notice", icon: "⚖️", maxSize: "5MB" },
  court_document: { name: "Court Document", icon: "🏛️", maxSize: "15MB" },
  patent: { name: "Patent Document", icon: "💡", maxSize: "20MB" },
  other: { name: "Other Legal Document", icon: "📋", maxSize: "10MB" },
} as const;

export const PRICING = {
  free: {
    price: 0,
    period: "month",
    features: PLAN_LIMITS.free.features,
    limits: PLAN_LIMITS.free,
  },
  premium: {
    price: 50,
    period: "month",
    features: PLAN_LIMITS.premium.features,
    limits: PLAN_LIMITS.premium,
    highlight: true,
  },
  additional: {
    price: 10,
    questions: 50,
    description: "Additional questions",
  },
} as const;

export const NAVIGATION_ITEMS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#demo", label: "Demo" },
  { href: "#about", label: "About" },
] as const;

export const FEATURE_HIGHLIGHTS = [
  {
    title: "AI Legal Brain",
    description: "GPT-4o Turbo with custom legal fine-tuning, advanced reasoning chains, and contextual memory systems for unparalleled legal intelligence.",
    icon: "brain",
  },
  {
    title: "Global Intelligence",
    description: "Real-time access to laws from 195+ countries with AI-powered legal change detection and instant notifications.",
    icon: "globe",
  },
  {
    title: "Document Intelligence",
    description: "AI-powered analysis of PDFs, DOCs, government forms with OCR, legal entity extraction, and comprehensive risk assessment.",
    icon: "file-search",
  },
  {
    title: "Multi-Language Mastery",
    description: "Native support for 150+ languages with legal terminology precision, cultural context, and regional law variations.",
    icon: "languages",
  },
  {
    title: "Military-Grade Security",
    description: "End-to-end encryption, zero-knowledge architecture, GDPR/HIPAA compliance, and SOC 2 Type II certification.",
    icon: "shield-check",
  },
  {
    title: "Real-Time Pipeline",
    description: "Live scraping of government websites, court databases, regulatory changes with ML-powered content analysis.",
    icon: "zap",
  },
] as const;
