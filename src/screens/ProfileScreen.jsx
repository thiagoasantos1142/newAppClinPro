import React, { useCallback, useMemo, useState } from "react";
import { DrawerActions, useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AppScreenHeader from "../components/AppScreenHeader.jsx";
import HeaderActionButton from "../components/HeaderActionButton.jsx";
import { AppButton, AppCard, ProgressBar } from "../components/ui.jsx";
import { colors, radius } from "../theme/tokens";
import { getProfile } from "../services/modules/profile.service";
import { useAuth } from "../hooks/useAuth";

const fallbackCertificates = [
  { id: "c1", name: "Fundamentos de Limpeza", date: "Fev 2024", icon: "award" },
  { id: "c2", name: "Segurança e EPI", date: "Jan 2024", icon: "shield" },
  { id: "c3", name: "Produtos de Limpeza", date: "Dez 2023", icon: "package" },
  {
    id: "c4",
    name: "Atendimento ao Cliente",
    date: "Nov 2023",
    icon: "briefcase",
  },
];

const fallbackMetrics = [
  {
    label: "Serviços realizados",
    key: "completed",
    icon: "briefcase",
    bg: "#EFF6FF",
    color: "#2563EB",
  },
  {
    label: "Avaliação média",
    key: "rating",
    icon: "star",
    bg: "#FEF9C3",
    color: "#CA8A04",
  },
  {
    label: "Clientes recorrentes",
    key: "clients",
    icon: "users",
    bg: "#ECFDF3",
    color: "#16A34A",
  },
  {
    label: "Tempo médio",
    key: "time",
    icon: "clock",
    bg: "#F3E8FF",
    color: "#9333EA",
  },
];

const formatPhoneBR = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "-";

  const normalized =
    digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;

  if (normalized.length === 11) {
    return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 7)}-${normalized.slice(7)}`;
  }
  if (normalized.length === 10) {
    return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 6)}-${normalized.slice(6)}`;
  }
  return value;
};

