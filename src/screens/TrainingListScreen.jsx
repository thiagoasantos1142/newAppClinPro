import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RequireClinPro } from '../components/RequireClinPro.jsx';
import { AppCard, Badge, ProgressBar } from '../components/ui.jsx';
import { recommendedLessons, trails } from '../data/mockData';
import { colors } from '../theme/tokens';

export default function TrainingListScreen({ navigation }) {
  return (
    <RequireClinPro>
      <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleRow}>
            <View style={styles.menuSlot} />
            <Text style={styles.headerTitle}>Treinamentos</Text>
          </View>
          <View style={styles.headerIconBox}>
            <MaterialCommunityIcons name="school-outline" size={22} color="#FFF" />
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Aprenda e desenvolva suas habilidades</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppCard>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.muted}>Sua Jornada</Text>
              <Text style={styles.journeyValue}>15/29 aulas</Text>
            </View>
            <View style={styles.journeyBadge}><Text style={styles.journeyBadgeText}>52%</Text></View>
          </View>
          <ProgressBar value={52} style={{ marginTop: 12 }} />
        </AppCard>

        <View>
          <Text style={styles.sectionTitle}>Trilhas de Aprendizado</Text>
          <View style={styles.listGap}>
            {trails.map((trail) => (
              <AppCard key={trail.id}>
                <View style={styles.rowTop}>
                  <View style={[styles.trailIcon, { backgroundColor: trail.color }]}>
                    <MaterialCommunityIcons name="school" size={20} color="#FFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trailTitle}>{trail.title}</Text>
                    <Text style={styles.muted}>{trail.description}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.muted}>{trail.lessonsCount} aulas</Text>
                  <Text style={styles.muted}>{trail.duration}</Text>
                </View>

                <View style={styles.rowBetween}>
                  <Text style={styles.muted}>{trail.completed}/{trail.lessonsCount} concluídas</Text>
                  <Text style={styles.percent}>{trail.progress}%</Text>
                </View>
                <ProgressBar value={trail.progress} color={trail.color} style={{ marginTop: 6 }} />

                {trail.progress === 100 && <Badge text="Certificado disponível" tone="success" />}

                <View style={{ marginTop: 12 }}>
                  <Text onPress={() => navigation.navigate('TrailDetail', { trailId: trail.id })} style={styles.linkButton}>
                    Abrir trilha
                  </Text>
                </View>
              </AppCard>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Recomendados para Você</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalList}
          >
            {recommendedLessons.map((item) => (
              <AppCard key={item.id} style={styles.recCard}>
                <View style={styles.emojiArea}><Text style={styles.emoji}>{item.emoji}</Text></View>
                <Text style={styles.recTitle}>{item.title}</Text>
                <Text style={styles.muted}>{item.duration}</Text>
              </AppCard>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      </View>
    </RequireClinPro>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  menuSlot: { width: 46 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontSize: 13, marginLeft: 46 },
  headerIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 16, paddingBottom: 28 },
  muted: { color: colors.mutedForeground, fontSize: 12 },
  journeyValue: { color: colors.primary, fontSize: 28, fontWeight: '800', marginTop: 4 },
  journeyBadge: { width: 60, height: 60, borderRadius: 999, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  journeyBadgeText: { color: colors.primary, fontWeight: '800', fontSize: 18 },
  sectionTitle: { color: colors.cardForeground, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  listGap: { gap: 10 },
  trailIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trailTitle: { color: colors.cardForeground, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  infoRow: { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 8 },
  percent: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  linkButton: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  horizontalList: { gap: 10, paddingRight: 6, paddingBottom: 6 },
  horizontalScroll: { overflow: 'visible' },
  recCard: { width: 150, marginVertical: 4 },
  emojiArea: { height: 90, borderRadius: 12, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emoji: { fontSize: 44 },
  recTitle: { color: colors.cardForeground, fontSize: 14, fontWeight: '700', marginBottom: 4 },
});

