<template>
  <div>
    <!-- Floating Trigger Button — hidden when header handles it -->
    <Transition name="bounce-in">
      <button v-if="!isOpen && !hideFloatingTrigger" class="chatbot-trigger" @click="openChat" aria-label="فتح المساعد الذكي">
        <div class="trigger-ripple" />
        <i class="fas fa-robot" />
        <span class="trigger-label">سياحة اليمن AI</span>
      </button>
    </Transition>

    <!-- Chatbot Popup Window -->
    <Transition name="popup-slide">
      <div v-if="isOpen" class="chatbot-overlay" @click.self="isOpen = false" role="dialog" aria-modal="true" aria-labelledby="chatbot-title">
        <div class="chatbot-window" :dir="dir">

          <!-- ======= HEADER ======= -->
          <div class="chatbot-header">
            <div class="header-brand">
              <div class="header-avatar">
                <i class="fas fa-robot" />
                <span class="avatar-pulse" />
              </div>
              <div>
                <h2 id="chatbot-title" class="brand-name">سياحة اليمن AI</h2>
                <p class="brand-sub">{{ locale === 'ar' ? 'مساعد سياحة اليمن الذكي' : 'Yemen Tourism AI Assistant' }}</p>
              </div>
            </div>
            <div class="header-controls">
              <span class="dot dot-green" title="متصل" />
              <span class="dot dot-yellow" />
              <button class="dot dot-red" @click="isOpen = false" aria-label="إغلاق" />
            </div>
          </div>

          <!-- ======= BODY / MESSAGES ======= -->
          <div class="chatbot-body" ref="chatBodyRef">

            <!-- Welcome Screen (when no messages) -->
            <div v-if="messages.length === 0" class="welcome-screen">
              <div class="welcome-icon">
                <i class="fas fa-compass" />
              </div>
              <h3 class="welcome-title">
                {{ locale === 'ar' ? 'أنا مساعد ذكي لمنصة سياحة اليمن' : 'I am the AI assistant for Yemen Tourism' }}
              </h3>
              <p class="welcome-subtitle">{{ locale === 'ar' ? ' :' : 'Ask me for example:' }}</p>
              <div class="suggestions-grid">
                <button
                  v-for="(s, i) in suggestions"
                  :key="i"
                  class="suggestion-chip"
                  @click="quickAsk(s)"
                >
                  <i :class="s.icon" />
                  {{ s.text }}
                </button>
              </div>
            </div>

            <!-- Messages -->
            <TransitionGroup name="msg-appear" tag="div" class="messages-list">
              <div
                v-for="(msg, i) in messages"
                :key="i"
                :class="['message-row', msg.role]"
              >
                <!-- AI Avatar -->
                <div v-if="msg.role === 'ai'" class="msg-avatar">
                  <i class="fas fa-robot" />
                </div>

                <!-- Bubble -->
                <div :class="['bubble', msg.role]">
                  <p class="bubble-text">{{ msg.text }}</p>

                  <!-- Source Badge -->
                  <div v-if="msg.role === 'ai' && msg.source" class="source-badge" :data-src="msg.source">
                    <i :class="msg.source === 'db+ai' ? 'fas fa-database' : msg.source === 'ai-only' ? 'fas fa-brain' : 'fas fa-plug'" />
                    <span>{{ msg.source === 'db+ai'
                      ? (locale === 'ar' ? 'من قاعدة البيانات' : 'From Database')
                      : msg.source === 'ai-only'
                        ? (locale === 'ar' ? 'معرفة عامة' : 'General AI')
                        : (locale === 'ar' ? 'بيانات مباشرة' : 'Direct Data') }}</span>
                  </div>

                  <!-- Smart Link Buttons -->
                  <div v-if="msg.links && msg.links.length > 0" class="smart-links-container">
                    <NuxtLink
                      v-for="(linkObj, idx) in msg.links"
                      :key="idx"
                      :to="linkObj.url"
                      class="smart-link"
                      @click="isOpen = false"
                    >
                      <i class="fas fa-location-arrow" />
                      {{ linkObj.label }}
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </TransitionGroup>

            <!-- Typing Indicator -->
            <div v-if="isLoading" class="message-row ai">
              <div class="msg-avatar"><i class="fas fa-robot" /></div>
              <div class="bubble ai loading-bubble">
                <span class="dot-typing" /><span class="dot-typing" /><span class="dot-typing" />
              </div>
            </div>

          </div><!-- end chatbot-body -->

          <!-- ======= FOOTER ======= -->
          <div class="chatbot-footer">

            <!-- Listening Banner -->
            <Transition name="fade">
              <div v-if="isListening" class="listening-banner">
                <div class="listening-wave">
                  <span v-for="n in 5" :key="n" :style="{ animationDelay: `${n * 0.1}s` }" />
                </div>
                <p>{{ locale === 'ar' ? 'جارٍ الاستماع...' : 'Listening...' }}</p>
                <button class="stop-listen-btn" @click="stopListening">
                  <i class="fas fa-stop" />
                </button>
              </div>
            </Transition>

            <!-- Text Input Row -->
            <div class="input-row">
              <input
                ref="inputRef"
                v-model="query"
                type="text"
                class="chat-input"
                :placeholder="locale === 'ar' ? 'اكتب أو اسألني...' : 'Write or ask me...'"
                :disabled="isLoading || isListening"
                @keyup.enter="sendMessage"
              />
              <button
                class="send-btn"
                :disabled="!query.trim() || isLoading || isListening"
                @click="sendMessage"
              >
                <i class="fas fa-paper-plane" />
              </button>
            </div>

            <!-- Mic Button & Back Button Row -->
            <div class="mic-row">
              <button
                class="mic-btn"
                :class="{ active: isListening }"
                @click="toggleListen"
                :aria-label="locale === 'ar' ? 'الإدخال الصوتي' : 'Voice Input'"
              >
                <i class="fas" :class="isListening ? 'fa-microphone-slash' : 'fa-microphone'" />
              </button>

              <!-- Back button (shown when in a conversation) -->
              <Transition name="fade">
                <button
                  v-if="messages.length > 0"
                  class="back-btn-tourist"
                  @click="clearChat"
                  :aria-label="locale === 'ar' ? 'رجوع' : 'Back'"
                >
                  <i class="fas fa-undo-alt" />
                  <span>{{ locale === 'ar' ? 'رجوع' : 'Back' }}</span>
                </button>
              </Transition>
            </div>

            <!-- Footer Bar -->
            <div class="footer-bar">
              <span>{{ locale === 'ar' ? 'العربية' : 'English' }}</span>
              <i class="fas fa-moon" />
            </div>

          </div><!-- end chatbot-footer -->

        </div><!-- end chatbot-window -->
      </div><!-- end overlay -->
    </Transition>
  </div>
