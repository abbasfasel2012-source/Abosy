import { memo } from 'react'
import { Platform, View, Text as RNText, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import type { Message } from '@/types'
import { AVAILABLE_MODELS } from '@/types'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
  streamingContent?: string
  autoReason?: string
}

function getModelColor(modelId: string | null | undefined): string {
  if (!modelId) return '#a78bfa'
  const m = AVAILABLE_MODELS.find((m) => m.id === modelId)
  return m?.color ?? '#a78bfa'
}

function getModelIcon(modelId: string | null | undefined): string {
  if (!modelId) return '✦'
  const m = AVAILABLE_MODELS.find((m) => m.id === modelId)
  return m?.icon ?? '✦'
}

export const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming,
  streamingContent,
  autoReason,
}: ChatMessageProps) {
  const isUser = message.role === 'user'
  const displayContent = isStreaming ? streamingContent || '' : message.content
  const isImageFile = !!message.file_type && message.file_type.startsWith('image')
  const hasFile = message.file_url && message.file_name && !isImageFile
  const hasImage = message.file_url && isImageFile
  const modelColor = getModelColor(message.model_used)

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {/* Avatar for assistant */}
      {!isUser && (
        <View style={[styles.avatar, { borderColor: modelColor + '60' }]}>
          {Platform.OS !== 'web' ? (
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
          ) : null}
          <RNText style={[styles.avatarIcon, { color: modelColor }]}>
            {getModelIcon(message.model_used)}
          </RNText>
        </View>
      )}

      <View style={[styles.bubbleWrapper, isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperAssistant]}>
        {/* Glass bubble */}
        <View style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
        ]}>
          {Platform.OS !== 'web' && (
            <BlurView
              intensity={isUser ? 25 : 18}
              tint="dark"
              style={[StyleSheet.absoluteFillObject, { borderRadius: isUser ? 20 : 20 }]}
            />
          )}

          {/* Inner shimmer border */}
          <View style={[
            styles.bubbleInner,
            isUser ? styles.bubbleInnerUser : styles.bubbleInnerAssistant,
          ]}>
            {hasImage && (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: message.file_url! }}
                  style={styles.image}
                  contentFit="cover"
                  transition={300}
                />
              </View>
            )}

            {hasFile && (
              <View style={styles.fileChip}>
                <RNText style={styles.fileChipIcon}>📎</RNText>
                <RNText style={styles.fileChipText} numberOfLines={1}>
                  {message.file_name}
                </RNText>
              </View>
            )}

            <RNText style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
              {displayContent}
            </RNText>

            {isStreaming && (
              <View style={styles.streamingDot}>
                <View style={[styles.dot, { backgroundColor: modelColor }]} />
                <View style={[styles.dot, { backgroundColor: modelColor, opacity: 0.6 }]} />
                <View style={[styles.dot, { backgroundColor: modelColor, opacity: 0.3 }]} />
              </View>
            )}
          </View>
        </View>

        {/* Model tag */}
        {!isUser && message.model_used && !isStreaming && (
          <View style={styles.modelTag}>
            <View style={[styles.modelDot, { backgroundColor: modelColor }]} />
            <RNText style={[styles.modelText, { color: modelColor }]}>
              {autoReason ?? message.model_used}
            </RNText>
          </View>
        )}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'flex-end',
  },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    overflow: 'hidden',
  },
  avatarIcon: { fontSize: 15, fontWeight: '700' },

  bubbleWrapper: { maxWidth: '82%' },
  bubbleWrapperUser: { alignItems: 'flex-end' },
  bubbleWrapperAssistant: { alignItems: 'flex-start' },

  bubble: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  bubbleUser: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(139,92,246,0.22)' : 'rgba(139,92,246,0.12)',
    borderColor: 'rgba(167,139,250,0.35)',
  },
  bubbleAssistant: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.12)',
  },

  bubbleInner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleInnerUser: {},
  bubbleInnerAssistant: {},

  text: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl' as const,
    fontFamily: Platform.OS === 'web' ? 'system-ui, -apple-system, sans-serif' : undefined,
  },
  textUser: { color: '#ede9fe' },
  textAssistant: { color: '#e2e8f0' },

  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  image: { width: 240, height: 240 },

  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45,212,191,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.2)',
    gap: 6,
  },
  fileChipIcon: { fontSize: 14 },
  fileChipText: { color: '#94a3b8', fontSize: 13, flex: 1, textAlign: 'right' },

  streamingDot: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  modelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  modelDot: { width: 4, height: 4, borderRadius: 2 },
  modelText: { fontSize: 10, opacity: 0.7 },
})
