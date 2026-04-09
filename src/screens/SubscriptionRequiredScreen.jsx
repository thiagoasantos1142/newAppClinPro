import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton, AppCard } from '../components/ui.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { useAuth } from '../hooks/useAuth';
import { useOnboarding } from '../hooks/useOnboarding';
import {
  createClinProSubscription,
  getClinProPixPlans,
  getClinProPixStatus,
} from '../services/modules/clinpro-subscription.service';

const HERO_IMAGE = require('../../assets/clinpro-renovacao.png');
const POLLING_INTERVAL_MS = 5000;

const BENEFITS = [
  {
    icon: 'trending-up',
    iconSet: 'feather',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    title: 'Mais clientes e oportunidades',
    description: 'Apareca para quem precisa dos seus servicos com mais frequencia.',
  },
  {
    icon: 'shield-check',
    iconSet: 'material',
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    title: 'Perfil profissional verificado',
    description: 'Passe mais confianca e aumente suas chances de fechar servicos.',
  },
  {
    icon: 'calendar',
    iconSet: 'feather',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    title: 'Agenda organizada',
    description: 'Visualize compromissos, horarios e sua rotina com clareza.',
  },
  {
    icon: 'award',
    iconSet: 'feather',
    color: '#EA580C',
    bg: '#FFF7ED',
    border: '#FED7AA',
    title: 'Treinamentos praticos',
    description: 'Aprenda, evolua e aumente sua renda com mais especializacao.',
  },
];

const TESTIMONIALS = [
  {
    text: 'Depois que entrei no Clin Pro, consegui mais clientes fixos e minha renda ficou mais previsivel.',
    author: 'Mariana S., Sao Paulo',
  },
  {
    text: 'A agenda organizada mudou meu dia a dia. Hoje eu trabalho com muito mais controle.',
    author: 'Juliana M., Rio de Janeiro',
  },
];

const getOfferTitle = (offerType) => {
  if (offerType === 'renewal') return 'Renove sua assinatura Clin Pro';
  if (offerType === 'renewal_discount') return 'Condicao especial para voltar ao Clin Pro';
  if (offerType === 'new_subscription') return 'Assine o Clin Pro';
  return 'Volte para o Clin Pro';
};

const getOfferButtonLabel = (offerType) => {
  if (offerType === 'new_subscription') return 'Assinar agora';
  return 'Renovar assinatura';
};

const getOfferBadge = (offerType) => {
  if (offerType === 'renewal_discount') return 'CONDICAO ESPECIAL';
  if (offerType === 'new_subscription') return 'NOVA ASSINATURA';
  return 'RENOVACAO';
};

const getSubscriptionErrorMessage = (err) => {
  const status = err?.response?.status;
  const backendMessage = err?.response?.data?.message || err?.message || '';

  if (
    typeof backendMessage === 'string' &&
    (backendMessage.includes('CreateClinProSubscriptionAction') ||
      backendMessage.includes('must be of type') ||
      backendMessage.includes('App\\Domains\\ClinPro'))
  ) {
    return 'Nao foi possivel iniciar sua assinatura agora. Tente novamente em instantes ou fale com o suporte.';
  }

  if (status && status >= 500) {
    return 'Ocorreu uma instabilidade ao processar sua assinatura. Tente novamente em instantes.';
  }

  if (typeof backendMessage === 'string' && backendMessage.trim()) {
    return backendMessage;
  }

  return 'Nao foi possivel iniciar a assinatura agora.';
};

const formatPrice = (price, priceLabel) => {
  if (priceLabel) return priceLabel;
  if (price == null || price === '') return '--';
  const numeric = Number(String(price).replace(',', '.'));
  if (Number.isFinite(numeric)) {
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return String(price);
};

const normalizePlansPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.plans)) return payload.plans;
  return [];
};

