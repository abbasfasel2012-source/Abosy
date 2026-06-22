import { useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
  StyleSheet, Platform, Dimensions, Pressable, Animated,
} from 'react-native'
import { BlurView } from 'expo-blur'
import { AVAILABLE_MODELS, type ChatModel } from '@/types'
import { useChatStore } from '@/stores/chatStore'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export function ModelSelector() {
  const [open, setOpen] = useState(false)
  const [lastSelected, setLastSelected] = useState<string | null>(null)
  const selectedModel = useChatStore((s) => s.selectedModel)
  const setSelectedModel = useChatStore((s) => s.setSelectedModel)

  const handleSelect = useCallback((model: ChatModel) => {
    setSelectedModel(model)
    setLastSelected(model.id)
    setTimeout(() => setOpen(false), 250) // تأخير بسيط يخلي المستخدم يشوف الـ checkmark
  }, [setSelectedModel])

  const isAuto = selectedModel.id === 'auto'

  return (
    <>
      {/* ── Trigger chip ── */}
      <TouchableOpacity
        style={[styles.chip, { borderColor: selectedModel.color + '55', backgroundColor: selectedModel.color + '14' }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <Text style={[styles.chipIcon, { color: selectedModel.color }]}>{selectedModel.icon}</Text>
        <Text style={[styles.chipLabel, { color: selectedModel.color }]}>
          {isAuto ? 'تلقائي ذكي' : selectedModel.name}
        </Text>
        <Text style={styles.chipCaret}>⌄</Text>
      </TouchableOpacity>

      {/* ── Bottom sheet ── */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} />

        <View style={styles.sheet}>
          {Platform.OS !== 'web' && (
            <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFillObject} />
          )}
          <View style={styles.sheetInner}>
            <View style={styles.handle} />

            {/* Title */}
            <Text style={styles.title}>اختر النموذج</Text>
            <Text style={styles.subtitle}>
              النموذج المختار حالياً:{' '}
              <Text style={[styles.subtitleHighlight, { color: selectedModel.color }]}>
                {selectedModel.name}
              </Text>
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {/* Auto option — مميّز */}
              {AVAILABLE_MODELS.filter((m) => m.id === 'auto').map((model) => {
                const isSelected = selectedModel.id === model.id
                return (
                  <TouchableOpacity
                    key={model.id}
                    style={[styles.autoRow, isSelected && styles.autoRowSelected]}
                    onPress={() => handleSelect(model)}
                    activeOpacity={0.8}
                  >
                    {Platform.OS !== 'web' && (
                      <BlurView intensity={20} tint="dark" style={[StyleSheet.absoluteFillObject, { borderRadius: 18 }]} />
                    )}
                    <View style={[styles.autoBadgeIcon, { borderColor: model.color + '60', backgroundColor: model.color + '20' }]}>
                      <Text style={[styles.autoIconText, { color: model.color }]}>{model.icon}</Text>
                    </View>
                    <View style={styles.autoText}>
                      <View style={styles.nameRow}>
                        <Text style={styles.autoName}>{model.name}</Text>
                        <View style={styles.smartBadge}>
                          <Text style={styles.smartBadgeText}>✦ ذكي</Text>
                        </View>
                      </View>
                      <Text style={styles.autoDesc}>{model.description}</Text>
                    </View>
                    {isSelected ? (
                      <View style={[styles.check, { borderColor: model.color, backgroundColor: model.color + '30' }]}>
                        <Text style={[styles.checkText, { color: model.color }]}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.checkEmpty} />
                    )}
                  </TouchableOpacity>
                )
              })}

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>أو اختر نموذجاً محدداً</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Other models */}
              {AVAILABLE_MODELS.filter((m) => m.id !== 'auto').map((model) => {
                const isSelected = selectedModel.id === model.id
                return (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.modelRow,
                      isSelected && {
                        borderColor: model.color + '55',
                        backgroundColor: model.color + '12',
                      },
                    ]}
                    onPress={() => handleSelect(model)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.modelIcon, { borderColor: model.color + '50', backgroundColor: model.color + '18' }]}>
                      <Text style={[styles.modelIconText, { color: model.color }]}>{model.icon}</Text>
                    </View>
                    <View style={styles.modelInfo}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.modelName, isSelected && { color: '#f1f5f9' }]}>
                          {model.name}
                        </Text>
                        <Text style={styles.providerTag}>{model.provider}</Text>
                      </View>
                      <Text style={styles.modelDesc}>{model.description}</Text>
                    </View>
                    <View style={[
                      styles.check,
                      isSelected
                        ? { borderColor: model.color, backgroundColor: model.color + '30' }
                        : styles.checkEmpty,
                    ]}>
                      {isSelected && <Text style={[styles.checkText, { color: model.color }]}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                )
              })}

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  // Chip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    height: 36,
  },
  chipIcon: { fontSize: 13, fontWeight: '700' },
  chipLabel: { fontSize: 13, fontWeight: '600' },
  chipCaret: { color: 'rgba(255,255,255,0.25)', fontSize: 11 },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    maxHeight: SCREEN_HEIGHT * 0.82,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'web' ? 'rgba(12,12,30,0.98)' : 'rgba(12,12,30,0.55)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sheetInner: { padding: 20, flex: 1 },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center', marginBottom: 18,
  },
  title: { color: '#f1f5f9', fontSize: 21, fontWeight: '800', textAlign: 'right', marginBottom: 4 },
  subtitle: { color: '#64748b', fontSize: 13, textAlign: 'right', marginBottom: 16 },
  subtitleHighlight: { fontWeight: '700' },

  // Auto row — special
  autoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 16,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(167,139,250,0.25)',
    backgroundColor: 'rgba(109,40,217,0.08)',
    overflow: 'hidden',
  },
  autoRowSelected: {
    borderColor: 'rgba(167,139,250,0.5)',
    backgroundColor: 'rgba(109,40,217,0.16)',
  },
  autoBadgeIcon: {
    width: 48, height: 48, borderRadius: 16,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  autoIconText: { fontSize: 20, fontWeight: '800' },
  autoText: { flex: 1 },
  autoName: { color: '#e2e8f0', fontSize: 16, fontWeight: '700', textAlign: 'right' },
  autoDesc: { color: '#64748b', fontSize: 12, textAlign: 'right', marginTop: 3 },
  smartBadge: {
    backgroundColor: 'rgba(167,139,250,0.2)',
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.35)',
  },
  smartBadgeText: { color: '#c4b5fd', fontSize: 10, fontWeight: '700' },

  // Divider
  divider: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginVertical: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  dividerText: { color: '#475569', fontSize: 12 },

  // Normal model row
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 13,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  modelIcon: {
    width: 42, height: 42, borderRadius: 13,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  modelIconText: { fontSize: 17, fontWeight: '800' },
  modelInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'flex-end', gap: 6,
  },
  modelName: { color: '#94a3b8', fontSize: 14, fontWeight: '600', textAlign: 'right' },
  providerTag: { color: '#334155', fontSize: 11 },
  modelDesc: { color: '#475569', fontSize: 12, textAlign: 'right', marginTop: 2 },

  // Check circle
  check: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  checkEmpty: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  checkText: { fontSize: 13, fontWeight: '800' },
})
