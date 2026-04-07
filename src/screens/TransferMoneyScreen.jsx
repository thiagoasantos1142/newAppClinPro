import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import { AppButton, AppCard } from '../components/ui.jsx';
import { createAccountTransfer } from '../services/modules/finance.service';
import { colors } from '../theme/tokens';

export default function TransferMoneyScreen({ navigation }) {
  const [pixKey, setPixKey] = useState('***@email.com');
  const [amount, setAmount] = useState('100.00');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await createAccountTransfer({ pix_key: pixKey, amount: Number(amount), description: description || undefined });
      Alert.alert('Sucesso', 'Transferência enviada.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message || err?.message || 'Não foi possível transferir.');
    } finally { setSubmitting(false); }
  };

  return (
    <View style={styles.container}>
      <AppScreenHeader title="Transferir Dinheiro" subtitle="Envie valores para outra conta" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard>
          <Text style={styles.label}>Chave PIX</Text>
          <TextInput value={pixKey} onChangeText={setPixKey} style={styles.input} autoCapitalize="none" />
          <Text style={[styles.label, { marginTop: 10 }]}>Valor</Text>
          <TextInput value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" />
          <Text style={[styles.label, { marginTop: 10 }]}>Descrição (opcional)</Text>
          <TextInput value={description} onChangeText={setDescription} style={styles.input} />
        </AppCard>
        <AppButton title={submitting ? 'Confirmando...' : 'Confirmar Transferência'} onPress={onSubmit} disabled={submitting} left={<Feather name="check" size={16} color="#FFF" />} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, content: { padding: 16, gap: 12, paddingBottom: 28 }, label: { color: colors.mutedForeground, fontSize: 12, marginBottom: 6 }, input: { minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: '#FFF', paddingHorizontal: 12, color: colors.cardForeground } });
