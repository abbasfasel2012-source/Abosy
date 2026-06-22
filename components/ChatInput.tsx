import { useState, useCallback, useRef } from 'react'
import { Platform, TextInput as RNTextInput, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { blink } from '@/lib/blink'

interface ChatInputProps {
  onSend: (text: string, fileUrl?: string, fileName?: string, fileType?: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string; type: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<RNTextInput>(null)

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed && !attachedFile) return
    onSend(trimmed || '(ملف مرفوع)', attachedFile?.url, attachedFile?.name, attachedFile?.type)
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
        { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' } as unknown as File,
        `chat-files/${Date.now()}.${ext}`
      )
      setAttachedFile({ url: publicUrl, name: file.name, type: file.mimeType || 'unknown' })
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
        { uri: asset.uri, name: fileName, type: asset.mimeType || 'image/jpeg' } as unknown as File,
        `chat-files/${Date.now()}.${ext}`
      )
      setAttachedFile({ url: publicUrl, name: fileName, type: asset.mimeType || 'image/jpeg' })
    } catch (err) {
      console.error('Image upload error:', err)
    } finally {
      setUploading(false)
    }
  }, [])

  const canSend = !disabled && !uploading && (text.trim().length > 0 || !!attachedFile)

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && (
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
      )}
      <View style={styles.inner}>
        {attachedFile && (
          <View style={styles.filePreview}>
            <Text style={styles.filePreviewText} numberOfLines={1}>📎 {attachedFile.name}</Text>
            <TouchableOpacity onPress={() => setAttachedFile(null)} style={styles.fileRemove}>
              <Text style={styles.fileRemoveText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          {/* Attach buttons */}
          <View style={styles.attachButtons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handlePickDocument}
              disabled={uploading}
            >
              <Text style={styles.iconBtnText}>{uploading ? '⏳' : '📎'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handlePickImage}
              disabled={uploading}
            >
              <Text style={styles.iconBtnText}>🖼</Text>
            </TouchableOpacity>
          </View>

          {/* Text input */}
          <View style={styles.textInputWrapper}>
            <RNTextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              placeholder="اكتب رسالتك هنا..."
              placeholderTextColor="rgba(255,255,255,0.2)"
              multiline
              maxLength={4000}
              style={styles.textInput}
              returnKeyType="default"
              blurOnSubmit={false}
            />
          </View>

          {/* Send button */}
          <TouchableOpacity
            style={[styles.sendBtn, canSend ? styles.sendBtnActive : styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!canSend}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    backgroundColor: Platform.OS === 'web' ? 'rgba(10,10,26,0.92)' : 'transparent',
    overflow: 'hidden',
  },
  inner: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45,212,191,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.2)',
  },
  filePreviewText: { color: '#94a3b8', fontSize: 13, flex: 1, textAlign: 'right' },
  fileRemove: { padding: 4 },
  fileRemoveText: { color: '#f87171', fontSize: 14 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButtons: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 17 },

  textInputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  textInput: {
    color: '#e2e8f0',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
    maxHeight: 120,
    paddingVertical: 8,
    fontFamily: Platform.OS === 'web' ? 'system-ui,-apple-system,sans-serif' : undefined,
    // @ts-ignore
    outlineStyle: 'none',
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sendBtnActive: {
    backgroundColor: 'rgba(139,92,246,0.85)',
    borderColor: 'rgba(167,139,250,0.5)',
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.07)',
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
})
