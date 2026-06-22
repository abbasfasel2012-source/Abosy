import { useState, useCallback } from 'react'
import { Platform } from 'react-native'
import {
  YStack,
  XStack,
  Text,
  Button,
  Sheet,
} from '@blinkdotnew/mobile-ui'
import { BlurView } from 'expo-blur'
import { AVAILABLE_MODELS, type ChatModel } from '@/types'
import { useChatStore } from '@/stores/chatStore'

export function ModelSelector() {
  const [open, setOpen] = useState(false)
  const selectedModel = useChatStore((s) => s.selectedModel)
  const setSelectedModel = useChatStore((s) => s.setSelectedModel)

  const handleSelect = useCallback(
    (model: ChatModel) => {
      setSelectedModel(model)
      setOpen(false)
    },
    [setSelectedModel]
  )

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onPress={() => setOpen(true)}
        backgroundColor="rgba(139, 92, 246, 0.12)"
        borderWidth={1}
        borderColor="rgba(139, 92, 246, 0.25)"
        borderRadius="$full"
        paddingHorizontal="$3"
        height={36}
      >
        <Text color="$color12" fontSize={13} fontWeight="600">
          {selectedModel.name}
        </Text>
      </Button>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        snapPoints={[60]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay
          backgroundColor="rgba(0,0,0,0.5)"
          onPress={() => setOpen(false)}
        />
        <Sheet.Frame
          backgroundColor="$color2"
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
          borderWidth={1}
          borderColor="rgba(139, 92, 246, 0.15)"
        >
          <YStack padding="$4" gap="$2">
            <Text color="$color12" fontSize={18} fontWeight="700" textAlign="right">
              اختر النموذج
            </Text>
            <Text color="$color9" fontSize={14} textAlign="right" marginBottom="$2">
              {selectedModel.id === 'auto'
                ? 'الوضع التلقائي يختار أفضل نموذج حسب سؤالك'
                : `النموذج النشط: ${selectedModel.name}`}
            </Text>

            {AVAILABLE_MODELS.map((model) => {
              const isSelected = selectedModel.id === model.id
              return (
                <XStack
                  key={model.id}
                  onPress={() => handleSelect(model)}
                  backgroundColor={
                    isSelected
                      ? 'rgba(139, 92, 246, 0.15)'
                      : 'rgba(255, 255, 255, 0.04)'
                  }
                  borderWidth={1}
                  borderColor={
                    isSelected
                      ? 'rgba(139, 92, 246, 0.4)'
                      : 'rgba(255, 255, 255, 0.06)'
                  }
                  borderRadius="$4"
                  padding="$3"
                  gap="$3"
                  alignItems="center"
                  cursor="pointer"
                >
                  <YStack
                    width={40}
                    height={40}
                    borderRadius="$3"
                    backgroundColor="rgba(139, 92, 246, 0.15)"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="$color11" fontSize={18} fontWeight="700">
                      {model.provider.charAt(0)}
                    </Text>
                  </YStack>
                  <YStack flex={1}>
                    <Text
                      color="$color12"
                      fontSize={15}
                      fontWeight="600"
                      textAlign="right"
                    >
                      {model.name}
                    </Text>
                    <Text color="$color10" fontSize={12} textAlign="right">
                      {model.provider} · {model.description}
                    </Text>
                  </YStack>
                  {isSelected && (
                    <Text color="$color9" fontSize={16}>
                      ●
                    </Text>
                  )}
                </XStack>
              )
            })}
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