const normalizeSubscribeResponse = (payload) => {
  if (!payload || typeof payload !== 'object') return { checkout: null, raw: payload };
  if (payload.checkout) {
    return {
      checkout: {
        ...payload.checkout,
        subscription_id: payload.subscription_id ?? payload.checkout.subscription_id,
        authorization_id: payload.authorization_id ?? payload.checkout.authorization_id,
      },
      raw: payload,
    };
  }
  if (payload.data?.checkout) {
    return {
      checkout: {
        ...payload.data.checkout,
        subscription_id: payload.data.subscription_id ?? payload.data.checkout.subscription_id,
        authorization_id: payload.data.authorization_id ?? payload.data.checkout.authorization_id,
      },
      raw: payload,
    };
  }
  if (payload.pix) return { checkout: payload.pix, raw: payload };
  if (payload.payment) return { checkout: payload.payment, raw: payload };
  if (payload.data?.pix) return { checkout: payload.data.pix, raw: payload };
  if (payload.data?.payment) return { checkout: payload.data.payment, raw: payload };
  return { checkout: payload, raw: payload };
};

const getCheckoutStatusId = (checkout) =>
  checkout?.authorization_id ||
  checkout?.id ||
  checkout?.pix_id ||
  checkout?.payment_id ||
  checkout?.subscription_id ||
  checkout?.transaction_id ||
  checkout?.charge_id ||
  null;

const getPixCopyCode = (checkout) =>
  checkout?.pix_copy_and_paste ||
  checkout?.pix_copy_paste ||
  checkout?.pix_copia_cola ||
  checkout?.pix_code_copy_paste ||
  checkout?.pix_payload ||
  checkout?.payload ||
  checkout?.emv ||
  checkout?.br_code ||
  checkout?.qr_code_text ||
  checkout?.qrcode_text ||
  checkout?.copy_paste ||
  checkout?.pix_code ||
  checkout?.qr_code ||
  checkout?.qrcode ||
  checkout?.code ||
  '';

const getQrImageSource = (checkout) => {
  const base64Value =
    checkout?.qr_code ||
    checkout?.qr_code_base64 ||
    checkout?.qr_code_image_base64 ||
    checkout?.qrcode_base64 ||
    checkout?.pix_qr_code_base64;

  if (base64Value) {
    const normalized = String(base64Value).startsWith('data:')
      ? base64Value
      : `data:image/png;base64,${base64Value}`;
    return { uri: normalized };
  }

  const remoteValue =
    checkout?.qr_code_url ||
    checkout?.qr_code_image ||
    checkout?.qrcode_url ||
    checkout?.pix_qr_code_url;

  if (remoteValue) {
    return { uri: remoteValue };
  }

  return null;
};

const isPixPaid = (statusPayload) => {
  const status = String(
    statusPayload?.status ||
    statusPayload?.payment_status ||
    statusPayload?.checkout_status ||
    ''
  ).toLowerCase();

  return Boolean(
    statusPayload?.paid ||
    statusPayload?.approved ||
    statusPayload?.is_paid ||
    statusPayload?.active ||
    ['paid', 'approved', 'completed', 'confirmed', 'success', 'active'].includes(status)
  );
};

function BenefitIcon({ item }) {
  if (item.iconSet === 'material') {
    return <MaterialCommunityIcons name={item.icon} size={24} color="#FFFFFF" />;
  }

  return <Feather name={item.icon} size={24} color="#FFFFFF" />;
}

