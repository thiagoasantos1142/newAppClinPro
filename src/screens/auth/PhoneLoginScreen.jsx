import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AppButton, AppCard } from '../../components/ui.jsx';
import { colors, radius, spacing, typography } from '../../theme/tokens.js';
import { useAuth } from '../../context/AuthContext';

export default function PhoneLoginScreen({ navigation }) {
  const { requestOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (value) => {
    setPhone(formatPhoneNumber(value));
  };

  const handlePhoneSubmit = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return;
    try {
      setLoading(true);
      setError(null);
      const phoneToSend = cleanPhone;
      console.log('[DEBUG] requestOtp payload:', phoneToSend);
      await requestOtp(phoneToSend);
      navigation.navigate('OtpVerification', { phone: phoneToSend });
    } catch (err) {
      if (err.response) {
        console.log('[DEBUG] requestOtp error response:', {
          status: err.response.status,
          data: err.response.data,
        });
        setError(
          err.response.data?.detail ||
          err.response.data?.message ||
          err.message || 'Erro ao solicitar o código'
        );
      } else {
        console.log('[DEBUG] requestOtp error:', err);
        setError(err?.message || 'Erro ao solicitar o código');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 4) {
      const nextInput = `otp-${index + 1}`;
      otpRefs[nextInput]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = `otp-${index - 1}`;
      otpRefs[prevInput]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 5) {
      navigation.navigate('OtpVerification', { phone: phone.trim() });
    }
  };

  const handleResendCode = () => {
    setOtp(['', '', '', '', '']);
    Alert.alert('Novo código enviado para seu WhatsApp!');
  };

  // Refs for OTP inputs
  const otpRefs = {};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <View style={styles.logoBox}>
            {/* Ícone de logo pode ser adicionado aqui */}
          </View>
          <Text style={styles.title}>Clin Pro</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
        </View>
        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Entre com WhatsApp</Text>
          <Text style={styles.cardSubtitle}>Rápido e seguro</Text>
          <View style={{ marginVertical: spacing.md }}>
            <Text style={styles.label}>Número do WhatsApp</Text>
            <TextInput
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="(11) 91234-5678"
              maxLength={16}
              keyboardType="phone-pad"
              style={styles.input}
              autoComplete="tel"
              returnKeyType="done"
            />
            <Text style={styles.helperText}>Enviaremos um código de 6 dígitos</Text>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <AppButton
            title={loading ? 'Enviando...' : 'Continuar'}
            onPress={handlePhoneSubmit}
            disabled={loading || phone.replace(/\D/g, '').length < 10}
            style={{ marginTop: spacing.md }}
            textStyle={undefined}
            left={undefined}
          />
          <View style={styles.securityBox}>
            <Text style={styles.securityText}>
              Seus dados estão protegidos. Usamos WhatsApp apenas para verificação de segurança.
            </Text>
          </View>
        </AppCard>
        <Text style={styles.footerText}>
          Ao continuar, você concorda com nossos{' '}
          <Text style={styles.link}>Termos de Uso</Text> e{' '}
          <Text style={styles.link}>Política de Privacidade</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
  },
  card: {
    width: 340,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.lg,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  securityBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  securityText: {
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    textAlign: 'center',
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.foreground,
    marginHorizontal: 4,
  },
  phoneNumber: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  changeNumber: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    textDecorationLine: 'underline',
  },
  resendBox: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  resendButton: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  footerText: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.mutedForeground,
    marginTop: spacing.xl,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
