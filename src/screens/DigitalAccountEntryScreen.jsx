import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import DigitalAccountOverviewScreen from './DigitalAccountOverviewScreen.jsx';
import { AppButton } from '../components/ui.jsx';
import { getAccountStatus, savePagClinPassword, validatePagClinPassword } from '../services/modules/finance.service';
import { clearDigitalAccountAccess, grantDigitalAccountAccess } from '../store/digitalAccountSlice';
import { colors, spacing, typography } from '../theme/tokens';

const PIN_LENGTH = 6;
const ACCESS_TTL_MS = 10 * 60 * 1000;

export default function DigitalAccountEntryScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const accessUnlockedAt = useSelector((state) => state.digitalAccount?.accessUnlockedAt);
  const [pin, setPin] = useState(Array(PIN_LENGTH).fill(''));
  const [confirmPin, setConfirmPin] = useState(Array(PIN_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(Boolean(route?.params?.skipPin));
  const [checkingAccess, setCheckingAccess] = useState(!route?.params?.skipPin);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState('enter');
  const inputRefs = useRef({});
  const confirmInputRefs = useRef({});

  const isComplete = useMemo(() => pin.every((digit) => digit), [pin]);
  const isConfirmComplete = useMemo(() => confirmPin.every((digit) => digit), [confirmPin]);
  const hasRecentAccess = Boolean(accessUnlockedAt && Date.now() - accessUnlockedAt < ACCESS_TTL_MS);

  useEffect(() => {
    if (hasRecentAccess) {
      setUnlocked(true);
      return;
    }

    if (route?.params?.skipPin) {
      return;
    }

    let isActive = true;

    const resolveAccessMode = async () => {
      try {
        const status = await getAccountStatus().catch(() => null);

        if (!isActive) return;

        setMode(status?.password === true ? 'enter' : 'create');
      } catch {
        if (!isActive) return;
        setMode('create');
      } finally {
        if (isActive) {
          setCheckingAccess(false);
        }
      }
    };

    void resolveAccessMode();

    return () => {
      isActive = false;
    };
  }, [hasRecentAccess, route?.params?.skipPin]);

  useEffect(() => {
    if (!accessUnlockedAt) {
      return;
    }

    const elapsed = Date.now() - accessUnlockedAt;
    const remaining = ACCESS_TTL_MS - elapsed;

    if (remaining <= 0) {
      dispatch(clearDigitalAccountAccess());
      return;
    }

    const timeoutId = setTimeout(() => {
      dispatch(clearDigitalAccountAccess());
    }, remaining);

    return () => clearTimeout(timeoutId);
  }, [accessUnlockedAt, dispatch]);

  const focusInput = (refMap, index) => {
    refMap.current[`pin-${index}`]?.focus();
  };

  const handleChange = (index, value, currentPin, setter, refMap) => {
    if (!/^\d*$/.test(value)) return;

    if (value.length === PIN_LENGTH) {
      const digits = value.slice(0, PIN_LENGTH).split('');
      setter(digits);
      setError('');
      focusInput(refMap, PIN_LENGTH - 1);
      return;
    }

    const nextPin = [...currentPin];
    nextPin[index] = value.slice(-1);
    setter(nextPin);
    setError('');

    if (value && index < PIN_LENGTH - 1) {
      focusInput(refMap, index + 1);
    }
  };

  const handleKeyPress = (index, e, currentPin, refMap) => {
    if (e.nativeEvent.key === 'Backspace' && !currentPin[index] && index > 0) {
      focusInput(refMap, index - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (mode === 'enter') {
      if (!isComplete) {
        setError('Digite os 6 dígitos para acessar a conta digital.');
        return;
      }

      try {
        setSubmitting(true);
        setError('');

        const response = await validatePagClinPassword({
          password: pin.join(''),
        });

        if (response?.success === true) {
          dispatch(grantDigitalAccountAccess(Date.now()));
          setUnlocked(true);
          return;
        }

        setError(response?.message || 'Senha incorreta. Tente novamente.');
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Nao foi possivel validar a senha.');
      } finally {
        setSubmitting(false);
      }

      return;
    }

    if (!isComplete || !isConfirmComplete) {
      setError('Preencha e confirme a senha de 6 dígitos.');
      return;
    }

    if (pin.join('') !== confirmPin.join('')) {
      setError('As senhas não conferem.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await savePagClinPassword({
        password: pin.join(''),
        password_confirmation: confirmPin.join(''),
      });

      if (response?.success && response?.password === true) {
        dispatch(grantDigitalAccountAccess(Date.now()));
        setUnlocked(true);
        return;
      }

      setError(response?.message || 'Nao foi possivel salvar a senha.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Nao foi possivel salvar a senha.');
    } finally {
      setSubmitting(false);
    }
  };

  if (unlocked) {
    return <DigitalAccountOverviewScreen navigation={navigation} />;
  }

  return (
    <View style={styles.container}>
      <Modal transparent animationType="fade" visible onRequestClose={() => navigation.goBack()}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />
          <View style={styles.modalCard}>
            <View style={styles.iconWrap}>
              <Feather name="shield" size={22} color={colors.primary} />
            </View>
            <Text style={styles.title}>{mode === 'create' ? 'Primeiro acesso' : 'Acesso protegido'}</Text>
            <Text style={styles.subtitle}>
              {mode === 'create'
                ? 'Crie uma senha de 6 dígitos para proteger sua conta digital.'
                : 'Digite sua senha de 6 dígitos para entrar na conta digital.'}
            </Text>

            {checkingAccess ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Verificando acesso...</Text>
              </View>
            ) : (
              <>
                <View style={styles.pinBlock}>
                  {mode === 'create' ? <Text style={styles.pinLabel}>Criar senha</Text> : null}
                  <View style={styles.pinRow}>
                    {pin.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(el) => {
                          inputRefs.current[`pin-${index}`] = el;
                        }}
                        value={digit}
                        onChangeText={(value) => handleChange(index, value, pin, setPin, inputRefs)}
                        onKeyPress={(e) => handleKeyPress(index, e, pin, inputRefs)}
                        keyboardType="number-pad"
                        maxLength={1}
                        secureTextEntry
                        style={[styles.pinInput, digit && styles.pinInputFilled, error && styles.pinInputError]}
                        returnKeyType={index === PIN_LENGTH - 1 ? 'done' : 'next'}
                        autoFocus={index === 0}
                      />
                    ))}
                  </View>
                </View>

                {mode === 'create' ? (
                  <View style={styles.pinBlock}>
                    <Text style={styles.pinLabel}>Confirmar senha</Text>
                    <View style={styles.pinRow}>
                      {confirmPin.map((digit, index) => (
                        <TextInput
                          key={`confirm-${index}`}
                          ref={(el) => {
                            confirmInputRefs.current[`pin-${index}`] = el;
                          }}
                          value={digit}
                          onChangeText={(value) =>
                            handleChange(index, value, confirmPin, setConfirmPin, confirmInputRefs)
                          }
                          onKeyPress={(e) => handleKeyPress(index, e, confirmPin, confirmInputRefs)}
                          keyboardType="number-pad"
                          maxLength={1}
                          secureTextEntry
                          style={[styles.pinInput, digit && styles.pinInputFilled, error && styles.pinInputError]}
                          returnKeyType={index === PIN_LENGTH - 1 ? 'done' : 'next'}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
              </>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <AppButton
              title={submitting ? 'Salvando...' : mode === 'create' ? 'Criar senha' : 'Entrar'}
              onPress={handleSubmit}
              disabled={
                checkingAccess ||
                submitting ||
                (mode === 'create' ? !isComplete || !isConfirmComplete : !isComplete)
              }
              style={styles.primaryButton}
              left={<Feather name="arrow-right" size={16} color={colors.primaryForeground} />}
            />
            <AppButton
              title="Cancelar"
              variant="ghost"
              onPress={() => navigation.goBack()}
              disabled={submitting}
              style={styles.secondaryButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 30, 66, 0.55)',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 30,
    elevation: 10,
    maxWidth: 380,
    width: '100%',
    alignSelf: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31,128,234,0.12)',
    marginBottom: 12,
  },
  title: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  pinBlock: {
    marginTop: 2,
  },
  pinLabel: {
    marginBottom: 8,
    color: colors.cardForeground,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
  },
  pinInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#F8FBFF',
    textAlign: 'center',
    color: colors.cardForeground,
    fontSize: 20,
    fontWeight: '800',
  },
  pinInputFilled: {
    borderColor: colors.primary,
    backgroundColor: '#EEF6FF',
  },
  pinInputError: {
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: 10,
    color: colors.danger,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  loadingBox: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
  },
  primaryButton: {
    marginTop: 14,
    minHeight: 46,
  },
  secondaryButton: {
    marginTop: 8,
    minHeight: 44,
  },
});
