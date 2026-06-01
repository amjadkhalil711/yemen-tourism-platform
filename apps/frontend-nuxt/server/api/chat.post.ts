import { defineEventHandler, readBody, createError } from 'h3';

// ══════════════════════════════════════════════════════════════════════════════
//  Nuxt Server Route: POST /api/chat
//
//  This is a thin proxy that forwards the request to the Laravel backend
//  endpoint: POST /api/v1/chatbot/message
//
//  Architecture:
//    Browser → Nuxt /api/chat → Laravel /api/v1/chatbot/message → Gemini AI
//
//  Benefits:
//  ✔ Keeps the Gemini API key on the Laravel server (never exposed to browser)
//  ✔ Laravel handles intent detection + Eloquent DB queries + rate limiting
//  ✔ Nuxt server adds an extra thin security/validation layer
// ══════════════════════════════════════════════════════════════════════════════

interface ChatRequestBody {
  query?: string;
  message?: string;
  history?: Array<{ role: 'user' | 'ai'; text: string }>;
  pageContext?: string;
  userId?: number;
}

interface LaravelChatbotResponse {
  status: string;
  message: string;
  data: {
    answer: string;
    data_used: boolean;
    source: 'database' | 'ai' | 'both' | 'fallback';
    links: Array<{ label: string; url: string }> | null;
  };
}

export default defineEventHandler(async (event) => {
  const body: ChatRequestBody = await readBody(event);

  // Support both `query` (legacy) and `message` (new) field names
  const message = (body.message ?? body.query ?? '').toString().trim();

  if (!message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message is required.',
    });
  }

  if (message.length > 500) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message must not exceed 500 characters.',
    });
  }

  const config  = useRuntimeConfig();
  const apiBase = String(config.public?.apiBase ?? 'http://localhost:8000/api/v1');

  // Forward to Laravel chatbot endpoint
  let laravelRes: LaravelChatbotResponse;

  try {
    laravelRes = await $fetch<LaravelChatbotResponse>(`${apiBase}/chatbot/message`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        message,
        history:      (body.history ?? []).slice(-10),
        page_context: body.pageContext ?? null,
        user_id:      body.userId     ?? null,
      }),
      // Do NOT throw on non-2xx — we handle errors ourselves below
      onResponseError: () => {},
    });
  } catch (fetchErr: unknown) {
    console.error('[MoniA proxy] Laravel unreachable:', fetchErr);
    // Graceful degradation: return a friendly error instead of 500
    return {
      success: false,
      message: 'service_unavailable',
      answer:  'عذراً، الخدمة غير متاحة حالياً. يرجى التحقق من تشغيل الخادم والمحاولة مرة أخرى.',
      source:  'fallback',
    };
  }

  if (!laravelRes?.data?.answer) {
    console.error('[MoniA proxy] Unexpected Laravel response:', laravelRes);
    return {
      success: false,
      message: 'invalid_response',
      answer:  'تعذّر الحصول على إجابة. يرجى المحاولة لاحقاً.',
      source:  'fallback',
    };
  }

  return {
    success:    true,
    answer:     laravelRes.data.answer,
    data_used:  laravelRes.data.data_used,
    source:     laravelRes.data.source,
    links:      laravelRes.data.links ?? null,
    confidence: null, // no longer exposed; kept for backward compat
  };
});
