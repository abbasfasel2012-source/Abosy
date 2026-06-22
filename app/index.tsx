import { useEffect, useCallback, useRef } from 'react'
import { Platform, FlatList, KeyboardAvoidingView } from 'react-native'
import {
  YStack,
  XStack,
  Text,
  Button,
} from '@blinkdotnew/mobile-ui'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { blink } from '@/lib/blink'
import { useChatStore } from '@/stores/chatStore'
import { generateStreamingResponse, isImageGenerationRequest, extractImagePrompt, generateImage } from '@/lib/ai'
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
  const queryClient = useQueryClient()
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

  const { data: dbMessages, refetch: refetchMessages } = useQuery({
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
    if (dbMessages) {
      setMessages(dbMessages)
    }
  }, [dbMessages])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
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
        } catch (err) {
          console.error('Error creating conversation:', err)
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

        if (messages.length === 0 && activeConversationId) {
          await blink.db.conversations.update(convId, {
            title: text.slice(0, 50),
            updated_at: new Date().toISOString(),
          })
        } else {
          await blink.db.conversations.update(convId, {
            updated_at: new Date().toISOString(),
          })
        }

        await refetchConversations()
      } catch (err) {
        console.error('Error saving user message:', err)
      }

      setLoading(true)
      scrollToBottom()

      const aiMsgId = generateId()

      // طلب توليد صورة بالذكاء الاصطناعي
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
            id: aiMsg.id,
            conversation_id: convId,
            role: 'assistant',
            content: aiMsg.content,
            model_used: selectedModel.id,
            file_url: imageUrl,
            file_name: 'صورة مولّدة',
            file_type: 'image/generated',
          })

          await blink.db.conversations.update(convId, {
            updated_at: new Date().toISOString(),
          })

          addMessage(aiMsg)
        } catch (err) {
          console.error('Image generation error:', err)
          setError('عذراً، ما قدرت أولّد الصورة هسة. حاول مرة ثانية.')
        } finally {
          setLoading(false)
          scrollToBottom()
        }
        return
      }

      try {
        let fileContext: string | undefined = undefined
        if (fileUrl && fileName) {
          fileContext = `[ملف مرفوع: ${fileName}]\nرابط الملف: ${fileUrl}\nالنوع: ${fileType || 'غير معروف'}`
        }

        await generateStreamingResponse(
          messages,
          text,
          selectedModel.id,
          religiousReferenceId,
          (chunk) => appendStreamingChunk(chunk),
          fileContext
        )

        const finalContent = useChatStore.getState().streamingContent

        const aiMsg: Message = {
          id: aiMsgId,
          conversation_id: convId,
          role: 'assistant',
          content: finalContent,
          model_used: selectedModel.id,
          created_at: new Date().toISOString(),
        }

        await blink.db.messages.create({
          id: aiMsg.id,
          conversation_id: convId,
          role: 'assistant',
          content: finalContent,
          model_used: selectedModel.id,
        })

        await blink.db.conversations.update(convId, {
          updated_at: new Date().toISOString(),
        })

        addMessage(aiMsg)
        useChatStore.getState().streamingContent = ''
      } catch (err: unknown) {
        console.error('AI generation error:', err)
        const errorMessage = err instanceof Error ? err.message : 'عذراً، صار خطأ. حاول مرة ثانية.'
        setError(errorMessage)
      } finally {
        setLoading(false)
        scrollToBottom()
      }
    },
    [
      activeConversationId,
      messages,
      selectedModel,
      religiousReferenceId,
      addMessage,
      appendStreamingChunk,
      setLoading,
      setError,
      setActiveConversation,
      refetchConversations,
      scrollToBottom,
    ]
  )

  const keyExtractor = useCallback((item: Message) => item.id, [])
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isLastAssistant =
        index === messages.length - 1 && item.role === 'assistant' && isLoading
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
    <YStack flex={1} backgroundColor="#0A0A1A">
      <LinearGradient
        colors={['#0F0F2D', '#1A1040', '#0F0F2D']}
        locations={[0, 0.5, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <YStack flex={1}>
          {/* Header */}
          <XStack
            paddingHorizontal="$3"
            paddingTop="$4"
            paddingBottom="$2"
            backgroundColor="rgba(15, 23, 42, 0.7)"
            borderBottomWidth={1}
            borderBottomColor="rgba(255, 255, 255, 0.06)"
            alignItems="center"
            justifyContent="space-between"
          >
            <XStack gap="$2" alignItems="center">
              <ConversationList onNewChat={handleNewChat} />
              <ModelSelector />
            </XStack>

            <XStack gap="$2" alignItems="center">
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.push('/settings')}
                backgroundColor="rgba(255, 255, 255, 0.04)"
                borderWidth={1}
                borderColor="rgba(255, 255, 255, 0.08)"
                borderRadius="$full"
                width={36}
                height={36}
                alignItems="center"
                justifyContent="center"
              >
                <Text color="$color11" fontSize={16}>⚙</Text>
              </Button>
              <Text
                color="$color11"
                fontSize={18}
                fontWeight="800"
                textAlign="right"
              >
                عبوسي
              </Text>
            </XStack>
          </XStack>

          {/* Error banner */}
          {error && (
            <XStack
              backgroundColor="rgba(239, 68, 68, 0.15)"
              borderBottomWidth={1}
              borderBottomColor="rgba(239, 68, 68, 0.3)"
              paddingHorizontal="$4"
              paddingVertical="$3"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text color="$red10" fontSize={14} style={{ flex: 1 }} textAlign="right">
                {error}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setError(null)}
                paddingHorizontal="$2"
              >
                <Text color="$red9">✕</Text>
              </Button>
            </XStack>
          )}

          {/* Messages */}
          <YStack flex={1}>
            {!activeConversationId && messages.length === 0 ? (
              <YStack
                flex={1}
                alignItems="center"
                justifyContent="center"
                padding="$8"
                gap="$4"
              >
                <YStack
                  width={88}
                  height={88}
                  borderRadius="$full"
                  backgroundColor="rgba(139, 92, 246, 0.1)"
                  borderWidth={2}
                  borderColor="rgba(139, 92, 246, 0.3)"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="$2"
                >
                  <Text fontSize={40}>🤖</Text>
                </YStack>
                <Text color="$color12" fontSize={22} fontWeight="700" textAlign="center">
                  أهلاً بيك في عبوسي
                </Text>
                <Text color="$color10" fontSize={15} textAlign="center" lineHeight={24}>
                  مساعدك الذكي باللهجة العراقية{'\n'}
                  اسأل أي شي، نظم شعر، اسأل دينياً، ارفع ملفات
                </Text>
                <Button
                  variant="primary"
                  size="md"
                  onPress={handleNewChat}
                  backgroundColor="$color9"
                  borderRadius="$full"
                  paddingHorizontal="$6"
                  marginTop="$2"
                >
                  <Text color="$color1" fontSize={15} fontWeight="600">
                    ابدأ المحادثة
                  </Text>
                </Button>
              </YStack>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={keyExtractor}
                renderItem={renderMessage}
                contentContainerStyle={{
                  paddingVertical: 12,
                  paddingBottom: 16,
                }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={scrollToBottom}
                onLayout={scrollToBottom}
                ListEmptyComponent={
                  <YStack
                    flex={1}
                    alignItems="center"
                    justifyContent="center"
                    padding="$8"
                    gap="$3"
                  >
                    <Text fontSize={36}>💬</Text>
                    <Text color="$color10" fontSize={15} textAlign="center">
                      ابدأ بكتابة رسالتك الأولى
                    </Text>
                  </YStack>
                }
              />
            )}
          </YStack>

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </YStack>
      </KeyboardAvoidingView>
    </YStack>
  )
}