export default function ProfileScreen({ navigation }) {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        setLoading(true);
        setError(null);
        setProfile(null);
        try {
          const data = await getProfile();
          if (isActive) setProfile(data);
        } catch (err) {
          if (!isActive) return;
          let msg = "Erro ao carregar perfil";
          if (
            err?.response?.data?.error ===
            "Usuário não é um profissional ClinPro"
          ) {
            msg =
              "Acesso restrito: apenas profissionais ClinPro podem acessar esta área.";
          }
          if (err?.response?.data?.status === false) {
            msg =
              err?.response?.data?.message || "Seu acesso a Clin Pro expirou.";
          }
          setError(msg);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadProfile();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const view = useMemo(() => {
    const certificates = profile?.badges?.length
      ? profile.badges.map((badge, index) => ({
          id: badge.code || `badge-${index}`,
          name: badge.name,
          date: badge.awarded_at ? badge.awarded_at.slice(0, 7) : "Verificado",
          icon: "award",
        }))
      : fallbackCertificates;

    return {
      name: profile?.name || "Maria Silva",
      subtitle: profile?.bio || "Profissional de Limpeza",
      region: profile?.region || "Zona Sul, São Paulo",
      rating: profile?.average_rating?.toFixed(1) || "4.9",
      reviewsLabel: `${profile?.reviews_count ?? 127} avaliações`,
      completedServices: String(profile?.completed_services ?? 342),
      levelName: "Nível 2 - Profissional",
      progressPercent: 68,
      certificates,
      about:
        profile?.bio ||
        "Profissional de limpeza com experiência em atendimento residencial e comercial, com foco em qualidade, pontualidade e satisfação do cliente.",
      memberSince: profile?.created_at
        ? `Membro desde ${new Date(profile.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`
        : "Membro desde Janeiro de 2023",
      metrics: [
        {
          ...fallbackMetrics[0],
          value: String(profile?.completed_services ?? 342),
        },
        {
          ...fallbackMetrics[1],
          value: profile?.average_rating?.toFixed(1) || "4.9",
        },
        {
          ...fallbackMetrics[2],
          value: String(profile?.recurring_clients_count ?? 89),
        },
        {
          ...fallbackMetrics[3],
          value: profile?.average_service_duration_label || "2.5h",
        },
      ],
      phone: formatPhoneBR(profile?.phone),
      email: profile?.email || "-",
    };
  }, [profile]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerState]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerState]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppScreenHeader
        title="Meu Perfil"
        subtitle="Acompanhe sua jornada profissional"
        showBack={false}
        leftContent={<HeaderActionButton onPress={() => navigation.dispatch(DrawerActions.openDrawer())} icon="menu" />}
        rightContent={
          <HeaderActionButton onPress={() => navigation.navigate("PersonalData")} icon="edit-2" />
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={styles.summaryCard}>
          <View style={styles.center}>
            <View style={styles.avatar}>
              <Feather name="user" size={60} color={colors.primary} />
            </View>
            <Text style={styles.name}>{view.name}</Text>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedText}>Profissional Certificada</Text>
            </View>
            <Text style={styles.region}>{view.region}</Text>

            <View style={styles.statsRow}>
              <View style={styles.center}>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={20} color="#EAB308" />
                  <Text style={styles.statsValue}>{view.rating}</Text>
                </View>
                <Text style={styles.statsLabel}>{view.reviewsLabel}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.center}>
                <Text style={styles.statsValue}>{view.completedServices}</Text>
                <Text style={styles.statsLabel}>Serviços concluídos</Text>
              </View>
            </View>
          </View>
        </AppCard>

        <AppCard style={styles.levelCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionTitle}>Nível Profissional</Text>
              <Text style={styles.levelValue}>{view.levelName}</Text>
            </View>
            <View style={styles.levelIcon}>
              <Feather name="trending-up" size={18} color={colors.primary} />
            </View>
          </View>

          <View style={styles.progressBlock}>
            <View style={styles.rowBetween}>
              <Text style={styles.progressLabel}>Progresso para Nível 3</Text>
              <Text style={styles.progressPercent}>
                {view.progressPercent}%
              </Text>
            </View>
            <ProgressBar
              value={view.progressPercent}
              style={styles.progressBar}
            />
          </View>

          <Text style={styles.progressHint}>
            Complete mais serviços e treinamentos para evoluir e desbloquear
            benefícios exclusivos
          </Text>
        </AppCard>

        <View style={styles.sectionWrap}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Certificados</Text>
            <Pressable style={styles.linkRow}>
              <Text style={styles.link}>Ver todos</Text>
              <Feather name="chevron-right" size={14} color={colors.primary} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.certsRow}
          >
            {view.certificates.map((cert) => (
              <AppCard key={cert.id} style={styles.certCard}>
                <View style={styles.certIcon}>
                  <Feather name={cert.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.certName}>{cert.name}</Text>
                <Text style={styles.certDate}>{cert.date}</Text>
              </AppCard>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.metricsGrid}>
            {view.metrics.map((metric) => (
              <AppCard key={metric.label} style={styles.metricCard}>
                <View
                  style={[styles.metricIcon, { backgroundColor: metric.bg }]}
                >
                  <Feather name={metric.icon} size={16} color={metric.color} />
                </View>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </AppCard>
            ))}
          </View>
        </View>

        <AppCard>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            <Pressable onPress={() => navigation.navigate("PersonalData")}>
              <Text style={styles.link}>Editar</Text>
            </Pressable>
          </View>
          <Text style={styles.aboutText}>{view.about}</Text>
        </AppCard>

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Financeiro</Text>
          <Pressable
            style={({ pressed }) => [
              styles.financeCard,
              pressed && styles.financeCardPressed,
            ]}
            onPress={() => navigation.navigate("DigitalAccountOverview")}
          >
            <View style={styles.financeContent}>
              <View style={styles.financeIconWrap}>
                <Feather name="credit-card" size={26} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.financeTitle}>Conta Digital</Text>
                <Text style={styles.financeSubtitle}>
                  Gerencie seu dinheiro
                </Text>
              </View>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color="rgba(255,255,255,0.82)"
            />
          </Pressable>
        </View>

        <AppButton
          title="Editar Perfil"
          left={<Feather name="edit-3" size={16} color="#FFF" />}
          onPress={() => navigation.navigate("PersonalData")}
        />
        <AppButton
          title="Configurações"
          variant="secondary"
          left={
            <Feather name="settings" size={16} color={colors.cardForeground} />
          }
          onPress={() => {}}
        />
        <AppButton
          title="Sair da Conta"
          variant="ghost"
          textStyle={{ color: colors.danger }}
          style={{ borderColor: "#FECACA", backgroundColor: "#FFFFFF" }}
          left={<Feather name="log-out" size={16} color={colors.danger} />}
          onPress={() => void logout()}
        />
        <Text style={styles.memberSince}>{view.memberSince}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerState: { justifyContent: "center", alignItems: "center" },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  content: { padding: 16, paddingBottom: 28, gap: 12 },
  center: { alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 26,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: "rgba(31,128,234,0.18)",
    backgroundColor: "rgba(31,128,234,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: {
    color: colors.cardForeground,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
  },
  verifiedPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(31,128,234,0.24)",
    backgroundColor: "rgba(31,128,234,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
  },
  verifiedText: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  region: { color: colors.mutedForeground, fontSize: 13, marginBottom: 18 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    width: "100%",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  statsValue: { color: colors.cardForeground, fontSize: 32, fontWeight: "800" },
  statsLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    textAlign: "center",
  },
  divider: { width: 1, height: 56, backgroundColor: colors.border },
  levelCard: { borderWidth: 1, borderColor: colors.border },
  sectionWrap: { marginBottom: 4 },
  sectionTitle: {
    color: colors.cardForeground,
    fontSize: 16,
    fontWeight: "700",
  },
  levelValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  levelIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(31,128,234,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBlock: { marginTop: 14 },
  progressLabel: { color: colors.mutedForeground, fontSize: 12 },
  progressPercent: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  progressBar: { marginTop: 8 },
  progressHint: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  link: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  certsRow: { gap: 10, paddingTop: 12, paddingBottom: 6, paddingRight: 6 },
  certCard: { width: 176, borderWidth: 1, borderColor: colors.border },
  certIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(31,128,234,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  certName: {
    color: colors.cardForeground,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  certDate: { color: colors.mutedForeground, fontSize: 12 },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
  },
  metricCard: { width: "48%", borderWidth: 1, borderColor: colors.border },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricValue: {
    color: colors.cardForeground,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 2,
  },
  metricLabel: { color: colors.mutedForeground, fontSize: 11, lineHeight: 15 },
  aboutText: {
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  financeCard: {
    marginTop: 12,
    borderRadius: radius.lg || 20,
    backgroundColor: colors.primary,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  financeCardPressed: { opacity: 0.94 },
  financeContent: { flexDirection: "row", alignItems: "center", gap: 14 },
  financeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  financeTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  financeSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 4,
  },
  memberSince: {
    textAlign: "center",
    color: colors.mutedForeground,
    fontSize: 12,
    paddingVertical: 10,
  }
});