</template>

<script setup lang="ts">
// ── Props ─────────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{ hideFloatingTrigger?: boolean }>(), {
  hideFloatingTrigger: false
})
interface ChatMessage {
  role: 'user' | 'ai'
  text: string
  links?: Array<{ label: string, url: string }> | null
  source?: 'db+ai' | 'ai-only' | 'fallback' | 'database' | 'ai'
}

interface ChatApiResponse {
  success: boolean
  answer?: string
  links?: Array<{ label: string, url: string }> | null
  message?: string
}

const { locale, dir } = useLocale()
const router = useRouter()

const isOpen = ref(false)
const query = ref('')
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const isListening = ref(false)
const chatBodyRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

// ── Suggestions ────────────────────────────────────────────────────────────
const suggestions = computed(() => {
  const ar = locale.value === 'ar'
  return [
    { icon: 'fas fa-city', text: ar ? 'ما هي أبرز مدن اليمن؟' : 'What are Yemen\'s top cities?' },
    { icon: 'fas fa-monument', text: ar ? 'أشهر المعالم الأثرية' : 'Famous archaeological landmarks' },
    { icon: 'fas fa-umbrella-beach', text: ar ? 'المناطق الساحلية' : 'Coastal Areas' },
    { icon: 'fas fa-info-circle', text: ar ? 'كيف أتواصل معكم؟' : 'How to contact you?' },
  ]
})

// ── Helpers ────────────────────────────────────────────────────────────────
const scrollToBottom = async () => {
  await nextTick()
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  }
}

const openChat = () => {
  isOpen.value = true
  nextTick(() => inputRef.value?.focus())
}

