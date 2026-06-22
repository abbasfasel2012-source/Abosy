import { useEffect, useCallback, useRef } from 'react'
import {
  View, Text, FlatList, KeyboardAvoidingView, Platform,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { blink } from '@/lib/blink'
import { useChatStore } from '@/stores/chatStore'
import {
  generateStreamingResponse,
  isImageGenerationRequest,
  extractImagePrompt,
  generateImage,
} from '@/lib/ai'
import { ChatMessage } from '@/components/ChatMessage'
import { ChatInput } from '@/components/ChatInput'
import { ModelSelector } from '@/components/ModelSelector'
import { ConversationList } from '@/components/ConversationList'
import type { Message, Conversation } from '@/types'

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export default function ChatScreen() {
  const router = useRouter()
  const flatListRef = useRef<FlatList>(null)

  const conversations = useChatStore((s) => s.conversations)
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const messages = useChatStore((s) => s.messages)
  const selectedModel = useChatStore((s) => s.selectedModel)
  const religiousReferenceId = useChatStore((s) => s.religiousReferenceId)
  const isLoading = useChatStore((s) => s.isLoading)
  const streamingContent = useChatStore((s) => s.streamingContent)
  const error = useChatStore((s) => s.error)

  const setConversations = useChatStore((s) => s.setConversations)
  const setActiveConversation = useChatStore((s) => s.setActiveConversation)
  const setMessages = useChatStore((s) => s.setMessages)
  const addMessage = useChatStore((s) => s.addMessage)
  const appendStreamingChunk = useChatStore((s) => s.appendStreamingChunk)
  const setLoading = useChatStore((s) => s.setLoading)
  const setError = useChatStore((s) => s.setError)

  const { data: dbConversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const result = await blink.db.conversations.list({
        orderBy: { updated_at: 'desc' },
        limit: 50,
      })
      return (result || []) as Conversation[]
    },
  })

  useEffect(() => {
    if (dbConversations && dbConversations.length > 0) {
      setConversations(dbConversations)
      if (!activeConversationId) {
        setActiveConversation(dbConversations[0].id)
      }
    }
  }, [dbConversations])

  const { data: dbMessages } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return []
      const result = await blink.db.messages.list({
        where: { conversation_id: activeConversationId },
        orderBy: { created_at: 'asc' },
        limit: 200,
      })
      return (result || []) as Message[]
    },
    enabled: !!activeConversationId,
  })

  useEffect(() => {
    if (dbMessages) setMessages(dbMessages)
  }, [dbMessages])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
  }, [])

  const handleNewChat = useCallback(async () => {
    try {
      const newConv = await blink.db.conversations.create({
        title: 'محادثة جديدة',
        model_used: selectedModel.id,
      })
      await refetchConversations()
      setActiveConversation(newConv.id)
    } catch (err) {
      console.error('Error creating conversation:', err)
    }
  }, [selectedModel, refetchConversations, setActiveConversation])

  const handleSend = useCallback(
    async (text: string, fileUrl?: string, fileName?: string, fileType?: string) => {
      setError(null)
      let convId = activeConversationId

      if (!convId) {
        try {
          const newConv = await blink.db.conversations.create({
            title: text.slice(0, 50),
            model_used: selectedModel.id,
          })
          await refetchConversations()
          convId = newConv.id
          setActiveConversation(convId)
        } catch {
          setError('خطأ في إنشاء المحادثة')
          return
        }
      }

      const userMsg: Message = {
        id: generateId(),
        conversation_id: convId,
        role: 'user',
        content: text,
        model_used: selectedModel.id,
        file_url: fileUrl || null,
        file_name: fileName || null,
        file_type: fileType || null,
        created_at: new Date().toISOString(),
      }

      addMessage(userMsg)

      try {
        await blink.db.messages.create({
          id: userMsg.id,
          conversation_id: convId,
          role: 'user',
          content: text,
          model_used: selectedModel.id,
          file_url: fileUrl || null,
          file_name: fileName || null,
          file_type: fileType || null,
        })
        await blink.db.conversations.update(convId, {
          title: messages.length === 0 ? text.slice(0, 50) : undefined,
          updated_at: new Date().toISOString(),
        })
        await refetchConversations()
      } catch {}

      setLoading(true)
      scrollToBottom()

      const aiMsgId = generateId()

      if (isImageGenerationRequest(text)) {
        try {
          const imagePrompt = extractImagePrompt(text)
          const imageUrl = await generateImage(imagePrompt)
          const aiMsg: Message = {
            id: aiMsgId,
            conversation_id: convId,
            role: 'assistant',
            content: 'تفضل، هاي الصورة اللي طلبتها 🎨',
            model_used: selectedModel.id,
            file_url: imageUrl,
            file_name: 'صورة مولّدة',
            file_type: 'image/generated',
            created_at: new Date().toISOString(),
          }
          await blink.db.messages.create({
            id: aiMsg.id, conversation_id: convId, role: 'assistant',
            content: aiMsg.content, model_used: selectedModel.id,
            file_url: imageUrl, file_name: 'صورة مولّدة', file_type: 'image/generated',
          })
          await blink.db.conversations.update(convId, { updated_at: new Date().toISOString() })
          addMessage(aiMsg)
        } catch {
          setError('عذراً، ما قدرت أولّد الصورة. حاول مرة ثانية.')
        } finally {
          setLoading(false)
          scrollToBottom()
        }
        return
      }

      try {
        let fileContext: string | undefined
        if (fileUrl && fileName) {
          fileContext = `[ملف مرفوع: ${fileName}]\nرابط: ${fileUrl}\nالنوع: ${fileType || 'غير معروف'}`
        }

        // استدعاء generateStreamingResponse وهو يختار النموذج تلقائياً إذا auto
        const { usedModelId, autoReason } = await generateStreamingResponse(
          messages, text, selectedModel.id, religiousReferenceId,
          (chunk) => appendStreamingChunk(chunk),
          fileContext
        )

        const finalContent = useChatStore.getState().streamingContent

        const aiMsg: Message = {
          id: aiMsgId,
          conversation_id: convId,
          role: 'assistant',
          content: finalContent,
          model_used: usedModelId,
          created_at: new Date().toISOString(),
        }

        await blink.db.messages.create({
          id: aiMsg.id, conversation_id: convId, role: 'assistant',
          content: finalContent, model_used: usedModelId,
        })
        await blink.db.conversations.update(convId, { updated_at: new Date().toISOString() })

        addMessage(aiMsg)
        useChatStore.getState().streamingContent = ''
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'عذراً، صار خطأ. حاول مرة ثانية.'
        setError(errorMessage)
      } finally {
        setLoading(false)
        scrollToBottom()
      }
    },
    [activeConversationId, messages, selectedModel, religiousReferenceId,
     addMessage, appendStreamingChunk, setLoading, setError,
     setActiveConversation, refetchConversations, scrollToBottom]
  )

  const keyExtractor = useCallback((item: Message) => item.id, [])
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isLastAssistant = index === messages.length - 1 && item.role === 'assistant' && isLoading
      return (
        <ChatMessage
          message={item}
          isStreaming={isLastAssistant}
          streamingContent={isLastAssistant ? streamingContent : undefined}
        />
      )
    },
    [messages, isLoading, streamingContent]
  )

  return (
    <View style={styles.root}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#07071a', '#0e0b2e', '#07071a']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient orbs */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
        keyboardVerticalOffset={0}
      >
        {/* ─── Header ─── */}
        <View style={styles.header}>
          {Platform.OS !== 'web' && (
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFillObject} />
          )}
          <View style={styles.headerLeft}>
            <ConversationList onNewChat={handleNewChat} />
            <ModelSelector />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.settingsBtnIcon}>⚙</Text>
            </TouchableOpacity>
            <View style={styles.logoWrap}>
              <Text style={styles.logoText}>عبوسي</Text>
              <View style={styles.logoDot} />
            </View>
          </View>
        </View>

        {/* ─── Error ─── */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)} style={styles.errorClose}>
              <Text style={styles.errorCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Messages ─── */}
        <View style={styles.messagesArea}>
          {!activeConversationId && messages.length === 0 ? (
            <View style={styles.welcome}>
              {/* Glowing avatar */}
              <View style={styles.welcomeAvatar}>
                <View style={styles.welcomeAvatarGlow} />
                <Text style={styles.welcomeAvatarIcon}>✦</Text>
              </View>
              <Text style={styles.welcomeTitle}>أهلاً بيك في عبوسي</Text>
              <Text style={styles.welcomeSubtitle}>
                مساعدك الذكي باللهجة العراقية{'\n'}
                اسأل أي شي، نظم شعر، اسأل دينياً، أو ارفع ملفات
              </Text>
              <View style={styles.welcomeFeatures}>
                {['🧠 ذكاء اصطناعي', '🎨 توليد صور', '📖 شعر عراقي', '🕌 مرجعية دينية'].map((f) => (
                  <View key={f} style={styles.featureChip}>
                    <Text style={styles.featureChipText}>{f}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.startBtn} onPress={handleNewChat}>
                <LinearGradient
                  colors={['#7c3aed', '#4f46e5']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.startBtnGradient}
                >
                  <Text style={styles.startBtnText}>ابدأ المحادثة</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={keyExtractor}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
              onLayout={scrollToBottom}
              ListEmptyComponent={
                <View style={styles.emptyChat}>
                  <Text style={styles.emptyChatIcon}>💬</Text>
                  <Text style={styles.emptyChatText}>ابدأ بكتابة رسالتك الأولى</Text>
                </View>
              }
            />
          )}
        </View>

        {/* ─── Input ─── */}
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07071a' },
  kav: { flex: 1 },

  // Ambient orbs
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
  },
  orb1: {
    width: 320,
    height: 320,
    backgroundColor: '#6d28d9',
    top: -80,
    right: -80,
  },
  orb2: {
    width: 260,
    height: 260,
    backgroundColor: '#1e40af',
    bottom: 120,
    left: -80,
  },
  orb3: {
    width: 180,
    height: 180,
    backgroundColor: '#0e7490',
    top: '40%',
    right: -40,
    opacity: 0.1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 0) + 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    backgroundColor: Platform.OS === 'web' ? 'rgba(7,7,26,0.9)' : 'transparent',
    overflow: 'hidden',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  settingsBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnIcon: { color: '#94a3b8', fontSize: 15 },

  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: {
    color: '#e2e8f0',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#a78bfa',
    marginTop: 2,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239,68,68,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  errorText: { color: '#fca5a5', fontSize: 13, flex: 1, textAlign: 'right' },
  errorClose: { padding: 4 },
  errorCloseText: { color: '#f87171', fontSize: 14 },

  // Messages
  messagesArea: { flex: 1 },
  messagesList: { paddingVertical: 12, paddingBottom: 20 },
  emptyChat: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyChatIcon: { fontSize: 32 },
  emptyChatText: { color: '#475569', fontSize: 15 },

  // Welcome screen
  welcome: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 18,
  },
  welcomeAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(109,40,217,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.35)',
    marginBottom: 6,
  },
  welcomeAvatarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(109,40,217,0.2)',
  },
  welcomeAvatarIcon: { color: '#a78bfa', fontSize: 38 },
  welcomeTitle: {
    color: '#f1f5f9',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    color: '#64748b',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  welcomeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
  },
  featureChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  featureChipText: { color: '#94a3b8', fontSize: 13 },

  startBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  startBtnGradient: {
    paddingHorizontal: 36,
    paddingVertical: 14,
  },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
