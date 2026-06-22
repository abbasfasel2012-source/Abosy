export interface Conversation {
  id: string
  title: string
  session_id?: string | null
  user_id?: string | null
  model_used: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model_used?: string | null
  file_url?: string | null
  file_name?: string | null
  file_type?: string | null
  created_at: string
}

export interface ChatModel {
  id: string
  name: string
  provider: string
  description: string
  category: 'auto' | 'general' | 'religious' | 'poetry' | 'code' | 'arabic'
  icon: string
  color: string
}

export const AVAILABLE_MODELS: ChatModel[] = [
  {
    id: 'auto',
    name: 'تلقائي ذكي',
    provider: 'عبوسي AI',
    description: 'ذكاء اصطناعي يختار أفضل نموذج حسب سؤالك تلقائياً',
    category: 'auto',
    icon: '✦',
    color: '#a78bfa',
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet',
    provider: 'Anthropic',
    description: 'متوازن — مناسب لمعظم الأسئلة',
    category: 'general',
    icon: 'C',
    color: '#818cf8',
  },
  {
    id: 'claude-opus',
    name: 'Claude Opus',
    provider: 'Anthropic',
    description: 'الأعمق — للتحليل والشعر والكتابة',
    category: 'poetry',
    icon: 'C',
    color: '#c084fc',
  },
  {
    id: 'claude-haiku',
    name: 'Claude Haiku',
    provider: 'Anthropic',
    description: 'الأسرع — للمحادثات الخفيفة',
    category: 'general',
    icon: 'C',
    color: '#67e8f9',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'شامل — يدعم الصور والتحليل',
    category: 'general',
    icon: 'G',
    color: '#4ade80',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'قوي في البحث والتحليل',
    category: 'general',
    icon: 'G',
    color: '#fb923c',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek',
    description: 'ممتاز في الاستدلال والبرمجة',
    category: 'code',
    icon: 'D',
    color: '#38bdf8',
  },
  {
    id: 'qwen',
    name: 'Qwen',
    provider: 'Alibaba',
    description: 'متميز في اللغة العربية',
    category: 'arabic',
    icon: 'Q',
    color: '#f472b6',
  },
]

export function getAutoModel(queryType: string): string {
  switch (queryType) {
    case 'religious': return 'claude-sonnet'
    case 'poetry': return 'claude-opus'
    case 'code': return 'deepseek'
    case 'arabic': return 'qwen'
    default: return 'claude-sonnet'
  }
}

/** يحلل نص الرسالة ويختار النموذج الأنسب تلقائياً */
export function detectQueryTypeAndModel(text: string): { type: string; modelId: string; reason: string } {
  const t = text.toLowerCase()
  // ديني
  if (/صلاة|زكاة|حج|حلال|حرام|فتوى|مرجع|مرجعية|ديني|إسلام|قرآن|حديث|فقه|عبادة|طهارة|نجاسة|واجب|مستحب|مكروه/.test(t)) {
    return { type: 'religious', modelId: 'claude-sonnet', reason: 'سؤال ديني — Claude Sonnet' }
  }
  // شعر وأدب
  if (/شعر|قصيدة|أبوذية|عتابة|دارمي|زهيري|نظم|قافية|وزن|أدب|رواية|نص أدبي/.test(t)) {
    return { type: 'poetry', modelId: 'claude-opus', reason: 'شعر وأدب — Claude Opus' }
  }
  // برمجة
  if (/كود|برمجة|javascript|python|typescript|react|sql|bug|error|خوارزمية|تطبيق|موقع/.test(t)) {
    return { type: 'code', modelId: 'deepseek', reason: 'برمجة — DeepSeek' }
  }
  // عربي متخصص
  if (/نحو|صرف|إعراب|لغة عربية|مصدر|فعل|اسم|جملة|تركيب/.test(t)) {
    return { type: 'arabic', modelId: 'qwen', reason: 'لغة عربية — Qwen' }
  }
  return { type: 'general', modelId: 'claude-sonnet', reason: 'عام — Claude Sonnet' }
}

export interface ReligiousReference {
  id: string
  name: string
  shortName: string
  promptNote: string
}

export const RELIGIOUS_REFERENCES: ReligiousReference[] = [
  {
    id: 'sistani',
    name: 'سماحة السيد علي السيستاني (دام ظله)',
    shortName: 'السيستاني',
    promptNote:
      'عند السؤال الديني، تجيب بشكل افتراضي حسب رأي وفتاوى سماحة السيد علي السيستاني (دام ظله)، وتضيف دائماً تنويه أن هذا رأي اجتهادي حسب فتاوى سماحة السيد السيستاني وينصح بالرجوع لمكتب المرجعية مباشرة في المسائل الدقيقة.',
  },
  {
    id: 'khamenei',
    name: 'سماحة السيد علي الخامنئي (دام ظله)',
    shortName: 'الخامنئي',
    promptNote:
      'عند السؤال الديني، تجيب بشكل افتراضي حسب رأي وفتاوى سماحة السيد علي الخامنئي (دام ظله).',
  },
  {
    id: 'hakim',
    name: 'سماحة السيد محمد سعيد الحكيم (قدس سره)',
    shortName: 'الحكيم',
    promptNote:
      'عند السؤال الديني، تجيب بشكل افتراضي حسب رأي وفتاوى سماحة السيد محمد سعيد الحكيم (قدس سره).',
  },
  {
    id: 'general',
    name: 'عام (بدون تحديد مرجعية)',
    shortName: 'عام',
    promptNote:
      'عند السؤال الديني، تجيب بشكل عام حسب المتفق عليه بين أغلب المراجع.',
  },
]

export function getReligiousReference(id: string): ReligiousReference {
  return RELIGIOUS_REFERENCES.find((r) => r.id === id) || RELIGIOUS_REFERENCES[0]
}