const clearChat = () => {
  messages.value = []
  query.value = ''
  isLoading.value = false
  isListening.value = false
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

const quickAsk = (suggestion: { text: string }) => {
  query.value = suggestion.text
  sendMessage()
}

// ── Send Message ───────────────────────────────────────────────────────────
const sendMessage = async () => {
  const text = query.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ role: 'user', text })
  query.value = ''
  isLoading.value = true
  await scrollToBottom()

  try {
    // Build history to send (last 6 messages for context)
    const history = messages.value
      .slice(-7, -1)  // last 6 before current
      .map(m => ({ role: m.role, text: m.text }))

    // Server: searches DB + calls Gemini with full context
    const res = await $fetch<any>('/api/chat', {
      method: 'POST',
      body: { query: text, history }
    })

    if (!res.success) throw new Error(res.message || 'Server error')

    messages.value.push({
      role: 'ai',
      text: res.answer,
      links: res.links ?? null,
      source: res.source
    })

    speakText(res.answer)

  } catch (error) {
    console.error('[Chatbot Error]', error)
    messages.value.push({
      role: 'ai',
      text: locale.value === 'ar'
        ? 'عذراً، حدث خطأ أثناء معالجة السؤال. تأكد من اتصالك بالإنترنت.'
        : 'Sorry, an error occurred. Please check your internet connection.',
      links: null
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

// ── Text-to-Speech ─────────────────────────────────────────────────────────
const speakText = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  // Limit TTS length to avoid super long reads
  const excerpt = text.length > 200 ? text.slice(0, 200) + '...' : text
  const utterance = new SpeechSynthesisUtterance(excerpt)
  utterance.lang = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  utterance.rate = 0.95
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

// ── Voice Recognition ──────────────────────────────────────────────────────
let recognition: any = null

onMounted(() => {
  if (typeof window === 'undefined') return
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SR) return

  recognition = new SR()
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onresult = (event: any) => {
    const transcript: string = event.results[0][0].transcript
    query.value = transcript
    isListening.value = false
    sendMessage()
  }

  recognition.onerror = () => { isListening.value = false }
  recognition.onend = () => { isListening.value = false }
})

// Update lang dynamically
watch(locale, (lang) => {
  if (recognition) recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US'
}, { immediate: true })

const toggleListen = () => {
  if (!recognition) {
    alert(locale.value === 'ar' ? 'متصفحك لا يدعم الإدخال الصوتي.' : 'Your browser does not support voice input.')
    return
  }
  if (isListening.value) {
    stopListening()
  } else {
    try {
      recognition.lang = locale.value === 'ar' ? 'ar-SA' : 'en-US'
      recognition.start()
      isListening.value = true
    } catch { /* already started */ }
  }
}

const stopListening = () => {
  recognition?.stop()
  isListening.value = false
}

// Stop TTS when modal is closed
watch(isOpen, (val) => {
  if (!val && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
})

// Expose openChat so parent layout can open the chatbot from the header button
defineExpose({ openChat })
</script>

<style scoped>
/* ──────────────────────────────────────────────
   FLOATING TRIGGER BUTTON
────────────────────────────────────────────── */
.chatbot-trigger {
  position: fixed;
  bottom: 110px;
  right: 30px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 50px;
  background: linear-gradient(135deg, #d97706, #0d9488);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 800;
  font-family: 'Tajawal', 'Inter', sans-serif;
  box-shadow: 0 10px 30px rgba(217, 119, 6, 0.35);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.chatbot-trigger:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 16px 38px rgba(217, 119, 6, 0.45);
}
.chatbot-trigger .fas {
  font-size: 1.3rem;
}
.trigger-label {
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}
.trigger-ripple {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.2);
  animation: ripple-out 2s ease-out infinite;
}
@keyframes ripple-out {
  0%   { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* ──────────────────────────────────────────────
   OVERLAY
────────────────────────────────────────────── */
.chatbot-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: fade-overlay 0.3s ease;
}
@keyframes fade-overlay {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ──────────────────────────────────────────────
   WINDOW (Glassmorphism & Tourist theme)
────────────────────────────────────────────── */
.chatbot-window {
  width: 92%;
  max-width: 480px;
  height: 82vh;
  max-height: 680px;
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(247, 249, 253, 0.82));
  backdrop-filter: blur(35px);
  -webkit-backdrop-filter: blur(35px);
  border: 1px solid rgba(217, 119, 6, 0.18);
  box-shadow:
    0 30px 70px rgba(15, 23, 42, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;
  font-family: 'Tajawal', 'Inter', sans-serif;
  color: #1e293b;
  transition: all 0.3s ease;
}

/* ──────────────────────────────────────────────
   HEADER
────────────────────────────────────────────── */
.chatbot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 18px;
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(217, 119, 6, 0.12);
}
.header-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 15px;
  background: linear-gradient(135deg, #d97706, #0d9488);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  box-shadow: 0 4px 15px rgba(217, 119, 6, 0.25);
}
.avatar-pulse {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 11px;
  height: 11px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.2); }
}
.brand-name {
  font-size: 1.35rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(to right, #d97706, #0d9488);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}
.brand-sub {
  font-size: 0.8rem;
  color: #64748b;
  margin: 3px 0 0;
  font-weight: 600;
}
.header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}
.dot:hover { opacity: 0.75; }
.dot-green  { background: #10b981; }
.dot-yellow { background: #f59e0b; cursor: default; }
.dot-red    { background: #ef4444; }

/* ──────────────────────────────────────────────
   BODY
────────────────────────────────────────────── */
.chatbot-body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 20px;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
}
.chatbot-body::-webkit-scrollbar { width: 6px; }
.chatbot-body::-webkit-scrollbar-thumb { background: rgba(217, 119, 6, 0.15); border-radius: 10px; }
.chatbot-body::-webkit-scrollbar-thumb:hover { background: rgba(217, 119, 6, 0.3); }

/* Welcome Screen */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: auto;
  padding: 15px 0;
  max-width: 90%;
}
.welcome-icon {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: linear-gradient(135deg, #d97706, #0d9488);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 10px 25px rgba(217, 119, 6, 0.25);
  animation: compass-breathing 4s ease-in-out infinite alternate;
}
@keyframes compass-breathing {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.06) rotate(15deg); }
  100% { transform: scale(1) rotate(-10deg); }
}
.welcome-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px;
}
.welcome-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 20px;
  font-weight: 500;
}
.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.suggestion-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(217, 119, 6, 0.15);
  color: #b45309;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
}
.suggestion-chip:hover {
  background: rgba(217, 119, 6, 0.08);
  border-color: #d97706;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 18px rgba(217, 119, 6, 0.12);
}

