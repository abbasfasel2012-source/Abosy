import { Platform, View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
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

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#07071a', '#0e0b2e', '#07071a']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      {/* Header */}
      <View style={styles.header}>
        {Platform.OS !== 'web' && (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFillObject} />
        )}
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Model Section */}
          <View style={styles.section}>
            {Platform.OS !== 'web' && (
              <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFillObject} />
            )}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🤖</Text>
              <View>
                <Text style={styles.sectionTitle}>النموذج الافتراضي</Text>
                <Text style={styles.sectionSub}>اختر نموذج الذكاء الاصطناعي</Text>
              </View>
            </View>

            {AVAILABLE_MODELS.map((model) => {
              const isSelected = selectedModel.id === model.id
              return (
                <TouchableOpacity
                  key={model.id}
                  style={[styles.optionRow, isSelected && { borderColor: model.color + '50', backgroundColor: model.color + '12' }]}
                  onPress={() => setSelectedModel(model)}
                >
                  <View style={[styles.modelBadge, { borderColor: model.color + '50', backgroundColor: model.color + '18' }]}>
                    <Text style={[styles.modelBadgeText, { color: model.color }]}>{model.icon}</Text>
                  </View>
                  <View style={styles.optionInfo}>
                    <View style={styles.optionNameRow}>
                      <Text style={styles.optionName}>{model.name}</Text>
                      {model.id === 'auto' && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>ذكي</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.optionDesc}>{model.provider} · {model.description}</Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkCircle, { borderColor: model.color, backgroundColor: model.color + '25' }]}>
                      <Text style={[styles.checkIcon, { color: model.color }]}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Religious Section */}
          <View style={styles.section}>
            {Platform.OS !== 'web' && (
              <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFillObject} />
            )}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🕌</Text>
              <View>
                <Text style={styles.sectionTitle}>المرجعية الدينية</Text>
                <Text style={styles.sectionSub}>للإجابة على الأسئلة الدينية</Text>
              </View>
            </View>

            {RELIGIOUS_REFERENCES.map((ref) => {
              const isSelected = religiousReferenceId === ref.id
              return (
                <TouchableOpacity
                  key={ref.id}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setReligiousReferenceId(ref.id)}
                >
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionName}>{ref.name}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>

          {/* About & danger */}
          <View style={styles.section}>
            {Platform.OS !== 'web' && (
              <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFillObject} />
            )}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>ℹ️</Text>
              <Text style={styles.sectionTitle}>حول التطبيق</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الإصدار</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>المطور</Text>
              <Text style={styles.infoValue}>عبوسي AI</Text>
            </View>

            <TouchableOpacity
              style={styles.dangerBtn}
              onPress={() => {
                setMessages([])
                setActiveConversation(null)
                setError(null)
                router.back()
              }}
            >
              <Text style={styles.dangerBtnText}>🗑 مسح المحادثة الحالية</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07071a' },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 280, height: 280, backgroundColor: '#6d28d9', opacity: 0.15, top: -60, right: -60 },
  orb2: { width: 220, height: 220, backgroundColor: '#1e40af', opacity: 0.12, bottom: 80, left: -50 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    backgroundColor: Platform.OS === 'web' ? 'rgba(7,7,26,0.9)' : 'transparent',
    overflow: 'hidden',
  },
  headerTitle: { color: '#f1f5f9', fontSize: 22, fontWeight: '800' },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#94a3b8', fontSize: 14 },

  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },

  section: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.05)' : 'transparent',
    padding: 16,
    gap: 10,
    marginBottom: 16,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  sectionIcon: { fontSize: 22 },
  sectionTitle: { color: '#f1f5f9', fontSize: 17, fontWeight: '700' },
  sectionSub: { color: '#475569', fontSize: 12, marginTop: 2 },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  optionRowSelected: {
    borderColor: 'rgba(167,139,250,0.35)',
    backgroundColor: 'rgba(139,92,246,0.1)',
  },
  modelBadge: {
    width: 42, height: 42, borderRadius: 13,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  modelBadgeText: { fontSize: 17, fontWeight: '800' },
  optionInfo: { flex: 1 },
  optionNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  optionName: { color: '#e2e8f0', fontSize: 14, fontWeight: '600', textAlign: 'right' },
  optionDesc: { color: '#64748b', fontSize: 12, textAlign: 'right', marginTop: 2 },
  badge: {
    backgroundColor: 'rgba(167,139,250,0.2)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)',
  },
  badgeText: { color: '#c4b5fd', fontSize: 10, fontWeight: '600' },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.5)',
    backgroundColor: 'rgba(139,92,246,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkIcon: { color: '#a78bfa', fontSize: 12, fontWeight: '700' },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: { color: '#475569', fontSize: 14 },
  infoValue: { color: '#94a3b8', fontSize: 14 },

  dangerBtn: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    alignItems: 'center',
  },
  dangerBtnText: { color: '#f87171', fontSize: 15, fontWeight: '600' },
})
