import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppButton } from '../components/ui.jsx';
import { identifyPixKeyType, verifyAccountTransferPixKey } from '../services/modules/finance.service';
import { colors, radius, shadow } from '../theme/tokens';

export default function TransferMoneyScreen({ navigation }) {
  const [pixKey, setPixKey] = useState('');
  const [checking, setChecking] = useState(false);

  const normalizedPixKey = useMemo(() => pixKey.trim(), [pixKey]);
  const canContinue = normalizedPixKey.length >= 3 && !checking;

  const handleVerifyPixKey = async () => {
    if (!normalizedPixKey) {
      Alert.alert('Chave Pix obrigatória', 'Digite a chave Pix de quem vai receber.');
      return;
    }

    setChecking(true);
    try {
      const response = await verifyAccountTransferPixKey(normalizedPixKey);
      navigation.navigate('TransferRecipient', {
        pixKey: normalizedPixKey,
        pixKeyType: identifyPixKeyType(normalizedPixKey),
        recipient: response,
      });
    } catch (err) {
      Alert.alert(
        'Não foi possível verificar',
        err?.response?.data?.message || err?.message || 'Confira a chave Pix e tente novamente.',
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppScreenHeader title="Transferir Pix" subtitle="Informe a chave de quem vai receber" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.progressRow}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
            <View style={styles.progressLine} />
            <View style={styles.progressDot} />
          </View>

          <View style={styles.hero}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="bank-transfer-out" size={30} color={colors.primary} />
            </View>
            <Text style={styles.title}>Para quem você quer enviar?</Text>
            <Text style={styles.subtitle}>Digite uma chave Pix para verificarmos o destinatário antes da transferência.</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Chave Pix</Text>
            <View style={styles.inputWrap}>
              <Feather name="key" size={18} color={colors.mutedForeground} />
              <TextInput
                value={pixKey}
                onChangeText={setPixKey}
                style={styles.input}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                placeholderTextColor="rgba(26,62,112,0.42)"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={canContinue ? handleVerifyPixKey : undefined}
              />
              {checking ? <ActivityIndicator color={colors.primary} size="small" /> : null}
            </View>

            <AppButton
              title={checking ? 'Verificando...' : 'Continuar'}
              onPress={handleVerifyPixKey}
              disabled={!canContinue}
              style={styles.continueButton}
              left={<Feather name="arrow-right" size={16} color="#FFF" />}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 26,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D8E4F2',
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressLine: {
    width: 42,
    height: 2,
    backgroundColor: '#D8E4F2',
    marginHorizontal: 6,
  },
  hero: {
    marginBottom: 28,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F2FD',
    marginBottom: 18,
  },
  title: {
    color: colors.cardForeground,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 15,
    lineHeight: 22,
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.sm,
  },
  label: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  inputWrap: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 52,
    color: colors.cardForeground,
    fontSize: 15,
  },
  continueButton: {
    marginTop: 16,
  },
});
