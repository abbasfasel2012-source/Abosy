import { useState, useCallback } from 'react'
import { Platform } from 'react-native'
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Sheet,
} from '@blinkdotnew/mobile-ui'
import type { Conversation } from '@/types'
import { useChatStore } from '@/stores/chatStore'

interface ConversationListProps {
  onNewChat: () => void
}

export function ConversationList({ onNewChat }: ConversationListProps) {
  const [open, setOpen] = useState(false)
  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeConversationId)
  const setActive = useChatStore((s) => s.setActiveConversation)

  const handleSelect = useCallback(
    (id: string) => {
      setActive(id)
      setOpen(false)
    },
    [setActive]
  )

  const handleNew = useCallback(() => {
    onNewChat()
    setOpen(false)
  }, [onNewChat])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}د`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}س`
    const days = Math.floor(hours / 24)
    return `${days}ي`
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onPress={() => setOpen(true)}
        backgroundColor="rgba(255, 255, 255, 0.04)"
        borderWidth={1}
        borderColor="rgba(255, 255, 255, 0.08)"
        borderRadius="$full"
        paddingHorizontal="$3"
        height={36}
      >
        <Text color="$color11" fontSize={14}>☰ المحادثات</Text>
      </Button>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        snapPoints={[70]}
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
          <YStack padding="$4" gap="$3" flex={1}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text color="$color12" fontSize={20} fontWeight="700" textAlign="right">
                المحادثات
              </Text>
              <Button
                variant="primary"
                size="sm"
                onPress={handleNew}
                backgroundColor="$color9"
                borderRadius="$full"
                paddingHorizontal="$4"
                height={36}
              >
                <Text color="$color1" fontSize={13} fontWeight="600">
                  + جديدة
                </Text>
              </Button>
            </XStack>

            <ScrollView flex={1} showsVerticalScrollIndicator={false}>
              <YStack gap="$2">
                {conversations.length === 0 && (
                  <YStack
                    alignItems="center"
                    justifyContent="center"
                    padding="$8"
                    gap="$3"
                  >
                    <Text fontSize={40}>💬</Text>
                    <Text color="$color10" fontSize={15} textAlign="center">
                      لا توجد محادثات بعد
                    </Text>
                    <Text color="$color9" fontSize={13} textAlign="center">
                      ابدأ محادثة جديدة مع عبوسي
                    </Text>
                  </YStack>
                )}

                {conversations.map((conv) => {
                  const isActive = conv.id === activeId
                  return (
                    <XStack
                      key={conv.id}
                      onPress={() => handleSelect(conv.id)}
                      backgroundColor={
                        isActive
                          ? 'rgba(139, 92, 246, 0.15)'
                          : 'rgba(255, 255, 255, 0.03)'
                      }
                      borderWidth={1}
                      borderColor={
                        isActive
                          ? 'rgba(139, 92, 246, 0.3)'
                          : 'rgba(255, 255, 255, 0.05)'
                      }
                      borderRadius="$4"
                      paddingHorizontal="$4"
                      paddingVertical="$3"
                      gap="$3"
                      alignItems="center"
                      justifyContent="space-between"
                      cursor="pointer"
                    >
                      <YStack flex={1}>
                        <Text
                          color="$color12"
                          fontSize={15}
                          fontWeight="600"
                          textAlign="right"
                          numberOfLines={1}
                        >
                          {conv.title}
                        </Text>
                        <Text color="$color9" fontSize={12} textAlign="right">
                          {formatDate(conv.updated_at)}
                        </Text>
                      </YStack>
                      {isActive && (
                        <Text color="$color9" fontSize={12}>
                          ●
                        </Text>
                      )}
                    </XStack>
                  )
                })}
              </YStack>
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
