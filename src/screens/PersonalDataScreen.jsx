import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors } from '../theme/tokens';
import { getProfile, updateProfile } from '../services/modules/profile.service';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  region: '',
  bio: '',
};

export default function PersonalDataScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          const profile = await getProfile();
          if (!isActive) return;
          setForm({
            name: profile?.name || '',
            email: profile?.email || '',
            phone: profile?.phone || profile?.whatsapp || '',
            region: profile?.region || '',
            bio: profile?.bio || '',
          });
        } catch (err) {
          if (!isActive) return;
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar dados pessoais');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      void loadProfile();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const onChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        region: form.region.trim(),
        bio: form.bio.trim(),
      });
      Alert.alert('Sucesso', 'Dados pessoais atualizados.');
      navigation.goBack();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao salvar dados pessoais');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppScreenHeader title="Dados Pessoais" subtitle="Edite as informações do seu perfil" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? (
          <AppCard style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </AppCard>
        ) : null}

        <AppCard>
          <Field
            label="Nome completo"
            value={form.name}
            onChangeText={(value) => onChange('name', value)}
            editable={!loading && !saving}
          />
          <Field
            label="E-mail"
            value={form.email}
            onChangeText={(value) => onChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading && !saving}
          />
          <Field
            label="Telefone"
            value={form.phone}
            onChangeText={(value) => onChange('phone', value)}
            keyboardType="phone-pad"
            editable={!loading && !saving}
          />
          <Field
            label="Região"
            value={form.region}
            onChangeText={(value) => onChange('region', value)}
            editable={!loading && !saving}
          />
          <Field
            label="Bio"
            value={form.bio}
            onChangeText={(value) => onChange('bio', value)}
            multiline
            editable={!loading && !saving}
          />
        </AppCard>

        <AppButton
          title={saving ? 'Salvando...' : loading ? 'Carregando...' : 'Salvar Alterações'}
          disabled={loading || saving}
          left={<Feather name="save" size={16} color="#FFFFFF" />}
          onPress={() => void onSave()}
        />
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline = false,
  editable = true,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholder={label}
        placeholderTextColor="#94A3B8"
        style={[styles.input, multiline && styles.inputMultiline, !editable && styles.inputDisabled]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 4, marginLeft: 46, fontSize: 13 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  fieldWrap: { marginBottom: 12 },
  label: { color: colors.cardForeground, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.cardForeground,
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: '#F8FAFC',
    color: colors.mutedForeground,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  errorText: { color: '#B91C1C', fontSize: 13, fontWeight: '600' },
});
