import { memo } from 'react'
import { Platform } from 'react-native'
import { YStack, XStack, Text } from '@blinkdotnew/mobile-ui'
import { Image } from 'expo-image'
import type { Message } from '@/types'
import { BlurView } from 'expo-blur'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
  streamingContent?: string
}

export const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming,
  streamingContent,
}: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const displayContent = isStreaming ? streamingContent || '' : message.content

  const isImageFile = !!message.file_type && message.file_type.startsWith('image')
  const hasFile = message.file_url && message.file_name && !isImageFile
  const hasImage = message.file_url && isImageFile

  return (
    <XStack
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      paddingHorizontal="$3"
      paddingVertical="$2"
    >
      <YStack
        maxWidth="85%"
        borderRadius="$5"
        paddingHorizontal="$4"
        paddingVertical="$3"
        borderWidth={1}
        borderColor={isUser ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.08)'}
        backgroundColor={
          isUser
            ? 'rgba(139, 92, 246, 0.18)'
            : 'rgba(255, 255, 255, 0.06)'
        }
        overflow="hidden"
      >
        {Platform.OS !== 'web' && (
          <BlurView
            intensity={15}
            tint="dark"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 16,
            }}
          />
        )}

        {hasImage && (
          <YStack
            borderRadius="$4"
            overflow="hidden"
            marginBottom="$2"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.1)"
          >
            <Image
              source={{ uri: message.file_url! }}
              style={{ width: 240, height: 240 }}
              contentFit="cover"
              transition={200}
            />
          </YStack>
        )}

        {hasFile && (
          <XStack
            backgroundColor="rgba(45, 212, 191, 0.12)"
            borderRadius="$3"
            paddingHorizontal="$3"
            paddingVertical="$2"
            marginBottom="$2"
            borderWidth={1}
            borderColor="rgba(45, 212, 191, 0.25)"
            gap="$2"
            alignItems="center"
          >
            <Text color="$color12" fontSize={14}>📎</Text>
            <Text
              color="$color10"
              fontSize={13}
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {message.file_name}
            </Text>
          </XStack>
        )}

        <Text
          color={isUser ? '#e9d5ff' : '$color11'}
          fontSize={15}
          lineHeight={24}
          textAlign={isUser ? 'right' : 'right'}
          style={{ writingDirection: 'rtl' }}
        >
          {displayContent}
        </Text>

        {isStreaming && (
          <Text
            color="rgba(45, 212, 191, 0.8)"
            fontSize={14}
            marginTop="$1"
          >
            ●
          </Text>
        )}

        {(isAssistant && message.model_used && !isStreaming) && (
          <Text
            color="$color9"
            fontSize={11}
            marginTop="$2"
            textAlign="right"
          >
            {message.model_used}
          </Text>
        )}
      </YStack>
    </XStack>
  )
})
