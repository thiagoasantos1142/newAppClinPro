import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton } from './ui.jsx';
import { colors, radius } from '../theme/tokens';

export default function OTAUpdateManager() {
  const [visible, setVisible] = useState(false);

  const mockedUpdate = useMemo(
    () => ({
      title: 'Nova atualização disponível',
      version: 'v1.2.0',
      publishedAt: '04/03/2026 15:20',
      changes: [
        'Melhorias no fluxo de certificados.',
        'Correções na estabilidade da navegação.',
        'Ajustes visuais em telas de treinamento.',
      ],
    }),
    []
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Feather name="bell" size={18} color="#FFFFFF" />
            </View>
            <Pressable onPress={() => setVisible(false)} hitSlop={10}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={styles.title}>{mockedUpdate.title}</Text>
          <Text style={styles.meta}>
            {mockedUpdate.version} • {mockedUpdate.publishedAt}
          </Text>

          <View style={styles.list}>
            {mockedUpdate.changes.map((item, index) => (
              <Text key={`${index}-${item}`} style={styles.listItem}>
                • {item}
              </Text>
            ))}
          </View>

          <AppButton
            title="Entendi"
            onPress={() => setVisible(false)}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 12,
    color: colors.cardForeground,
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    marginTop: 4,
    color: colors.mutedForeground,
    fontSize: 12,
  },
  list: {
    marginTop: 12,
    gap: 8,
  },
  listItem: {
    color: colors.cardForeground,
    fontSize: 14,
    lineHeight: 20,
  },
});
