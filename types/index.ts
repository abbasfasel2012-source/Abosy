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
  category: 'general' | 'religious' | 'poetry' | 'code' | 'arabic'
}

export const AVAILABLE_MODELS: ChatModel[] = [
  { id: 'auto', name: 'تلقائي (Auto)', provider: 'عبوسي', description: 'يختار النظام أفضل نموذج حسب نوع السؤال', category: 'general' },
  { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'Anthropic', description: 'متوازن - مناسب لمعظم الأسئلة', category: 'general' },
  { id: 'claude-opus', name: 'Claude Opus', provider: 'Anthropic', description: 'الأقوى - للتحليل العميق والشعر', category: 'poetry' },
  { id: 'claude-haiku', name: 'Claude Haiku', provider: 'Anthropic', description: 'الأسرع - للمحادثات السريعة', category: 'general' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'شامل - يدعم الصور والتحليل', category: 'general' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'قوي في البحث والتحليل', category: 'general' },
  { id: 'deepseek', name: 'DeepSeek', provider: 'DeepSeek', description: 'ممتاز في الاستدلال والمنطق', category: 'code' },
  { id: 'qwen', name: 'Qwen', provider: 'Alibaba', description: 'متميز في اللغة العربية', category: 'arabic' },
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
      'عند السؤال الديني، تجيب بشكل افتراضي حسب رأي وفتاوى سماحة السيد علي السيستاني (دام ظله)، وتضيف دائماً تنويه أن هذا رأي اجتهادي حسب فتاوى سماحة السيد السيستاني وينصح بالرجوع لمكتب المرجعية مباشرة في المسائل الدقيقة، وقد تختلف آراء مراجع أخرى.',
  },
  {
    id: 'khamenei',
    name: 'سماحة السيد علي الخامنئي (دام ظله)',
    shortName: 'الخامنئي',
    promptNote:
      'عند السؤال الديني، تجيب بشكل افتراضي حسب رأي وفتاوى سماحة السيد علي الخامنئي (دام ظله)، وتضيف دائماً تنويه أن هذا رأي اجتهادي حسب فتاوى سماحة السيد الخامنئي وينصح بالرجوع لمكتب المرجعية مباشرة في المسائل الدقيقة، وقد تختلف آراء مراجع أخرى.',
  },
  {
    id: 'hakim',
    name: 'سماحة السيد محمد سعيد الحكيم (قدس سره)',
    shortName: 'الحكيم',
    promptNote:
      'عند السؤال الديني، تجيب بشكل افتراضي حسب رأي وفتاوى سماحة السيد محمد سعيد الحكيم (قدس سره)، وتضيف دائماً تنويه أن هذا رأي اجتهادي حسب فتاوى سماحة السيد الحكيم وينصح بالرجوع لمكتب المرجعية مباشرة في المسائل الدقيقة، وقد تختلف آراء مراجع أخرى.',
  },
  {
    id: 'general',
    name: 'عام (بدون تحديد مرجعية)',
    shortName: 'عام',
    promptNote:
      'عند السؤال الديني، تجيب بشكل عام حسب المتفق عليه بين أغلب المراجع، وتنبه أن المسائل الخلافية تختلف من مرجع لآخر وينصح بسؤال المرجعية التي يقلدها السائل.',
  },
]

export function getReligiousReference(id: string): ReligiousReference {
  return RELIGIOUS_REFERENCES.find((r) => r.id === id) || RELIGIOUS_REFERENCES[0]
}
