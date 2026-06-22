import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Conversation, Message, ChatModel } from '@/types'
import { AVAILABLE_MODELS } from '@/types'

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Message[]
  selectedModel: ChatModel
  religiousReferenceId: string
  isLoading: boolean
  streamingContent: string
  error: string | null

  setConversations: (conversations: Conversation[]) => void
  setActiveConversation: (id: string | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  appendStreamingChunk: (chunk: string) => void
  setSelectedModel: (model: ChatModel) => void
  setReligiousReferenceId: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  getActiveConversation: () => Conversation | undefined
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      messages: [],
      selectedModel: AVAILABLE_MODELS[0],
      religiousReferenceId: 'sistani',
      isLoading: false,
      streamingContent: '',
      error: null,

      setConversations: (conversations) => set({ conversations }),

      setActiveConversation: (id) => set({ activeConversationId: id, messages: [], streamingContent: '', error: null }),

      setMessages: (messages) => set({ messages }),

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      appendStreamingChunk: (chunk) =>
        set((state) => ({ streamingContent: state.streamingContent + chunk })),

      setSelectedModel: (model) => set({ selectedModel: model }),

      setReligiousReferenceId: (id) => set({ religiousReferenceId: id }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      getActiveConversation: () => {
        const state = get()
        return state.conversations.find((c) => c.id === state.activeConversationId)
      },
    }),
    {
      name: 'abosy-chat-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // فقط الإعدادات الدائمة تُحفظ، لا تُحفظ الرسائل أو حالة التحميل
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        religiousReferenceId: state.religiousReferenceId,
      }),
    }
  )
)
