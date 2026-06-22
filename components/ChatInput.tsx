import { useState, useCallback, useRef } from 'react'
import { Platform, TextInput as RNTextInput } from 'react-native'
import { YStack, XStack, Text, Button } from '@blinkdotnew/mobile-ui'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { blink } from '@/lib/blink'

interface ChatInputProps {
  onSend: (text: string, fileUrl?: string, fileName?: string, fileType?: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const [attachedFile, setAttachedFile] = useState<{
    url: string
    name: string
    type: string
  } | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<RNTextInput>(null)

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed && !attachedFile) return

    onSend(
      trimmed || '(ملف مرفوع)',
      attachedFile?.url,
      attachedFile?.name,
      attachedFile?.type
    )
    setText('')
    setAttachedFile(null)
  }, [text, attachedFile, onSend])

  const handlePickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'text/plain'],
        copyToCacheDirectory: true,
      })

      if (result.canceled || !result.assets?.length) return

      const file = result.assets[0]
      setUploading(true)

      const ext = file.name.split('.').pop() || 'bin'
      const { publicUrl } = await blink.storage.upload(
        {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        } as unknown as File,
        `chat-files/${Date.now()}.${ext}`
      )

      setAttachedFile({
        url: publicUrl,
        name: file.name,
        type: file.mimeType || 'unknown',
      })
    } catch (err) {
      console.error('File upload error:', err)
    } finally {
      setUploading(false)
    }
  }, [])

  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      })

      if (result.canceled || !result.assets?.length) return
      const asset = result.assets[0]

      setUploading(true)
      const ext = asset.uri.split('.').pop() || 'jpg'
      const fileName = asset.fileName || `image_${Date.now()}.${ext}`

      const { publicUrl } = await blink.storage.upload(
        {
          uri: asset.uri,
          name: fileName,
          type: asset.mimeType || 'image/jpeg',
        } as unknown as File,
        `chat-files/${Date.now()}.${ext}`
      )

      setAttachedFile({
        url: publicUrl,
        name: fileName,
        type: asset.mimeType || 'image/jpeg',
      })
    } catch (err) {
      console.error('Image upload error:', err)
    } finally {
      setUploading(false)
    }
  }, [])

  return (
    <YStack
      borderTopWidth={1}
      borderTopColor="rgba(255, 255, 255, 0.06)"
      backgroundColor="rgba(15, 23, 42, 0.85)"
      paddingHorizontal="$3"
      paddingVertical="$2"
    >
      {attachedFile && (
        <XStack
          backgroundColor="rgba(45, 212, 191, 0.12)"
          borderRadius="$3"
          paddingHorizontal="$3"
          paddingVertical="$2"
          marginBottom="$2"
          borderWidth={1}
          borderColor="rgba(45, 212, 191, 0.25)"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text color="$color10" fontSize={13} numberOfLines={1} style={{ flex: 1 }}>
            📎 {attachedFile.name}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setAttachedFile(null)}
            paddingHorizontal="$2"
          >
            <Text color="$red9" fontSize={16}>✕</Text>
          </Button>
        </XStack>
      )}

      <XStack alignItems="flex-end" gap="$2">
        <Button
          variant="ghost"
          size="sm"
          onPress={handlePickDocument}
          disabled={uploading}
          width={40}
          height={40}
          borderRadius="$full"
          backgroundColor="rgba(255, 255, 255, 0.04)"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={18}>{uploading ? '⏳' : '📎'}</Text>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onPress={handlePickImage}
          disabled={uploading}
          width={40}
          height={40}
          borderRadius="$full"
          backgroundColor="rgba(255, 255, 255, 0.04)"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={18}>🖼</Text>
        </Button>

        <XStack
          flex={1}
          backgroundColor="rgba(255, 255, 255, 0.06)"
          borderRadius="$full"
          borderWidth={1}
          borderColor="rgba(255, 255, 255, 0.08)"
          paddingHorizontal="$4"
          paddingVertical="$1"
          minHeight={44}
          alignItems="center"
        >
          <RNTextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="اكتب رسالتك هنا..."
            placeholderTextColor="rgba(255, 255, 255, 0.25)"
            multiline
            maxLength={4000}
            style={{
              flex: 1,
              color: '#e2e8f0',
              fontSize: 15,
              lineHeight: 22,
              textAlign: 'right',
              writingDirection: 'rtl',
              maxHeight: 120,
              paddingVertical: 8,
              outlineStyle: 'none',
              fontFamily: Platform.OS === 'web' ? 'system-ui, -apple-system, sans-serif' : undefined,
            }}
            returnKeyType="default"
            blurOnSubmit={false}
          />
        </XStack>

        <Button
          variant="primary"
          size="sm"
          onPress={handleSend}
          disabled={disabled || (!text.trim() && !attachedFile)}
          backgroundColor="$color9"
          width={44}
          height={44}
          borderRadius="$full"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="$color1" fontSize={18} fontWeight="700">
            ↑
          </Text>
        </Button>
      </XStack>
    </YStack>
  )
}
