import { blink } from '@/lib/blink'
import type { Message } from '@/types'
import { getReligiousReference } from '@/types'

const BASE_PROMPT = `أنت "عبوسي"، مساعد ذكي عراقي تتحدث باللهجة العراقية الأصيلة والبسيطة. شخصيتك ودودة، قريبة من الناس، ومثقفة.

## شخصيتك ولهجتك:
- تتحدث باللهجة العراقية الدارجة (البغدادية أساساً)، وتفهم كل اللهجات العراقية (موصلية، بصراوية، جنوبية...).
- تستخدم مفردات وعبارات عراقية أصيلة مثل: هلا وغلا، شلونك، عيني، يابة، والله، خوش، كلش، زين، مو، ها، لعد، شكو ماكو، عاشت ايدك...
- تعرف العادات والتقاليد العراقية: الضيافة، الأعراس، العزاء، المناسبات الدينية، الأكلات الشعبية، الأمثال الشعبية العراقية.
- تتحدث بطريقة طبيعية وغير رسمية، مثل ما يحجي العراقي مع رفيجه.

## الشعر:
- تقدر تنظم الشعر الشعبي العراقي (الأبوذية، العتابة، الدارمي، الزهيري) والشعر العربي الفصيح.
- تقدر تتذوق الشعر وتحلله وتنتقده نقداً أدبياً حقيقياً (الوزن، القافية، الصور الشعرية).
- تعرف كبار الشعراء العراقيين: المتنبي، الجواهري، السياب، البياتي، مظفر النواب، عريان السيد خلف...

## الجانب الديني:
{{RELIGIOUS_NOTE}}
- تعرف المسائل الفقهية والأحكام الشرعية والعقائد بشكل عام واسع.

## البحث والمصادر:
- عند الحاجة لمعلومات تتطلب بحثاً، تعطي الأولوية دائماً للمصادر العربية الموثوقة (مواقع إخبارية عربية معتمدة، مصادر رسمية عراقية وعربية) قبل أي مصدر آخر.

## قواعد مهمة:
- اجتهد أن تكون إجاباتك دقيقة ومفيدة ومباشرة.
- إذا سألك أحد بشيء ما تعرفه، جاوب بثقة. وإذا ما تعرف، كلها بصراحة: "والله هالشي ما عندي علم بي، بس أكدر أساعدك بشي ثاني".
- خلي إجاباتك مختصرة ومفيدة، مو طويلة ومملة.
- استخدم الرموز التعبيرية باعتدال.
- اكتب بالعربية دائماً، من اليمين لليسار.
- إذا أرسل المستخدم ملف، اقرأ محتواه وحلله ضمن السياق.
- إذا طلب المستخدم صورة أو رسم أو "ولّد لي صورة"، فهذا يعالج تلقائياً بنظام توليد الصور، فقط أكد الطلب بجملة قصيرة ودودة.`

export function getSystemPrompt(religiousReferenceId: string = 'sistani'): string {
  const ref = getReligiousReference(religiousReferenceId)
  return BASE_PROMPT.replace('{{RELIGIOUS_NOTE}}', ref.promptNote)
}

// كلمات مفتاحية لاكتشاف نية توليد صورة بالذكاء الاصطناعي داخل المحادثة
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

/** يستخرج وصف الصورة من رسالة المستخدم (يحذف كلمات الأمر الأولى) */
export function extractImagePrompt(text: string): string {
  let prompt = text
  for (const re of IMAGE_INTENT_PATTERNS) {
    prompt = prompt.replace(re, '')
  }
  return prompt.trim() || text.trim()
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

export async function generateAIResponse(
  history: Message[],
  userMessage: string,
  modelId: string,
  religiousReferenceId: string,
  fileContext?: string
): Promise<string> {
  const messages = buildMessages(history, userMessage, religiousReferenceId, fileContext)

  const { text } = await blink.ai.generateText({
    messages: messages as Array<{ role: string; content: string }>,
    model: modelId === 'auto' ? undefined : modelId,
    temperature: 0.8,
    maxTokens: 2048,
  })

  return text
}

export async function generateStreamingResponse(
  history: Message[],
  userMessage: string,
  modelId: string,
  religiousReferenceId: string,
  onChunk: (chunk: string) => void,
  fileContext?: string
): Promise<void> {
  const messages = buildMessages(history, userMessage, religiousReferenceId, fileContext)

  await blink.ai.streamText(
    {
      messages: messages as Array<{ role: string; content: string }>,
      model: modelId === 'auto' ? undefined : modelId,
      temperature: 0.8,
      maxTokens: 2048,
    },
    (chunk: string) => onChunk(chunk)
  )
}

/** توليد صورة بالذكاء الاصطناعي عبر Blink AI واسترجاع رابط الصورة الناتجة */
export async function generateImage(prompt: string): Promise<string> {
  const result = await blink.ai.generateImage({
    prompt,
    size: '1024x1024',
    n: 1,
  })

  // التعامل مع الأشكال المحتملة لاستجابة الـ SDK
  const anyResult = result as unknown as {
    images?: Array<{ url: string }>
    data?: Array<{ url: string }>
    url?: string
  }

  if (anyResult.images?.[0]?.url) return anyResult.images[0].url
  if (anyResult.data?.[0]?.url) return anyResult.data[0].url
  if (anyResult.url) return anyResult.url

  throw new Error('تعذر الحصول على رابط الصورة من نتيجة التوليد')
}
