// Drawer menu item component
function Item({ label, icon, active, danger, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        active && styles.itemActive,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.itemIcon}>{icon}</View>
      <Text
        style={[
          styles.itemLabel,
          active ? styles.itemLabelActive : styles.itemLabelDefault,
          danger && styles.itemLabelDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/tokens';
import { getProfile } from '../../services/modules/profile.service';

function getActiveKeyFromNestedState(state) {
  const drawerRoute = state?.routes?.[state.index ?? 0];
  const stackState = drawerRoute?.state;
  const stackRoute = stackState?.routes?.[stackState?.index ?? 0];
  const currentStackScreen = stackRoute?.name ?? 'MainTabs';
}

export default function AppDrawerContent(props) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const activeKey = getActiveKeyFromNestedState(props.state);
  const [middleViewportHeight, setMiddleViewportHeight] = useState(0);
  const [middleContentHeight, setMiddleContentHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [professionalName, setProfessionalName] = useState('Perfil');

  useEffect(() => {
    let isActive = true;

    const loadProfileName = async () => {
      try {
        const profile = await getProfile();
        if (!isActive) return;
        setProfessionalName(profile?.name || 'Perfil');
      } catch {
        if (!isActive) return;
        setProfessionalName('Perfil');
      }
    };

    void loadProfileName();

    return () => {
      isActive = false;
    };
  }, []);

  const mainMenuItems = useMemo(
    () => [
      { key: 'home', label: 'Home', type: 'tab', target: 'HomeTab', icon: <Feather name="home" size={18} color="#FFFFFF" /> },
      { key: 'services', label: 'Serviços', type: 'tab', target: 'ServicesTab', icon: <Feather name="briefcase" size={18} color="#FFFFFF" /> },
      { key: 'training', label: 'Treinamentos', type: 'tab', target: 'TrainingTab', icon: <MaterialCommunityIcons name="school-outline" size={18} color="#FFFFFF" /> },
      { key: 'schedule', label: 'Agenda', type: 'screen', target: 'WeeklySchedule', icon: <Feather name="calendar" size={18} color="#FFFFFF" /> },
      { key: 'community', label: 'Comunidade', type: 'tab', target: 'CommunityTab', icon: <Feather name="users" size={18} color="#FFFFFF" /> },
      { key: 'profile', label: 'Perfil', type: 'tab', target: 'ProfileTab', icon: <Feather name="user" size={18} color="#FFFFFF" /> },
    ],
    []
  );

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  const moduleItems = useMemo(
    () => [
      { key: 'financial', label: 'Financeiro', type: 'screen', target: 'FinancialDashboard', icon: <Feather name="dollar-sign" size={18} color="#FFFFFF" /> },
      { key: 'bank', label: 'Banco Digital', type: 'screen', target: 'DigitalAccountOverview', icon: <Feather name="credit-card" size={18} color="#FFFFFF" /> },
      { key: 'reputation', label: 'Reputação', type: 'screen', target: 'ReputationOverview', icon: <Feather name="star" size={18} color="#FFFFFF" /> },
      { key: 'video-av-test', label: 'Teste Video AV', type: 'screen', target: 'VideoAvTest', icon: <Feather name="play-circle" size={18} color="#FFFFFF" /> },
    ],
    []
  );

  const settingsItems = useMemo(
    () => [
      { key: 'settings', label: 'Configurações', type: 'tab', target: 'ProfileTab', icon: <Feather name="settings" size={18} color={colors.cardForeground} /> },
      { key: 'help', label: 'Ajuda', type: 'tab', target: 'ProfileTab', icon: <Feather name="help-circle" size={18} color={colors.cardForeground} /> },
      { key: 'logout', label: 'Sair', type: 'tab', target: 'HomeTab', icon: <Feather name="log-out" size={18} color={colors.danger} />, danger: true },
    ],
    []
  );

  const navigateItem = async (item) => {
    if (item.key === 'logout') {
      await logout();
      props.navigation.closeDrawer();
      return;
    }
    if (item.type === 'tab') {
      props.navigation.navigate('RootStack', { screen: 'MainTabs', params: { screen: item.target } });
    } else {
      props.navigation.navigate('RootStack', { screen: item.target });
    }
    props.navigation.closeDrawer();
  };

  const maxScroll = Math.max(middleContentHeight - middleViewportHeight, 1);
  const thumbMin = 28;
  const thumbHeight =
    middleContentHeight > middleViewportHeight
      ? Math.max((middleViewportHeight * middleViewportHeight) / Math.max(middleContentHeight, 1), thumbMin)
      : 0;
  const trackRange = Math.max(middleViewportHeight - thumbHeight, 0);
  const thumbTop = middleContentHeight > middleViewportHeight ? (scrollY / maxScroll) * trackRange : 0;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <View style={styles.avatar}><Feather name="user" size={28} color="#FFFFFF" /></View>
          <Pressable onPress={() => props.navigation.closeDrawer()} style={styles.closeBtn}>
            <Feather name="x" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text style={styles.name}>{professionalName}</Text>
        <View style={styles.badgeRow}>
          <Feather name="award" size={12} color="#FFFFFF" />
          <Text style={styles.badgeText}>Profissional Certificada</Text>
        </View>
      </View>

      <View
        style={styles.middleWrap}
        onLayout={(e) => setMiddleViewportHeight(e.nativeEvent.layout.height)}
      >
        <ScrollView
          style={styles.middleScroll}
          contentContainerStyle={styles.middleContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={(_, h) => setMiddleContentHeight(h)}
          onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
        >
          <Text style={styles.sectionTitle}>MENU PRINCIPAL</Text>
          {mainMenuItems.map((item) => (
            <Item key={item.key} label={item.label} icon={item.icon} active={activeKey === item.key} onPress={() => navigateItem(item)} />
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>MÓDULOS</Text>
          {moduleItems.map((item) => (
            <Item key={item.key} label={item.label} icon={item.icon} active={activeKey === item.key} onPress={() => navigateItem(item)} />
          ))}
        </ScrollView>

        {middleContentHeight > middleViewportHeight ? (
          <View style={styles.scrollTrack}>
            <View style={[styles.scrollThumb, { height: thumbHeight, transform: [{ translateY: thumbTop }] }]} />
          </View>
        ) : null}
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.separator} />
        {settingsItems.map((item) => (
          <Item key={item.key} label={item.label} icon={item.icon} danger={item.danger} onPress={() => navigateItem(item)} />
        ))}

        <Text style={styles.version}>Clin Pro v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', backgroundColor: '#FFFFFF' },
  header: { width: '100%', alignSelf: 'stretch', backgroundColor: colors.primary, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { marginTop: 12, color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  badgeRow: { marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', gap: 6, borderRadius: 999, paddingHorizontal: 0, paddingVertical: 0 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  middleScroll: { flex: 1 },
  middleWrap: { flex: 1, position: 'relative' },
  middleContent: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 16 },
  footer: { paddingHorizontal: 12, paddingTop: 8, backgroundColor: '#FFFFFF' },
  scrollTrack: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    right: 2,
    width: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(31,128,234,0.12)',
  },
  scrollThumb: {
    width: 4,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  sectionTitle: { paddingHorizontal: 8, marginBottom: 8, color: colors.mutedForeground, fontSize: 11, fontWeight: '700' },
  item: { minHeight: 46, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  itemActive: { backgroundColor: colors.primary },
  itemIcon: { width: 20, alignItems: 'center' },
  itemLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  itemLabelDefault: { color: colors.cardForeground },
  itemLabelActive: { color: '#FFFFFF' },
  itemLabelDanger: { color: colors.danger },
  separator: { marginTop: 12, marginBottom: 8, height: 1, backgroundColor: colors.border },
  version: { marginTop: 16, textAlign: 'center', fontSize: 11, color: colors.mutedForeground },
  pressed: { opacity: 0.9 },
});
