import { useState } from 'react'
import { Platform } from 'react-native'
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
} from '@blinkdotnew/mobile-ui'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useChatStore } from '@/stores/chatStore'
import { AVAILABLE_MODELS, RELIGIOUS_REFERENCES, type ChatModel } from '@/types'

export default function SettingsScreen() {
  const router = useRouter()
  const selectedModel = useChatStore((s) => s.selectedModel)
  const setSelectedModel = useChatStore((s) => s.setSelectedModel)
  const religiousReferenceId = useChatStore((s) => s.religiousReferenceId)
  const setReligiousReferenceId = useChatStore((s) => s.setReligiousReferenceId)
  const setMessages = useChatStore((s) => s.setMessages)
  const setActiveConversation = useChatStore((s) => s.setActiveConversation)
  const setError = useChatStore((s) => s.setError)

  const handleClearChat = () => {
    setMessages([])
    setActiveConversation(null)
    setError(null)
  }

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

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack padding="$4" gap="$5">
          {/* Header */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingVertical="$2"
          >
            <Text color="$color12" fontSize={22} fontWeight="800" textAlign="right">
              الإعدادات
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              backgroundColor="rgba(255, 255, 255, 0.04)"
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.08)"
              borderRadius="$full"
              width={36}
              height={36}
              alignItems="center"
              justifyContent="center"
            >
              <Text color="$color11" fontSize={16}>✕</Text>
            </Button>
          </XStack>

          {/* Model Selection */}
          <YStack
            backgroundColor="rgba(255, 255, 255, 0.04)"
            borderRadius="$5"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.06)"
            padding="$4"
            gap="$3"
          >
            <Text color="$color12" fontSize={17} fontWeight="700" textAlign="right">
              النموذج الافتراضي
            </Text>
            <Text color="$color10" fontSize={13} textAlign="right">
              اختر النموذج المستخدم للإجابة على أسئلتك
            </Text>

            <YStack gap="$1">
              {AVAILABLE_MODELS.map((model) => (
                <XStack
                  key={model.id}
                  onPress={() => setSelectedModel(model)}
                  backgroundColor={
                    selectedModel.id === model.id
                      ? 'rgba(139, 92, 246, 0.15)'
                      : 'transparent'
                  }
                  borderWidth={1}
                  borderColor={
                    selectedModel.id === model.id
                      ? 'rgba(139, 92, 246, 0.3)'
                      : 'rgba(255, 255, 255, 0.04)'
                  }
                  borderRadius="$4"
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  gap="$3"
                  alignItems="center"
                  cursor="pointer"
                >
                  <YStack width={36} height={36} borderRadius="$3" backgroundColor="rgba(139, 92, 246, 0.12)" alignItems="center" justifyContent="center">
                    <Text color="$color11" fontSize={16} fontWeight="700">{model.provider.charAt(0)}</Text>
                  </YStack>
                  <YStack flex={1}>
                    <Text color="$color12" fontSize={15} fontWeight="600" textAlign="right">{model.name}</Text>
                    <Text color="$color10" fontSize={12} textAlign="right">{model.provider} · {model.description}</Text>
                  </YStack>
                  {selectedModel.id === model.id && (
                    <Text color="$color9" fontSize={14}>●</Text>
                  )}
                </XStack>
              ))}
            </YStack>
          </YStack>

          {/* Religious Reference */}
          <YStack
            backgroundColor="rgba(255, 255, 255, 0.04)"
            borderRadius="$5"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.06)"
            padding="$4"
            gap="$3"
          >
            <Text color="$color12" fontSize={17} fontWeight="700" textAlign="right">
              المرجعية الدينية
            </Text>
            <Text color="$color10" fontSize={13} textAlign="right">
              اختر المرجعية المعتمدة للإجابة على الأسئلة الدينية
            </Text>

            <YStack gap="$1">
              {RELIGIOUS_REFERENCES.map((ref) => (
                <XStack
                  key={ref.id}
                  onPress={() => setReligiousReferenceId(ref.id)}
                  backgroundColor={
                    religiousReferenceId === ref.id
                      ? 'rgba(139, 92, 246, 0.15)'
                      : 'transparent'
                  }
                  borderWidth={1}
                  borderColor={
                    religiousReferenceId === ref.id
                      ? 'rgba(139, 92, 246, 0.3)'
                      : 'rgba(255, 255, 255, 0.04)'
                  }
                  borderRadius="$4"
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  alignItems="center"
                  justifyContent="space-between"
                  cursor="pointer"
                >
                  <Text
                    color="$color12"
                    fontSize={15}
                    textAlign="right"
                    style={{ flex: 1 }}
                    numberOfLines={2}
                  >
                    {ref.name}
                  </Text>
                  {religiousReferenceId === ref.id && (
                    <Text color="$color9" fontSize={14}>●</Text>
                  )}
                </XStack>
              ))}
            </YStack>
          </YStack>

          {/* App Info */}
          <YStack
            backgroundColor="rgba(255, 255, 255, 0.04)"
            borderRadius="$5"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.06)"
            padding="$4"
            gap="$3"
          >
            <Text color="$color12" fontSize={17} fontWeight="700" textAlign="right">
              حول التطبيق
            </Text>

            <YStack gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$color9" fontSize={14}>الإصدار</Text>
                <Text color="$color11" fontSize={14}>1.0.0</Text>
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$color9" fontSize={14}>المطور</Text>
                <Text color="$color11" fontSize={14}>عبوسي</Text>
              </XStack>
            </YStack>

            <Button
              variant="outline"
              size="md"
              onPress={handleClearChat}
              borderColor="rgba(239, 68, 68, 0.3)"
              backgroundColor="rgba(239, 68, 68, 0.05)"
              borderRadius="$4"
              marginTop="$2"
            >
              <Text color="$red10" fontSize={15} fontWeight="600">
                مسح المحادثة الحالية
              </Text>
            </Button>
          </YStack>

          <YStack paddingVertical="$4" />
        </YStack>
      </ScrollView>
    </YStack>
  )
}
