import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { AppButton, AppCard } from '../../components/ui.jsx';
import { colors, radius, spacing, typography } from '../../theme/tokens.js';
import { useAuth } from '../../context/AuthContext';

export default function OtpVerificationScreen({ navigation, route }) {
  const { verifyOtp, isAuthenticated } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      setError(null);
      navigation.navigate('OnboardingWelcome');
    }
  }, [isAuthenticated]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    // Se o usuário colar/autofill no primeiro input, preenche todos os campos
    if (index === 0 && value.length === 6) {
      setOtp(value.split(''));
      setTimeout(() => {
        otpRefs.current['otp-5']?.focus();
      }, 50);
      return;
    }
    // Se o usuário colar/autofill em qualquer input, preenche todos os campos
    if (value.length === 6) {
      setOtp(value.split(''));
      setTimeout(() => {
        otpRefs.current['otp-5']?.focus();
      }, 50);
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = `otp-${index + 1}`;
      otpRefs.current[nextInput]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = `otp-${index - 1}`;
      otpRefs.current[prevInput]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length === 6) {
      try {
        setLoading(true);
        setError(null);
        await verifyOtp(route.params.phone, code);
      } catch (err) {
        setError(err?.message || 'Erro ao verificar o código');
      } finally {
        setLoading(false);
      }
    }
  };

  const otpRefs = useRef({});

  // Atalho para preencher código (simulação: supondo que o código está disponível em uma variável codeShortcut)
  const codeShortcut = route.params.code || ''; // Usa o código real se disponível
  const handleCodeShortcut = () => {
    if (codeShortcut.length === 6) {
      setOtp(codeShortcut.split(''));
      setTimeout(() => {
        otpRefs.current['otp-5']?.focus();
      }, 50);
    }
  };

  useEffect(() => {
    // Quando todos os dígitos estão preenchidos pelo shortcut, foca o último input
    if (otp.join('').length === 6 && otp.every((d) => d)) {
      otpRefs.current['otp-5']?.focus();
    }
  }, [otp]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.title}>Código enviado!</Text>
          <Text style={styles.subtitle}>Digite o código de 6 dígitos enviado para</Text>
          <Text style={styles.phoneNumber}>{route.params.phone}</Text>
          {/* Exemplo de atalho visual para o código, se disponível */}
          {!!codeShortcut && (
            <AppButton
              title={`Preencher código: ${codeShortcut}`}
              onPress={handleCodeShortcut}
              variant="secondary"
              style={{ marginTop: spacing.md }}
              textStyle={undefined}
              left={undefined}
            />
          )}
        </View>
        <AppCard style={styles.card}>
          <Text style={styles.label}>Código de Verificação</Text>
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => (otpRefs.current[`otp-${index}`] = el)}
                value={digit}
                onChangeText={(value) => {
                  if (index === 0 && value.length === 6) {
                    setOtp(value.split(''));
                    setTimeout(() => {
                      otpRefs.current['otp-5']?.focus();
                    }, 50);
                  } else {
                    handleOtpChange(index, value);
                  }
                }}
                onKeyPress={(e) => handleOtpKeyDown(index, e)}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpInput}
                returnKeyType="done"
              />
            ))}
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <AppButton
            title={loading ? 'Entrando...' : 'Entrar'}
            onPress={handleSubmit}
            disabled={loading || otp.some((d) => !d)}
            style={{ marginTop: spacing.md }}
            textStyle={undefined}
            left={undefined}
          />
          <AppButton
            title="Voltar para digitar telefone"
            onPress={() => navigation.navigate('PhoneLogin')}
            variant="secondary"
            style={{ marginTop: spacing.md }}
            textStyle={undefined}
            left={undefined}
          />
        </AppCard>
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
  phoneNumber: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  card: {
    width: 340,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.foreground,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  otpInput: {
    width: 40,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    textAlign: 'center',
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.foreground,
    marginHorizontal: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
