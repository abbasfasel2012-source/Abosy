import { blink } from '@/lib/blink'
import type { Message } from '@/types'
import { getReligiousReference, detectQueryTypeAndModel } from '@/types'

const BASE_PROMPT = `أنت "عبوسي"، مساعد ذكي عراقي تتحدث باللهجة العراقية الأصيلة والبسيطة. شخصيتك ودودة، قريبة من الناس، ومثقفة.

## شخصيتك ولهجتك:
- تتحدث باللهجة العراقية الدارجة (البغدادية أساساً)، وتفهم كل اللهجات العراقية.
- تستخدم مفردات عراقية أصيلة: هلا وغلا، شلونك، عيني، يابة، والله، خوش، كلش، زين، مو، ها، لعد، شكو ماكو، عاشت ايدك...
- تعرف العادات والتقاليد العراقية والأمثال الشعبية.
- تتحدث بطريقة طبيعية وغير رسمية.

## الشعر:
- تقدر تنظم الشعر الشعبي العراقي (الأبوذية، العتابة، الدارمي، الزهيري) والشعر الفصيح.
- تعرف كبار الشعراء: المتنبي، الجواهري، السياب، البياتي، مظفر النواب، عريان السيد خلف...

## الجانب الديني:
{{RELIGIOUS_NOTE}}
- تعرف المسائل الفقهية والأحكام الشرعية.

## البحث:
- تعطي الأولوية للمصادر العربية الموثوقة.

## قواعد:
- إجاباتك دقيقة، مفيدة، مباشرة، ومختصرة.
- اكتب بالعربية دائماً من اليمين لليسار.
- إذا طلب المستخدم صورة أو "ولّد لي صورة"، فهذا يعالج تلقائياً بنظام توليد الصور.`

export function getSystemPrompt(religiousReferenceId: string = 'sistani'): string {
  const ref = getReligiousReference(religiousReferenceId)
  return BASE_PROMPT.replace('{{RELIGIOUS_NOTE}}', ref.promptNote)
}

const IMAGE_INTENT_PATTERNS = [
  /ولّد(?:ي)?\s+(?:لي\s+)?صور[ةه]/i,
  /ولد(?:ي)?\s+(?:لي\s+)?صور[ةه]/i,
  /اعمل(?:ي)?\s+(?:لي\s+)?صور[ةه]/i,
  /اصنع(?:ي)?\s+(?:لي\s+)?صور[ةه]/i,
  /رسم(?:ي)?\s+(?:لي\s+)?صور[ةه]/i,
  /ارسم(?:ي)?\s+(?:لي\s+)?/i,
  /صمم(?:ي)?\s+(?:لي\s+)?صور[ةه]/i,
  /generate\s+image/i,
  /draw\s+(a|an)?\s*image/i,
]

export function isImageGenerationRequest(text: string): boolean {
  return IMAGE_INTENT_PATTERNS.some((re) => re.test(text))
}

export function extractImagePrompt(text: string): string {
  let prompt = text
  for (const re of IMAGE_INTENT_PATTERNS) {
    prompt = prompt.replace(re, '')
  }
  return prompt.trim() || text.trim()
}

/** يحدد النموذج الفعلي المستخدم — إذا auto يختار تلقائياً */
export function resolveModel(modelId: string, userText: string): { resolvedModelId: string; autoReason?: string } {
  if (modelId !== 'auto') return { resolvedModelId: modelId }
  const { modelId: autoModel, reason } = detectQueryTypeAndModel(userText)
  return { resolvedModelId: autoModel, autoReason: reason }
}

export function buildMessages(
  history: Message[],
  userMessage: string,
  religiousReferenceId: string,
  fileContext?: string
): Array<{ role: string; content: unknown }> {
  const messages: Array<{ role: string; content: unknown }> = [
    { role: 'system', content: getSystemPrompt(religiousReferenceId) },
  ]
  for (const msg of history) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.content })
    }
  }
  let finalContent = userMessage
  if (fileContext) {
    finalContent = `[محتوى الملف المرفوع]:\n${fileContext}\n\n[سؤال المستخدم]:\n${userMessage}`
  }
  messages.push({ role: 'user', content: finalContent })
  return messages
}

export async function generateStreamingResponse(
  history: Message[],
  userMessage: string,
  modelId: string,
  religiousReferenceId: string,
  onChunk: (chunk: string) => void,
  fileContext?: string
): Promise<{ usedModelId: string; autoReason?: string }> {
  const { resolvedModelId, autoReason } = resolveModel(modelId, userMessage)
  const messages = buildMessages(history, userMessage, religiousReferenceId, fileContext)

  await blink.ai.streamText(
    {
      messages: messages as Array<{ role: string; content: string }>,
      model: resolvedModelId,
      temperature: 0.8,
      maxTokens: 2048,
    },
    (chunk: string) => onChunk(chunk)
  )

  return { usedModelId: resolvedModelId, autoReason }
}

export async function generateImage(prompt: string): Promise<string> {
  const result = await blink.ai.generateImage({
    prompt,
    size: '1024x1024',
    n: 1,
  })
  const anyResult = result as unknown as {
    images?: Array<{ url: string }>
    data?: Array<{ url: string }>
    url?: string
  }
  if (anyResult.images?.[0]?.url) return anyResult.images[0].url
  if (anyResult.data?.[0]?.url) return anyResult.data[0].url
  if (anyResult.url) return anyResult.url
  throw new Error('تعذر الحصول على رابط الصورة')
}