/* Messages */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
.message-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}
.message-row.user {
  flex-direction: row-reverse;
}
.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: linear-gradient(135deg, #d97706, #0d9488);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(217, 119, 6, 0.15);
}
.bubble {
  max-width: 80%;
  padding: 14px 18px;
  border-radius: 20px;
  line-height: 1.6;
  font-size: 0.95rem;
}
.bubble.user {
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
  border-radius: 20px 20px 4px 20px;
  box-shadow: 0 6px 18px rgba(239, 68, 68, 0.22);
}
[dir="rtl"] .bubble.user {
  border-radius: 20px 20px 20px 4px;
}
.bubble.ai {
  background: white;
  color: #1e293b;
  border-radius: 20px 20px 20px 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(217, 119, 6, 0.12);
  border-left: 4px solid #d97706; /* Yemen Gold Architectural Accent */
}
[dir="rtl"] .bubble.ai {
  border-radius: 20px 20px 4px 20px;
  border-left: 1px solid rgba(217, 119, 6, 0.12);
  border-right: 4px solid #d97706;
}
.bubble-text {
  margin: 0 0 6px;
  white-space: pre-wrap;
}
.bubble-text:last-child {
  margin-bottom: 0;
}

/* Smart Links */
.smart-links-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.smart-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border-radius: 30px;
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white !important;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}
.smart-link:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.35);
}