export default function SubscriptionRequiredScreen({
  access = null,
  message = 'Seu acesso a Clin Pro expirou. Assine para continuar.',
}) {
  const { logout } = useAuth();
  const { refresh } = useOnboarding();
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [pixStatus, setPixStatus] = useState(null);

  const loadPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const response = await getClinProPixPlans();
      setPlans(normalizePlansPayload(response));
    } catch {
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const effectivePlan = useMemo(() => {
    if (access?.plan) return access.plan;
    if (plans.length > 0) return plans[0];
    return null;
  }, [access?.plan, plans]);

  const promotion = access?.promotion?.has_promotion ? access.promotion : null;
  const displayPrice = promotion
    ? formatPrice(promotion.price, promotion.price_label)
    : formatPrice(effectivePlan?.price, effectivePlan?.price_label);
  const basePrice = formatPrice(effectivePlan?.price, effectivePlan?.price_label);
  const offerType = access?.offer_type || 'renewal';
  const pixCopyCode = getPixCopyCode(checkout);
  const qrImageSource = getQrImageSource(checkout);
  const checkoutStatusId = getCheckoutStatusId(checkout);
  const billingCycle = effectivePlan?.billing_cycle || 'monthly';
  const recurrenceText = billingCycle === 'monthly'
    ? 'Assinatura mensal recorrente com cobranca automatica'
    : 'Assinatura recorrente com cobranca automatica';
  const ctaLabel = displayPrice && displayPrice !== '--'
    ? `${getOfferButtonLabel(offerType)} • ${displayPrice}`
    : getOfferButtonLabel(offerType);

  const refreshAccessStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const latestStatus = await refresh({ force: true });
      if (latestStatus?.access?.is_active) {
        Alert.alert('Assinatura ativa', 'Pagamento confirmado. Seu acesso ao Clin Pro foi liberado.');
      }
      return latestStatus;
    } catch (err) {
      const backendMessage = err?.response?.data?.message || err?.message;
      Alert.alert('Erro', backendMessage || 'Nao foi possivel atualizar o status agora.');
      return null;
    } finally {
      setStatusLoading(false);
    }
  }, [refresh]);

  const pollPixStatus = useCallback(async () => {
    if (!checkoutStatusId) return null;

    try {
      const response = await getClinProPixStatus(checkoutStatusId);
      setPixStatus(response);

      if (isPixPaid(response)) {
        await refreshAccessStatus();
      }

      return response;
    } catch (err) {
      const backendMessage = err?.response?.data?.message || err?.message;
      Alert.alert('Erro', backendMessage || 'Nao foi possivel consultar o pagamento.');
      return null;
    }
  }, [checkoutStatusId, refreshAccessStatus]);

  useEffect(() => {
    if (!checkoutStatusId) return undefined;

    const intervalId = setInterval(() => {
      void pollPixStatus();
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [checkoutStatusId, pollPixStatus]);

  const handleCopyPix = useCallback(async () => {
    if (!pixCopyCode) {
      Alert.alert('PIX indisponivel', 'O backend ainda nao retornou o codigo copia e cola.');
      return;
    }

    await Clipboard.setStringAsync(pixCopyCode);
    Alert.alert('PIX copiado', 'O codigo PIX copia e cola foi copiado.');
  }, [pixCopyCode]);

  const handleSubscribe = useCallback(async () => {
    try {
      setActionLoading(true);
      const response = await createClinProSubscription({
        ...(effectivePlan?.id ? { plan_id: effectivePlan.id } : {}),
        ...(offerType ? { offer_type: offerType } : {}),
      });
      const parsed = normalizeSubscribeResponse(response);
      setCheckout(parsed.checkout);

      if (!parsed.checkout) {
        Alert.alert('Checkout indisponivel', 'O backend nao retornou os dados de checkout.');
        return;
      }

      const firstStatusId = getCheckoutStatusId(parsed.checkout);
      if (firstStatusId) {
        void pollPixStatus();
      }
    } catch (err) {
      Alert.alert('Erro', getSubscriptionErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }, [effectivePlan?.id, offerType, pollPixStatus]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <ImageBackground source={HERO_IMAGE} style={styles.heroImage} imageStyle={styles.heroImageStyle}>
            <View style={styles.heroOverlay} />
          </ImageBackground>
        </View>

        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>{getOfferTitle(offerType)}</Text>
          <Text style={styles.heroSubtitle}>{message}</Text>
        </View>

        <View style={styles.socialProof}>
          <Feather name="users" size={18} color={colors.primary} />
          <Text style={styles.socialProofText}>
            Mais de <Text style={styles.socialProofStrong}>5.000 profissionais</Text> ja fazem parte
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que voce ganha no Clin Pro</Text>
          {BENEFITS.map((item) => (
            <View
              key={item.title}
              style={[
                styles.benefitCard,
                { backgroundColor: item.bg, borderColor: item.border },
              ]}
            >
              <View style={[styles.benefitIconWrap, { backgroundColor: item.color }]}>
                <BenefitIcon item={item} />
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>{item.title}</Text>
                <Text style={styles.benefitDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quem ja faz parte conta</Text>
          {TESTIMONIALS.map((item) => (
            <AppCard key={item.author} style={styles.testimonialCard}>
              <View style={styles.starsRow}>
                {[0, 1, 2, 3, 4].map((star) => (
                  <Feather key={star} name="star" size={14} color="#F59E0B" />
                ))}
              </View>
              <Text style={styles.testimonialText}>{item.text}</Text>
              <Text style={styles.testimonialAuthor}>- {item.author}</Text>
            </AppCard>
          ))}
        </View>

        <View style={[styles.section, styles.pricingSection]}>
          <Text style={styles.sectionTitle}>
            {offerType === 'new_subscription' ? 'Comece sua assinatura' : 'Renove agora sua assinatura'}
          </Text>
          <View style={styles.pricingCard}>
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>{getOfferBadge(offerType)}</Text>
            </View>

            <Text style={styles.pricingLabel}>{effectivePlan?.name || 'Assinatura Clin Pro'}</Text>
            {plansLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 8 }} />
            ) : (
              <>
                {promotion ? (
                  <>
                    <Text style={styles.promotionBadge}>Oferta promocional ativa</Text>
                    <Text style={styles.pricingValue}>{displayPrice}</Text>
                    <Text style={styles.basePrice}>De {basePrice}</Text>
                  </>
                ) : (
                  <Text style={styles.pricingValue}>{displayPrice}</Text>
                )}
              </>
            )}
            <Text style={styles.pricingRecurrence}>
              {effectivePlan?.name ? `${effectivePlan.name} • ${recurrenceText.toLowerCase()}` : recurrenceText}
            </Text>
            <Text style={styles.recurrenceHighlight}>
              Esta e uma assinatura mensal recorrente, com cobranca automatica para manter seu acesso ativo.
            </Text>

            <View style={styles.divider} />

            {[
              'Perfil profissional verificado',
              'Acesso aos treinamentos',
              'Agenda inteligente',
              'Comunidade exclusiva',
              'Ferramentas de gestao financeira',
            ].map((item) => (
              <View key={item} style={styles.includedRow}>
                <View style={styles.includedCheck}>
                  <Feather name="check" size={12} color={colors.primary} />
                </View>
                <Text style={styles.includedText}>{item}</Text>
              </View>
            ))}

            <View style={styles.cancelBox}>
              <Text style={styles.cancelText}>Cancele quando quiser • Sem fidelidade</Text>
            </View>
          </View>
        </View>

        {checkout ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pagamento via PIX</Text>
            <AppCard style={styles.checkoutCard}>
              {qrImageSource ? <Image source={qrImageSource} style={styles.qrImage} resizeMode="contain" /> : null}

              <Text style={styles.checkoutTitle}>Checkout gerado</Text>
              <Text style={styles.checkoutSubtitle}>
                Pague o PIX para ativar sua assinatura mensal recorrente. Apos a confirmacao, o app atualiza seu acesso automaticamente.
              </Text>

              {pixCopyCode ? (
                <View style={styles.pixCodeBox}>
                  <Text style={styles.pixCodeLabel}>PIX copia e cola</Text>
                  <Text style={styles.pixCodeValue}>{pixCopyCode}</Text>
                </View>
              ) : (
                <View style={styles.pixWarningBox}>
                  <Text style={styles.pixWarningText}>
                    O backend ainda nao retornou o codigo PIX copia e cola para este checkout.
                  </Text>
                </View>
              )}

              {!qrImageSource ? (
                <View style={styles.pixWarningBox}>
                  <Text style={styles.pixWarningText}>
                    O backend ainda nao retornou a imagem do QR Code para este checkout.
                  </Text>
                </View>
              ) : null}

              <View style={styles.checkoutActions}>
                <AppButton
                  title="Copiar PIX"
                  onPress={() => void handleCopyPix()}
                  variant="secondary"
                  style={styles.inlineButton}
                  disabled={!pixCopyCode}
                  left={<Feather name="copy" size={16} color={colors.cardForeground} />}
                />
                <AppButton
                  title={statusLoading ? 'Atualizando...' : 'Atualizar status'}
                  onPress={() => void pollPixStatus()}
                  style={styles.inlineButton}
                  disabled={statusLoading}
                  left={
                    statusLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Feather name="refresh-cw" size={16} color="#FFFFFF" />
                    )
                  }
                />
              </View>

              {pixStatus ? (
                <Text style={styles.statusText}>
                  Status do pagamento: {pixStatus.status_label || pixStatus.status || 'em processamento'}
                </Text>
              ) : (
                <Text style={styles.statusText}>Aguardando confirmacao do pagamento.</Text>
              )}
            </AppCard>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.guaranteeBox}>
            <View style={styles.guaranteeIconWrap}>
              <Feather name="shield" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.guaranteeTextWrap}>
              <Text style={styles.guaranteeTitle}>Assinatura recorrente automatica</Text>
              <Text style={styles.guaranteeText}>
                Esta assinatura e mensal, recorrente e com cobranca automatica. Os valores do plano e das promocoes sao carregados do backend.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title={actionLoading ? 'Gerando checkout...' : ctaLabel}
          onPress={() => void handleSubscribe()}
          disabled={actionLoading || plansLoading}
          style={styles.footerButton}
          left={
            actionLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Feather name="arrow-right" size={18} color="#FFFFFF" />
            )
          }
        />
        <Text style={styles.footerNote}>Pagamento seguro • Assinatura mensal com renovacao automatica</Text>
        <AppButton
          title="Sair da conta"
          variant="ghost"
          onPress={() => void logout()}
          style={styles.exitButton}
          textStyle={{ color: colors.cardForeground }}
          left={<Feather name="log-out" size={16} color={colors.cardForeground} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 170,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
  },
  heroImage: {
    height: 320,
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  heroTextWrap: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: '#F8FBFF',
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: colors.cardForeground,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.mutedForeground,
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(31, 128, 234, 0.05)',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  socialProofText: {
    fontSize: 14,
    color: colors.cardForeground,
    textAlign: 'center',
    fontWeight: '500',
  },
  socialProofStrong: {
    color: colors.primary,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.cardForeground,
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 12,
  },
  benefitIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextWrap: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.cardForeground,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.mutedForeground,
  },
  testimonialCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.cardForeground,
    marginBottom: 10,
  },
  testimonialAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedForeground,
  },
  pricingSection: {
    backgroundColor: 'rgba(31, 128, 234, 0.06)',
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(31, 128, 234, 0.18)',
  },
  offerBadge: {
    alignSelf: 'flex-end',
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 20,
    marginBottom: 16,
  },
  offerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  pricingLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 8,
  },
  promotionBadge: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  pricingValue: {
    fontSize: 42,
    lineHeight: 48,
    color: colors.primary,
    fontWeight: '800',
    textAlign: 'center',
  },
  basePrice: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    textDecorationLine: 'line-through',
    marginTop: 6,
  },
  pricingRecurrence: {
    fontSize: 14,
    color: colors.cardForeground,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  recurrenceHighlight: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(26, 62, 112, 0.08)',
    marginVertical: 22,
  },
  includedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  includedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(31, 128, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  includedText: {
    flex: 1,
    fontSize: 14,
    color: colors.cardForeground,
  },
  cancelBox: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cancelText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  checkoutCard: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrImage: {
    width: '100%',
    height: 220,
    marginBottom: 16,
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.cardForeground,
    textAlign: 'center',
    marginBottom: 6,
  },
  checkoutSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 16,
  },
  pixCodeBox: {
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    padding: 14,
    marginBottom: 14,
  },
  pixCodeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedForeground,
    marginBottom: 6,
  },
  pixCodeValue: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.cardForeground,
  },
  pixWarningBox: {
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 14,
    marginBottom: 12,
  },
  pixWarningText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9A3412',
    textAlign: 'center',
  },
  checkoutActions: {
    flexDirection: 'row',
    gap: 10,
  },
  inlineButton: {
    flex: 1,
    minHeight: 44,
  },
  statusText: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 13,
    color: colors.cardForeground,
    fontWeight: '600',
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 18,
  },
  guaranteeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
  },
  guaranteeTextWrap: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.cardForeground,
    marginBottom: 4,
  },
  guaranteeText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.mutedForeground,
  },
  bottomSpace: {
    height: 24,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 62, 112, 0.08)',
  },
  footerButton: {
    minHeight: 56,
    borderRadius: 18,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 10,
  },
  exitButton: {
    marginTop: 10,
  },
});
