import { useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
  StyleSheet, Platform, Dimensions, Pressable,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { AVAILABLE_MODELS, type ChatModel } from '@/types'
import { useChatStore } from '@/stores/chatStore'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export function ModelSelector() {
  const [open, setOpen] = useState(false)
  const selectedModel = useChatStore((s) => s.selectedModel)
  const setSelectedModel = useChatStore((s) => s.setSelectedModel)

  const handleSelect = useCallback((model: ChatModel) => {
    setSelectedModel(model)
    setOpen(false)
  }, [setSelectedModel])

  const isAuto = selectedModel.id === 'auto'

  return (
    <>
      {/* Trigger chip */}
      <TouchableOpacity style={[styles.chip, isAuto && styles.chipAuto]} onPress={() => setOpen(true)}>
        <Text style={[styles.chipIcon, { color: selectedModel.color }]}>{selectedModel.icon}</Text>
        <Text style={[styles.chipText, { color: isAuto ? '#c4b5fd' : '#e2e8f0' }]}>
          {selectedModel.name}
        </Text>
        <Text style={styles.chipCaret}>⌄</Text>
      </TouchableOpacity>

      {/* Bottom sheet modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} />

        <View style={styles.sheet}>
          {Platform.OS !== 'web' && (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
          )}
          <View style={styles.sheetInner}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Title */}
            <Text style={styles.sheetTitle}>اختر النموذج</Text>
            <Text style={styles.sheetSubtitle}>
              {isAuto
                ? '✦ الوضع التلقائي — عبوسي AI يختار أفضل نموذج حسب سؤالك'
                : `النموذج النشط: ${selectedModel.name}`}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModel.id === model.id
                return (
                  <TouchableOpacity
                    key={model.id}
                    style={[styles.modelRow, isSelected && styles.modelRowSelected]}
                    onPress={() => handleSelect(model)}
                  >
                    {Platform.OS !== 'web' && isSelected && (
                      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
                    )}

                    {/* Icon badge */}
                    <View style={[styles.modelIcon, { borderColor: model.color + '50', backgroundColor: model.color + '18' }]}>
                      <Text style={[styles.modelIconText, { color: model.color }]}>{model.icon}</Text>
                    </View>

                    {/* Info */}
                    <View style={styles.modelInfo}>
                      <View style={styles.modelNameRow}>
                        <Text style={styles.modelName}>{model.name}</Text>
                        {model.id === 'auto' && (
                          <View style={styles.autoBadge}>
                            <Text style={styles.autoBadgeText}>افتراضي</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.modelProvider}>{model.provider}</Text>
                      <Text style={styles.modelDesc}>{model.description}</Text>
                    </View>

                    {/* Check */}
                    {isSelected && (
                      <View style={[styles.checkCircle, { borderColor: model.color, backgroundColor: model.color + '25' }]}>
                        <Text style={[styles.checkIcon, { color: model.color }]}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    height: 36,
  },
  chipAuto: {
    backgroundColor: 'rgba(139,92,246,0.14)',
    borderColor: 'rgba(167,139,250,0.3)',
  },
  chipIcon: { fontSize: 13, fontWeight: '700' },
  chipText: { fontSize: 13, fontWeight: '600' },
  chipCaret: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 1 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.75,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'web' ? 'rgba(15,15,35,0.97)' : 'rgba(15,15,35,0.5)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sheetInner: {
    padding: 20,
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 6,
  },
  sheetSubtitle: {
    color: '#a78bfa',
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 16,
    lineHeight: 20,
  },

  list: { flex: 1 },

  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  modelRowSelected: {
    borderColor: 'rgba(167,139,250,0.35)',
    backgroundColor: 'rgba(139,92,246,0.1)',
  },

  modelIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelIconText: { fontSize: 18, fontWeight: '800' },

  modelInfo: { flex: 1 },
  modelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginBottom: 2,
  },
  modelName: { color: '#f1f5f9', fontSize: 15, fontWeight: '600', textAlign: 'right' },
  autoBadge: {
    backgroundColor: 'rgba(167,139,250,0.2)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  autoBadgeText: { color: '#c4b5fd', fontSize: 10, fontWeight: '600' },
  modelProvider: { color: '#64748b', fontSize: 11, textAlign: 'right', marginBottom: 2 },
  modelDesc: { color: '#94a3b8', fontSize: 12, textAlign: 'right', lineHeight: 16 },

  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: { fontSize: 13, fontWeight: '700' },
})
