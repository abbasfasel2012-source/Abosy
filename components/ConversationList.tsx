import { useCallback, useState } from 'react'
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet, Platform, Dimensions, Pressable,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { useChatStore } from '@/stores/chatStore'
import type { Conversation } from '@/types'

interface ConversationListProps {
  onNewChat: () => void
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function ConversationList({ onNewChat }: ConversationListProps) {
  const [open, setOpen] = useState(false)
  const conversations = useChatStore((s) => s.conversations)
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const setActiveConversation = useChatStore((s) => s.setActiveConversation)

  const handleSelect = useCallback((conv: Conversation) => {
    setActiveConversation(conv.id)
    setOpen(false)
  }, [setActiveConversation])

  const handleNew = useCallback(() => {
    setOpen(false)
    onNewChat()
  }, [onNewChat])

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerIcon}>☰</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} />

        <View style={styles.drawer}>
          {Platform.OS !== 'web' && (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
          )}
          <View style={styles.drawerInner}>
            <View style={styles.handle} />

            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>المحادثات</Text>
              <TouchableOpacity style={styles.newBtn} onPress={handleNew}>
                <Text style={styles.newBtnText}>+ جديد</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyIcon}>💬</Text>
                  <Text style={styles.emptyText}>لا توجد محادثات بعد</Text>
                </View>
              }
              renderItem={({ item }) => {
                const isActive = item.id === activeConversationId
                return (
                  <TouchableOpacity
                    style={[styles.convRow, isActive && styles.convRowActive]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={[styles.convDot, isActive && styles.convDotActive]} />
                    <View style={styles.convInfo}>
                      <Text style={styles.convTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.convDate}>{formatDate(item.updated_at)}</Text>
                    </View>
                    {isActive && <Text style={styles.convCheck}>●</Text>}
                  </TouchableOpacity>
                )
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  trigger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerIcon: { color: '#94a3b8', fontSize: 16 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },

  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'web' ? 'rgba(12,12,28,0.97)' : 'rgba(12,12,28,0.5)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  drawerInner: { padding: 20, flex: 1 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 18,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  drawerTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: '700' },
  newBtn: {
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  newBtnText: { color: '#c4b5fd', fontSize: 14, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyIcon: { fontSize: 36 },
  emptyText: { color: '#475569', fontSize: 15 },

  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  convRowActive: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderColor: 'rgba(167,139,250,0.25)',
  },
  convDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  convDotActive: { backgroundColor: '#a78bfa' },
  convInfo: { flex: 1 },
  convTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '500', textAlign: 'right' },
  convDate: { color: '#475569', fontSize: 11, textAlign: 'right', marginTop: 2 },
  convCheck: { color: '#a78bfa', fontSize: 10 },
})
