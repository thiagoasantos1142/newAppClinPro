import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';
import { createCommunityPost } from '../services/modules/community.service';

const categories = ['Dicas', 'Conquistas', 'Perguntas', 'Treinamentos', 'Motivacao'];

export default function CreatePostScreen({ navigation }) {
  const [category, setCategory] = useState('Dicas');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Atenção', 'Escreva o conteúdo da publicação.');
      return;
    }

    setSubmitting(true);
    try {
      await createCommunityPost({
        category,
        title: title.trim() || undefined,
        content: content.trim(),
      });
      Alert.alert('Sucesso', 'Publicação criada com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message || err?.message || 'Não foi possível publicar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={20} color="#FFFFFF" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Criar Publicação</Text>
            <Text style={styles.headerSubtitle}>Compartilhe uma dica com a comunidade</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppCard>
          <Text style={styles.label}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {categories.map((item) => (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.pill, category === item && styles.pillActive]}
              >
                <Text style={[styles.pillText, category === item && styles.pillTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.label, { marginTop: 14 }]}>Título (opcional)</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex.: Dica para organizar a agenda"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Conteúdo</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Escreva sua publicação..."
            placeholderTextColor="#94A3B8"
            style={[styles.input, styles.textarea]}
            multiline
            textAlignVertical="top"
          />
        </AppCard>

        <AppButton
          title={submitting ? 'Publicando...' : 'Publicar'}
          onPress={onSubmit}
          disabled={submitting}
          left={<Feather name="send" size={16} color="#FFF" />}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  label: { color: colors.cardForeground, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  pillRow: { gap: 8, paddingRight: 8 },
  pill: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.primary },
  pillText: { color: colors.cardForeground, fontSize: 12, fontWeight: '600' },
  pillTextActive: { color: '#FFF' },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    color: colors.cardForeground,
    fontSize: 14,
  },
  textarea: {
    minHeight: 140,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