/* Source Badge */
.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  margin-bottom: 2px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
}
.source-badge[data-src="db+ai"] {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.source-badge[data-src="ai-only"] {
  background: rgba(217, 119, 6, 0.08);
  color: #d97706;
  border: 1px solid rgba(217, 119, 6, 0.2);
}
.source-badge[data-src="fallback"] {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Loading bubble */
.loading-bubble {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 16px 20px;
}
.dot-typing {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #94a3b8;
  animation: typing-bounce 1.4s ease-in-out infinite;
}
.dot-typing:nth-child(2) { animation-delay: 0.16s; }
.dot-typing:nth-child(3) { animation-delay: 0.32s; }
@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40%           { transform: scale(1);   opacity: 1; }
}

/* ──────────────────────────────────────────────
   FOOTER
────────────────────────────────────────────── */
.chatbot-footer {
  padding: 16px 20px 18px;
  background: rgba(255, 255, 255, 0.45);
  border-top: 1px solid rgba(217, 119, 6, 0.12);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Listening Banner */
.listening-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 11px 18px;
  border-radius: 16px;
  background: rgba(13, 148, 136, 0.1);
  border: 1px solid rgba(13, 148, 136, 0.25);
  color: #0d9488;
  font-size: 0.9rem;
  font-weight: 700;
}
.listening-wave {
  display: flex;
  align-items: center;
  gap: 3px;
}
.listening-wave span {
  display: inline-block;
  width: 3px;
  height: 18px;
  background: #0d9488;
  border-radius: 3px;
  animation: wave-bar 0.8s ease-in-out infinite alternate;
}
.listening-wave span:nth-child(2) { height: 11px; animation-delay: 0.1s; }
.listening-wave span:nth-child(3) { height: 22px; animation-delay: 0.2s; }
.listening-wave span:nth-child(4) { height: 11px; animation-delay: 0.3s; }
.listening-wave span:nth-child(5) { height: 16px; animation-delay: 0.4s; }
@keyframes wave-bar {
  from { transform: scaleY(0.5); }
  to   { transform: scaleY(1); }
}
.stop-listen-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: transform 0.2s;
}
.stop-listen-btn:hover { transform: scale(1.1); }

/* Input Row */
.input-row {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  padding: 6px 6px 6px 18px;
  box-shadow: 0 4px 15px rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(217, 119, 6, 0.15);
}
[dir="rtl"] .input-row {
  padding: 6px 18px 6px 6px;
}
.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.98rem;
  font-family: inherit;
  color: #1e293b;
}
.chat-input::placeholder { color: #94a3b8; }
.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: transform 0.2s, opacity 0.2s;
}
.send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.send-btn:not(:disabled):hover { transform: scale(1.08); }

/* Mic & Back Button Row */
.mic-row {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  min-height: 70px;
}
.mic-btn {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0d9488, #10b981);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.35);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  z-index: 2;
}
.mic-btn::after {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 2px solid rgba(13, 148, 136, 0.3);
  animation: mic-ring 2.2s ease-out infinite;
}
@keyframes mic-ring {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(1.45); opacity: 0; }
}
.mic-btn.active {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
  animation: mic-pulse 1.2s ease-in-out infinite;
}
.mic-btn.active::after {
  border-color: rgba(239, 68, 68, 0.4);
}
@keyframes mic-pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.05); }
}
.mic-btn:not(.active):hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(13, 148, 136, 0.45);
}

/* Beautiful Tourist Back Button */
.back-btn-tourist {
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(217, 119, 6, 0.35); /* Elegant gold/amber border */
  color: #b45309; /* amber-800 */
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 15px rgba(217, 119, 6, 0.15);
  z-index: 5;
}
[dir="rtl"] .back-btn-tourist {
  left: 0;
  right: auto;
}
.back-btn-tourist:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: white;
  border-color: transparent;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(217, 119, 6, 0.35);
}

/* Footer bar */
.footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: #94a3b8;
  font-weight: 600;
}
.footer-bar .fa-moon {
  color: #f59e0b;
}

/* ──────────────────────────────────────────────
   TRANSITIONS
────────────────────────────────────────────── */
.bounce-in-enter-active { animation: bounce-in 0.4s ease; }
.bounce-in-leave-active { animation: bounce-in 0.25s ease reverse; }
@keyframes bounce-in {
  0%   { transform: scale(0.7) translateY(20px); opacity: 0; }
  70%  { transform: scale(1.05); }
  100% { transform: scale(1) translateY(0);    opacity: 1; }
}

.popup-slide-enter-active { animation: popup-open 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.popup-slide-leave-active { animation: popup-open 0.25s ease reverse; }
@keyframes popup-open {
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.msg-appear-enter-active { transition: all 0.3s ease; }
.msg-appear-enter-from   { opacity: 0; transform: translateY(12px); }
.msg-appear-move         { transition: transform 0.3s ease; }
</style>
