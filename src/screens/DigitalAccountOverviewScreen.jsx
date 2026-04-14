import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import { useDispatch, useSelector } from 'react-redux';
import AppScreenHeader from '../components/AppScreenHeader.jsx';
import HeaderActionButton from '../components/HeaderActionButton.jsx';
import { AppButton, AppCard, Badge, ProgressBar } from '../components/ui.jsx';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { getAddressByPostalCode } from '../services/modules/address.service';
import { createAccount, getAccountStatus, updateAccountData } from '../services/modules/finance.service';
import {
  hydrateDigitalAccountDraft,
  setDigitalAccountPhoneCountry,
  setDigitalAccountStep,
  updateDigitalAccountField,
} from '../store/digitalAccountSlice';

const emptyAccountForm = {
  name: '',
  birthDate: '',
  email: '',
  mobilePhone: '',
  cpfCnpj: '',
  address: '',
  addressNumber: '',
  complement: '',
  province: '',
  postalCode: '',
  city: '',
  state: '',
  incomeValue: '1,00',
};

const accountCreationSteps = [
  {
    title: 'Dados Básicos',
    description: 'Informe seus dados pessoais.',
    fields: [
      { key: 'name', label: 'Nome completo', placeholder: 'Digite seu nome', autoCapitalize: 'words' },
      { key: 'birthDate', label: 'Data de nascimento', placeholder: 'DD/MM/AAAA', autoCapitalize: 'none' },
    ],
  },
  {
    title: 'Contato',
    description: 'Dados para contato e recuperação.',
    fields: [
      { key: 'email', label: 'E-mail', placeholder: 'Digite seu e-mail', keyboardType: 'email-address', autoCapitalize: 'none' },
      { key: 'mobilePhone', label: 'Celular', placeholder: 'Digite seu celular', keyboardType: 'phone-pad', autoCapitalize: 'none' },
    ],
  },
  {
    title: 'Documento',
    description: 'Confirme o documento principal.',
    fields: [
      { key: 'cpfCnpj', label: 'CPF ou CNPJ', placeholder: 'Digite seu documento', keyboardType: 'numeric', autoCapitalize: 'none' },
    ],
  },
  {
    title: 'Endereço',
    description: 'Endereço usado no cadastro.',
    fields: [
      { key: 'postalCode', label: 'CEP', placeholder: 'Digite o CEP', keyboardType: 'numeric', autoCapitalize: 'none', widthRatio: 7 },
      { key: 'state', label: 'UF', placeholder: 'UF', autoCapitalize: 'characters', widthRatio: 3 },
      { key: 'address', label: 'Rua', placeholder: 'Digite o endereço', autoCapitalize: 'words', widthRatio: 7 },
      { key: 'addressNumber', label: 'Número', placeholder: 'Número', keyboardType: 'numeric', autoCapitalize: 'none', widthRatio: 3 },
      { key: 'province', label: 'Bairro', placeholder: 'Digite o bairro', autoCapitalize: 'words' },
      { key: 'city', label: 'Cidade', placeholder: 'Cidade', autoCapitalize: 'words', widthRatio: 10 },
      { key: 'complement', label: 'Complemento (não obrigatório)', placeholder: 'Apartamento, bloco, casa...', autoCapitalize: 'words' },
    ],
  },
  {
    title: 'Financeiro',
    description: 'Informações para análise financeira.',
    fields: [
      { key: 'incomeValue', label: 'Renda', placeholder: 'Informe sua renda', keyboardType: 'numeric', autoCapitalize: 'none' },
    ],
  },
  {
    title: 'Verifique seus dados',
    description: 'Confira as informações antes de concluir.',
    fields: [],
  },
];

const TOTAL_STEPS = accountCreationSteps.length;

const phoneCountries = [
  { code: 'BR', dialCode: '+55', label: 'Brasil' },
];

const stepRequiredFields = [
  ['name', 'birthDate'],
  ['email', 'mobilePhone'],
  ['cpfCnpj'],
  ['address', 'addressNumber', 'province', 'postalCode', 'city', 'state'],
  ['incomeValue'],
  [],
];

const stepPayloadFields = [
  ['name', 'birthDate'],
  ['email', 'mobilePhone'],
  ['cpfCnpj'],
  ['address', 'addressNumber', 'complement', 'province', 'postalCode'],
  ['incomeValue'],
  ['name', 'birthDate', 'email', 'mobilePhone', 'cpfCnpj', 'address', 'addressNumber', 'complement', 'province', 'postalCode', 'incomeValue'],
];

function getDigits(value = '') {
  return String(value).replace(/\D/g, '');
}

function formatBirthDate(value = '') {
  const normalized = String(value).trim();
  const isoDateMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    return `${isoDateMatch[3]}/${isoDateMatch[2]}/${isoDateMatch[1]}`;
  }
  const digits = getDigits(value).slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatMobilePhone(value = '', countryCode = 'BR', options = {}) {
  const digits = getDigits(value);

  if (countryCode === 'US') {
    const normalized = digits.slice(0, 10);
    if (normalized.length <= 3) return normalized;
    if (normalized.length <= 6) return `(${normalized.slice(0, 3)}) ${normalized.slice(3)}`;
    return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  }

  if (countryCode === 'VE') {
    const normalized = digits.slice(0, 11);
    if (normalized.length <= 4) return normalized;
    if (normalized.length <= 7) return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 7)}-${normalized.slice(7)}`;
  }

  const normalized = options.normalizeBrazilInput ? normalizeBrazilPhoneDigits(digits) : digits.slice(0, 11);
  if (normalized.length <= 2) return normalized;
  if (normalized.length <= 7) return `(${normalized.slice(0, 2)}) ${normalized.slice(2)}`;
  return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 7)}-${normalized.slice(7)}`;
}

function normalizeBrazilPhoneDigits(value = '') {
  let digits = getDigits(value);

  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }

  if (digits.length === 8) {
    digits = `9${digits}`;
  }

  if (digits.length === 9) {
    digits = `41${digits}`;
  }

  if (digits.length === 10) {
    digits = `${digits.slice(0, 2)}9${digits.slice(2)}`;
  }

  return digits.slice(0, 11);
}

function formatCpfCnpj(value = '') {
  const digits = getDigits(value).slice(0, 14);
  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatPostalCode(value = '') {
  const digits = getDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatIncomeValue(value = '') {
  const digits = getDigits(value).slice(0, 12);
  if (!digits) return '1,00';
  const amount = Number(digits) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrencyValue(value = '') {
  const normalized = String(value).replace(/\./g, '').replace(',', '.');
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeAddressNumber(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function toApiBirthDate(value = '') {
  const match = String(value).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return value;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function buildAccountDataPayload(form, fields) {
  const accountData = {};

  fields.forEach((field) => {
    if (!(field in form)) return;

    if (field === 'address') {
      accountData.street = String(form.address || '').trim();
      return;
    }

    if (field === 'birthDate') {
      accountData.birthDate = toApiBirthDate(form.birthDate || '');
      return;
    }

    if (field === 'mobilePhone' || field === 'cpfCnpj' || field === 'postalCode') {
      accountData[field] = getDigits(form[field] || '');
      return;
    }

    if (field === 'incomeValue') {
      accountData.incomeValue = parseCurrencyValue(form.incomeValue || '0');
      return;
    }

    if (field === 'addressNumber') {
      const digits = getDigits(form.addressNumber || '');
      accountData.addressNumber = digits ? Number(digits) : null;
      return;
    }

    accountData[field] = String(form[field] || '').trim();
  });

  return { account_data: accountData };
}

function buildReviewSections(form) {
  return [
    {
      title: 'Dados básicos',
      items: [
        { label: 'Nome', value: form.name || '-' },
        { label: 'Data de nascimento', value: form.birthDate || '-' },
      ],
    },
    {
      title: 'Contato',
      items: [
        { label: 'E-mail', value: form.email || '-' },
        { label: 'Celular', value: form.mobilePhone || '-' },
      ],
    },
    {
      title: 'Documento',
      items: [{ label: 'CPF/CNPJ', value: form.cpfCnpj || '-' }],
    },
    {
      title: 'Endereço',
      items: [
        { label: 'CEP', value: form.postalCode || '-' },
        { label: 'UF', value: form.state || '-' },
        { label: 'Rua', value: form.address || '-' },
        { label: 'Número', value: form.addressNumber || '-' },
        { label: 'Bairro', value: form.province || '-' },
        { label: 'Cidade', value: form.city || '-' },
        { label: 'Complemento', value: form.complement || '-' },
      ],
    },
    {
      title: 'Financeiro',
      items: [{ label: 'Renda', value: form.incomeValue || '-' }],
    },
  ];
}

function applyFieldMask(fieldKey, value, options = {}) {
  switch (fieldKey) {
    case 'birthDate':
      return formatBirthDate(value);
    case 'mobilePhone':
      return formatMobilePhone(value, options.phoneCountryCode, options);
    case 'cpfCnpj':
      return formatCpfCnpj(value);
    case 'postalCode':
      return formatPostalCode(value);
    case 'incomeValue':
      return formatIncomeValue(value);
    default:
      return value;
  }
}

function hasFirstAndLastName(value = '') {
  const parts = String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return parts.length >= 2;
}

function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isValidBrazilPhone(value = '') {
  return getDigits(value).length === 11;
}

function isRepeatedDigits(value = '') {
  return /^(\d)\1+$/.test(value);
}

function isValidCpf(value = '') {
  const digits = getDigits(value);
  if (digits.length !== 11 || isRepeatedDigits(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;

  return remainder === Number(digits[10]);
}

function isValidCnpj(value = '') {
  const digits = getDigits(value);
  if (digits.length !== 14 || isRepeatedDigits(digits)) return false;

  const calcCheckDigit = (base, factors) => {
    const sum = base.split('').reduce((acc, digit, index) => acc + Number(digit) * factors[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calcCheckDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calcCheckDigit(digits.slice(0, 12) + String(firstDigit), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return firstDigit === Number(digits[12]) && secondDigit === Number(digits[13]);
}

function isValidCpfCnpj(value = '') {
  const digits = getDigits(value);
  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return isValidCnpj(digits);
  return false;
}

function formatCurrency(value, hidden) {
  if (hidden) return 'R$ ••••••';
  return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DigitalAccountOverviewScreen({ navigation }) {
  const dispatch = useDispatch();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [accountStatus, setAccountStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState(null);
  const [showPhoneCountrySelect, setShowPhoneCountrySelect] = useState(false);
  const [stepAnimation] = useState(() => new Animated.Value(0));
  const [postalCodeLookupLoading, setPostalCodeLookupLoading] = useState(false);
  const [postalCodeLookupError, setPostalCodeLookupError] = useState(null);
  const [postalCodeResolved, setPostalCodeResolved] = useState(false);
  const [submittingStep, setSubmittingStep] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const {
    form: accountForm = emptyAccountForm,
    currentStep = 0,
    selectedPhoneCountryCode = 'BR',
    hydrated = false,
  } =
    useSelector((state) => state.digitalAccount || {});

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadAccountStatus = async () => {
        setLoadingStatus(true);
        setStatusError(null);

        try {
          const response = await getAccountStatus();
          if (isActive) {
            setAccountStatus(response);
            setShowPhoneCountrySelect(false);
            setPostalCodeLookupError(null);
            setSubmitError(null);
            if (response?.has_account === false && !hydrated) {
              const initialPostalCode = applyFieldMask('postalCode', response?.account_data?.postalCode ?? '');
              let viaCepData = null;
              const reduxPostalCodeDigits = getDigits(accountForm.postalCode || '');
              const initialPostalCodeDigits = getDigits(initialPostalCode);
              const hasReduxAddressData = Boolean(
                accountForm.address || accountForm.province || accountForm.city || accountForm.state
              );

              if (initialPostalCodeDigits.length === 8 && !(reduxPostalCodeDigits === initialPostalCodeDigits && hasReduxAddressData)) {
                try {
                  viaCepData = await getAddressByPostalCode(initialPostalCode);
                } catch {
                  viaCepData = null;
                }
              }

              const initialAddress = viaCepData?.address || response?.account_data?.address || '';
              const initialProvince = viaCepData?.province || response?.account_data?.province || '';
              const initialComplement = response?.account_data?.complement || viaCepData?.complement || '';
              const initialCity = viaCepData?.city || response?.account_data?.city || '';
              const initialState = viaCepData?.state || response?.account_data?.state || '';

              setPostalCodeResolved(Boolean(getDigits(initialPostalCode).length === 8 && (initialAddress || initialProvince)));
              dispatch(
                hydrateDigitalAccountDraft({
                  currentStep: 0,
                  selectedPhoneCountryCode: 'BR',
                  form: {
                    name: response?.account_data?.name ?? '',
                    birthDate: applyFieldMask('birthDate', response?.account_data?.birthDate ?? ''),
                    email: response?.account_data?.email ?? '',
                    mobilePhone: applyFieldMask('mobilePhone', response?.account_data?.mobilePhone ?? '', {
                      phoneCountryCode: 'BR',
                      normalizeBrazilInput: true,
                    }),
                    cpfCnpj: applyFieldMask('cpfCnpj', response?.account_data?.cpfCnpj ?? ''),
                    address: initialAddress,
                    addressNumber: normalizeAddressNumber(response?.account_data?.addressNumber),
                    complement: initialComplement,
                    province: initialProvince,
                    postalCode: applyFieldMask('postalCode', viaCepData?.postalCode || initialPostalCode),
                    city: initialCity,
                    state: initialState,
                    incomeValue: applyFieldMask('incomeValue', response?.account_data?.incomeValue ?? '1'),
                  },
                })
              );
            }
          }
        } catch (err) {
          if (!isActive) return;
          const message = err?.response?.data?.message || err?.message || 'Erro ao verificar conta digital';
          setStatusError(message);
        } finally {
          if (isActive) {
            setLoadingStatus(false);
          }
        }
      };

      void loadAccountStatus();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const mockAccount = useMemo(
    () => ({
      availableBalance: 3250.8,
      pendingBalance: 450,
      lastUpdate: 'Atualizado há 2 min',
      transactions: [
        {
          id: 'tx-1',
          client: 'Ana Silva',
          service: 'Limpeza completa',
          amount: 180,
          status: 'Recebido',
          date: 'Hoje, 14:30',
        },
        {
          id: 'tx-2',
          client: 'Carlos Mendes',
          service: 'Limpeza rapida',
          amount: 120,
          status: 'Pendente',
          date: 'Ontem, 10:15',
        },
        {
          id: 'tx-3',
          client: 'Mariana Costa',
          service: 'Limpeza pesada',
          amount: 250,
          status: 'Recebido',
          date: '19 fev, 16:45',
        },
      ],
    }),
    []
  );

  const quickActions = [
    {
      key: 'statement',
      title: 'Ver extrato',
      subtitle: 'Histórico completo da conta',
      icon: <Feather name="file-text" size={22} color="#7C3AED" />,
      iconBg: '#F3E8FF',
      onPress: () => navigation.navigate('TransactionHistory'),
    },
    {
      key: 'details',
      title: 'Dados da conta',
      subtitle: 'Agência, conta e status',
      icon: <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#15803D" />,
      iconBg: '#EAF8EF',
      onPress: () => navigation.navigate('AccountDetails'),
    },
  ];

  const featureCards = [
    {
      key: 'card',
      title: 'Cartão PagClin',
      subtitle: 'Use seu saldo para pagar',
      icon: <Feather name="credit-card" size={26} color="#FFFFFF" />,
      backgroundColor: '#7C3AED',
      onPress: () => navigation.navigate('AccountActivation'),
    },
    {
      key: 'bill',
      title: 'Pagar boleto',
      subtitle: 'Quite suas contas por aqui',
      icon: <Feather name="file-text" size={26} color="#FFFFFF" />,
      backgroundColor: '#EA6A1F',
      onPress: () => navigation.navigate('TransactionHistory'),
    },
  ];

  const activeStep = accountCreationSteps[currentStep];
  const stepProgress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const selectedPhoneCountry = phoneCountries.find((item) => item.code === selectedPhoneCountryCode) || phoneCountries[0];
  const requiredFieldsForCurrentStep = stepRequiredFields[currentStep] || [];
  const nameHasError = currentStep === 0 && !hasFirstAndLastName(accountForm.name || '');
  const emailHasError = currentStep === 1 && !isValidEmail(accountForm.email || '');
  const mobilePhoneHasError = currentStep === 1 && !isValidBrazilPhone(accountForm.mobilePhone || '');
  const cpfCnpjHasError = currentStep === 2 && !isValidCpfCnpj(accountForm.cpfCnpj || '');
  const incomeValueHasError = currentStep === 4 && parseCurrencyValue(accountForm.incomeValue || '0') < 1;
  const hasResolvedAddressDraft =
    getDigits(accountForm.postalCode || '').length === 8 && Boolean(accountForm.address || accountForm.province);
  const addressFieldsLocked = currentStep === 3 && !(postalCodeResolved || hasResolvedAddressDraft);
  const canContinueCurrentStep =
    requiredFieldsForCurrentStep.every((field) => String(accountForm[field] ?? '').trim().length > 0) &&
    !nameHasError &&
    !emailHasError &&
    !mobilePhoneHasError &&
    !cpfCnpjHasError &&
    !incomeValueHasError &&
    !(currentStep === 3 && addressFieldsLocked);
  const reviewSections = useMemo(() => buildReviewSections(accountForm), [accountForm]);

  const handlePostalCodeLookup = useCallback(
    async (value) => {
      const maskedPostalCode = applyFieldMask('postalCode', value);
      dispatch(
        updateDigitalAccountField({
          field: 'postalCode',
          value: maskedPostalCode,
        })
      );

      setPostalCodeLookupError(null);
      setPostalCodeResolved(false);

      if (getDigits(maskedPostalCode).length !== 8) {
        dispatch(
          updateDigitalAccountField({
            field: 'address',
            value: '',
          })
        );
        dispatch(
          updateDigitalAccountField({
            field: 'province',
            value: '',
          })
        );
        dispatch(
          updateDigitalAccountField({
            field: 'complement',
            value: '',
          })
        );
        dispatch(
          updateDigitalAccountField({
            field: 'city',
            value: '',
          })
        );
        dispatch(
          updateDigitalAccountField({
            field: 'state',
            value: '',
          })
        );
        return;
      }

      setPostalCodeLookupLoading(true);

      try {
        const response = await getAddressByPostalCode(maskedPostalCode);
        dispatch(
          updateDigitalAccountField({
            field: 'postalCode',
            value: applyFieldMask('postalCode', response.postalCode || maskedPostalCode),
          })
        );
        dispatch(
          updateDigitalAccountField({
            field: 'address',
            value: response.address || '',
          })
        );
        dispatch(
          updateDigitalAccountField({
            field: 'province',
            value: response.province || '',
          })
        );
        dispatch(
          updateDigitalAccountField({
            field: 'complement',
            value: response.complement || '',
          })
        );
        dispatch(
          updateDigitalAccountField({
            field: 'city',
            value: response.city || '',
          })
        );
        dispatch(
          updateDigitalAccountField({
            field: 'state',
            value: response.state || '',
          })
        );
        setPostalCodeResolved(true);
      } catch (err) {
        setPostalCodeLookupError(err?.message || 'Não foi possível buscar o CEP.');
      } finally {
        setPostalCodeLookupLoading(false);
      }
    },
    [dispatch]
  );

  const handleSubmitCurrentStep = useCallback(async () => {
    if (!canContinueCurrentStep || submittingStep) {
      return;
    }

    setSubmitError(null);
    setSubmittingStep(true);

    try {
      if (isLastStep) {
        await createAccount();
      } else {
        const payload = buildAccountDataPayload(accountForm, stepPayloadFields[currentStep] || []);
        await updateAccountData(payload);
        animateToStep(currentStep + 1);
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Não foi possível salvar esta etapa.';
      setSubmitError(message);
    } finally {
      setSubmittingStep(false);
    }
  }, [accountForm, animateToStep, canContinueCurrentStep, currentStep, isLastStep, submittingStep]);

  const groupedFields = useMemo(() => {
    const groups = [];

    activeStep.fields.forEach((field) => {
      const previousGroup = groups[groups.length - 1];
      if (field.widthRatio && previousGroup?.length === 1 && previousGroup[0]?.widthRatio) {
        previousGroup.push(field);
        return;
      }

      groups.push([field]);
    });

    return groups;
  }, [activeStep.fields]);

  const animateToStep = useCallback(
    (nextStep) => {
      if (nextStep < 0 || nextStep >= TOTAL_STEPS || nextStep === currentStep) {
        return;
      }

        const direction = nextStep > currentStep ? 1 : -1;

      Animated.timing(stepAnimation, {
        toValue: direction,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        dispatch(setDigitalAccountStep(nextStep));
        stepAnimation.setValue(-direction);

        Animated.timing(stepAnimation, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    },
    [currentStep, dispatch, stepAnimation]
  );

  const stepTranslateX = stepAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-42, 0, 42],
  });

  const stepOpacity = stepAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.35, 1, 0.35],
  });

  if (loadingStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Verificando conta digital...</Text>
      </View>
    );
  }

  if (!loadingStatus && !statusError && accountStatus?.has_account === false) {
    return (
      <KeyboardAvoidingView
        style={styles.emptyAccountContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AppScreenHeader
          title="Criar Conta Digital"
          subtitle={accountStatus?.message || 'Preencha seus dados para continuar'}
          onBack={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <AppCard style={styles.stepSummaryCard}>
            <View style={styles.stepSummaryTop}>
              <Text style={styles.stepBadge}>Etapa {currentStep + 1} de {TOTAL_STEPS}</Text>
              <Text style={styles.stepTitle}>{activeStep.title}</Text>
            </View>
            <Text style={styles.stepDescription}>{activeStep.description}</Text>
            <ProgressBar value={stepProgress} style={styles.stepProgress} />
          </AppCard>

          <Animated.View
            style={[
              styles.stepFieldsWrap,
              {
                opacity: stepOpacity,
                transform: [{ translateX: stepTranslateX }],
              },
            ]}
          >
            {currentStep === TOTAL_STEPS - 1 ? (
              <View style={styles.reviewWrap}>
                {reviewSections.map((section) => (
                  <AppCard key={section.title} style={styles.reviewCard}>
                    <Text style={styles.reviewTitle}>{section.title}</Text>
                    {section.items.map((item) => (
                      <View key={`${section.title}-${item.label}`} style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>{item.label}</Text>
                        <Text style={styles.reviewValue}>{item.value}</Text>
                      </View>
                    ))}
                  </AppCard>
                ))}
              </View>
            ) : groupedFields.map((fieldGroup) => (
              <View key={fieldGroup.map((field) => field.key).join('-')} style={styles.fieldRow}>
                {fieldGroup.map((field) => (
                  <View
                    key={field.key}
                    style={[
                      styles.fieldBlock,
                      fieldGroup.length === 1 && styles.fieldBlockFull,
                      fieldGroup.length > 1 && { flex: field.widthRatio || 1 },
                    ]}
                  >
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    {field.key === 'mobilePhone' ? (
                      <View>
                        <View style={styles.phoneInputRow}>
                          <Pressable
                            onPress={() => setShowPhoneCountrySelect((prev) => !prev)}
                            style={styles.phoneCountryButton}
                          >
                            <CountryFlag isoCode={selectedPhoneCountry.code.toLowerCase()} size={16} />
                            <Text style={styles.phoneCountryDial}>{selectedPhoneCountry.dialCode}</Text>
                            <Feather name={showPhoneCountrySelect ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
                          </Pressable>

                          <TextInput
                            value={accountForm[field.key]}
                            onChangeText={(value) =>
                              dispatch(
                                updateDigitalAccountField({
                                  field: field.key,
                                  value: applyFieldMask(field.key, value, { phoneCountryCode: selectedPhoneCountryCode }),
                                })
                              )
                            }
                            placeholder={field.placeholder}
                            placeholderTextColor={colors.mutedForeground}
                            autoCapitalize={field.autoCapitalize || 'sentences'}
                            keyboardType={field.keyboardType || 'default'}
                            style={[styles.formInput, styles.phoneNumberInput, mobilePhoneHasError && styles.formInputError]}
                          />
                        </View>

                        {showPhoneCountrySelect ? (
                          <View style={styles.phoneCountryList}>
                            {phoneCountries.map((country) => (
                              <Pressable
                                key={country.code}
                                onPress={() => {
                                  dispatch(setDigitalAccountPhoneCountry(country.code));
                                  setShowPhoneCountrySelect(false);
                                  dispatch(
                                    updateDigitalAccountField({
                                      field: 'mobilePhone',
                                      value: applyFieldMask('mobilePhone', accountForm.mobilePhone, {
                                        phoneCountryCode: country.code,
                                        normalizeBrazilInput: true,
                                      }),
                                    })
                                  );
                                }}
                                style={styles.phoneCountryOption}
                              >
                                <View style={styles.phoneCountryOptionLeft}>
                                  <CountryFlag isoCode={country.code.toLowerCase()} size={16} />
                                  <Text style={styles.phoneCountryOptionLabel}>{country.label}</Text>
                                </View>
                                <Text style={styles.phoneCountryOptionDial}>{country.dialCode}</Text>
                              </Pressable>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    ) : field.key === 'postalCode' ? (
                      <View>
                        <TextInput
                          value={accountForm[field.key]}
                          onChangeText={handlePostalCodeLookup}
                          placeholder={field.placeholder}
                          placeholderTextColor={colors.mutedForeground}
                          autoCapitalize={field.autoCapitalize || 'sentences'}
                          keyboardType={field.keyboardType || 'default'}
                          style={styles.formInput}
                        />
                        {postalCodeLookupLoading ? (
                          <Text style={styles.fieldHelperText}>Buscando endereço pelo CEP...</Text>
                        ) : null}
                        {!postalCodeLookupLoading && !postalCodeLookupError && !postalCodeResolved ? (
                          <Text style={styles.fieldHelperText}>Digite o CEP para liberar os demais campos.</Text>
                        ) : null}
                        {postalCodeLookupError ? (
                          <Text style={styles.fieldErrorText}>{postalCodeLookupError}</Text>
                        ) : null}
                      </View>
                    ) : (
                      <TextInput
                        value={accountForm[field.key]}
                        onChangeText={(value) =>
                          dispatch(
                            updateDigitalAccountField({
                              field: field.key,
                              value: applyFieldMask(field.key, value),
                            })
                          )
                        }
                        placeholder={field.placeholder}
                        placeholderTextColor={colors.mutedForeground}
                        autoCapitalize={field.autoCapitalize || 'sentences'}
                        keyboardType={field.keyboardType || 'default'}
                        style={[
                          styles.formInput,
                          currentStep === 3 && field.key !== 'postalCode' && addressFieldsLocked && styles.formInputDisabled,
                          field.key === 'name' && nameHasError && styles.formInputError,
                          field.key === 'email' && emailHasError && styles.formInputError,
                          field.key === 'cpfCnpj' && cpfCnpjHasError && styles.formInputError,
                          field.key === 'incomeValue' && incomeValueHasError && styles.formInputError,
                        ]}
                        editable={!(currentStep === 3 && field.key !== 'postalCode' && addressFieldsLocked)}
                      />
                    )}
                    {field.key === 'name' && nameHasError ? (
                      <Text style={styles.fieldErrorText}>Informe nome e sobrenome.</Text>
                    ) : null}
                    {field.key === 'email' && emailHasError ? (
                      <Text style={styles.fieldErrorText}>Informe um e-mail válido.</Text>
                    ) : null}
                    {field.key === 'mobilePhone' && mobilePhoneHasError ? (
                      <Text style={styles.fieldErrorText}>Informe um celular com 11 dígitos.</Text>
                    ) : null}
                    {field.key === 'cpfCnpj' && cpfCnpjHasError ? (
                      <Text style={styles.fieldErrorText}>Informe um CPF ou CNPJ válido.</Text>
                    ) : null}
                    {field.key === 'incomeValue' && incomeValueHasError ? (
                      <Text style={styles.fieldErrorText}>Informe uma renda mínima de 1,00.</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ))}
          </Animated.View>
        </ScrollView>

        <View style={styles.formFooter}>
          {submitError ? <Text style={styles.submitErrorText}>{submitError}</Text> : null}
          <View style={styles.formActionsRow}>
            <AppButton
              title="Voltar"
              variant="ghost"
              onPress={() => animateToStep(currentStep - 1)}
              disabled={currentStep === 0 || submittingStep}
              style={styles.secondaryButton}
            />
            <AppButton
              title={submittingStep ? 'Salvando...' : isLastStep ? 'Concluir' : 'Continuar'}
              disabled={!canContinueCurrentStep || submittingStep}
              onPress={handleSubmitCurrentStep}
              style={styles.primaryButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <AppScreenHeader
        title="Conta Digital"
        subtitle="Movimente seu saldo e acompanhe seus recebimentos"
        onBack={() => navigation.goBack()}
        rightContent={
          <HeaderActionButton onPress={() => navigation.navigate('AccountDetails')} icon="settings" />
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceTitleWrap}>
              <View style={styles.balanceIconWrap}>
                <Feather name="credit-card" size={18} color={colors.primary} />
              </View>
              <Text style={styles.balanceTitle}>Saldo disponível</Text>
            </View>

            <Pressable onPress={() => setBalanceVisible((value) => !value)} style={styles.eyeButton}>
              <Feather name={balanceVisible ? 'eye-off' : 'eye'} size={16} color={colors.cardForeground} />
            </Pressable>
          </View>

          <Text style={styles.balanceValue}>{formatCurrency(mockAccount.availableBalance, !balanceVisible)}</Text>

          <View style={styles.balanceMetaRow}>
            <Feather name="refresh-cw" size={12} color={colors.mutedForeground} />
            <Text style={styles.balanceMetaText}>{mockAccount.lastUpdate}</Text>
          </View>

          <View style={styles.pendingCard}>
            <View>
              <Text style={styles.pendingLabel}>Saldo pendente</Text>
              <Text style={styles.pendingValue}>{formatCurrency(mockAccount.pendingBalance, !balanceVisible)}</Text>
              <Text style={styles.pendingDescription}>Pagamentos aguardando confirmação</Text>
            </View>
            <Text style={styles.pendingEmoji}>⏳</Text>
          </View>
        </View>

        <Pressable style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed]} onPress={() => navigation.navigate('TransferMoney')}>
          <Feather name="arrow-up-right" size={18} color="#FFFFFF" />
          <Text style={styles.primaryActionText}>Transferir</Text>
        </Pressable>

        <View style={styles.quickActionGrid}>
          {quickActions.map((item) => (
            <Pressable key={item.key} style={({ pressed }) => [styles.quickActionCard, pressed && styles.quickActionPressed]} onPress={item.onPress}>
              <View style={[styles.quickActionIconWrap, { backgroundColor: item.iconBg }]}>{item.icon}</View>
              <Text style={styles.quickActionTitle}>{item.title}</Text>
              <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        {featureCards.map((item) => (
          <Pressable
            key={item.key}
            style={({ pressed }) => [styles.featureCard, { backgroundColor: item.backgroundColor }, pressed && styles.featureCardPressed]}
            onPress={item.onPress}
          >
            <View style={styles.featureContent}>
              <View style={styles.featureIconWrap}>{item.icon}</View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Feather name="arrow-up-right" size={18} color="rgba(255,255,255,0.82)" />
          </Pressable>
        ))}

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Transações recentes</Text>
          <Pressable onPress={() => navigation.navigate('TransactionHistory')} style={styles.inlineAction}>
            <Text style={styles.inlineActionText}>Ver todas</Text>
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </Pressable>
        </View>

        {mockAccount.transactions.map((transaction) => {
          const isReceived = transaction.status === 'Recebido';

          return (
            <AppCard key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionTopRow}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionClient}>{transaction.client}</Text>
                  <Text style={styles.transactionService}>{transaction.service}</Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>{formatCurrency(transaction.amount, false)}</Text>
                  <Badge text={transaction.status} tone={isReceived ? 'success' : 'default'} />
                </View>
              </View>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </AppCard>
          );
        })}

        <View style={styles.securityCard}>
          <Text style={styles.securityEmoji}>🔒</Text>
          <View style={styles.securityTextWrap}>
            <Text style={styles.securityTitle}>Seus dados estão seguros</Text>
            <Text style={styles.securityDescription}>
              Usamos proteção e criptografia para manter seu dinheiro e suas informações protegidos.
            </Text>
            <ProgressBar value={100} style={styles.securityProgress} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  emptyAccountContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formContent: {
    padding: 16,
    paddingBottom: 24,
  },
  stepSummaryCard: {
    borderWidth: 3,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  stepSummaryTop: {
    gap: 2,
    marginBottom: 6,
  },
  stepBadge: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  stepTitle: {
    color: colors.cardForeground,
    fontSize: 18,
    fontWeight: '800',
  },
  stepDescription: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 16,
  },
  stepProgress: {
    marginTop: 10,
    height: 5,
  },
  fieldBlock: {
    marginBottom: 12,
  },
  fieldBlockFull: {
    flex: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewWrap: {
    gap: 12,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  reviewTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  reviewRow: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 2,
  },
  reviewLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewValue: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  stepFieldsWrap: {
    minHeight: 320,
  },
  fieldLabel: {
    color: colors.cardForeground,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  formInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    color: colors.cardForeground,
    fontSize: 15,
  },
  formInputError: {
    borderColor: colors.danger,
  },
  fieldErrorText: {
    marginTop: 6,
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  fieldHelperText: {
    marginTop: 6,
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: '500',
  },
  formInputDisabled: {
    backgroundColor: '#F4F6F8',
    color: colors.mutedForeground,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneCountryButton: {
    minHeight: 48,
    width: 124,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  phoneCountryDial: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    minWidth: 36,
  },
  phoneNumberInput: {
    flex: 1,
  },
  phoneCountryList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  phoneCountryOption: {
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  phoneCountryOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneCountryOptionLabel: {
    color: colors.cardForeground,
    fontSize: 14,
  },
  phoneCountryOptionDial: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: '700',
  },
  formFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitErrorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  formActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    shadowColor: '#1A3E70',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  balanceTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(31,128,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceTitle: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontWeight: '600',
  },
  eyeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceValue: {
    color: colors.cardForeground,
    fontSize: 38,
    fontWeight: '800',
  },
  balanceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  balanceMetaText: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  pendingCard: {
    marginTop: 20,
    backgroundColor: '#EAF3FF',
    borderWidth: 1,
    borderColor: '#CFE2FF',
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pendingLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: 4,
  },
  pendingValue: {
    color: '#1D4ED8',
    fontSize: 22,
    fontWeight: '800',
  },
  pendingDescription: {
    marginTop: 4,
    color: colors.mutedForeground,
    fontSize: 12,
  },
  pendingEmoji: {
    fontSize: 26,
  },
  primaryAction: {
    marginBottom: 12,
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionPressed: {
    opacity: 0.92,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  quickActionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  quickActionPressed: {
    opacity: 0.92,
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  quickActionSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  featureCard: {
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureCardPressed: {
    opacity: 0.94,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  featureIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  featureSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    marginTop: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    color: colors.cardForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineActionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  transactionCard: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionClient: {
    color: colors.cardForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  transactionService: {
    marginTop: 3,
    color: colors.mutedForeground,
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  transactionAmount: {
    color: '#15803D',
    fontSize: 18,
    fontWeight: '800',
  },
  transactionDate: {
    marginTop: 10,
    color: colors.mutedForeground,
    fontSize: 12,
  },
  securityCard: {
    marginTop: 8,
    backgroundColor: '#EAF3FF',
    borderWidth: 1,
    borderColor: '#CFE2FF',
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  securityEmoji: {
    fontSize: 24,
  },
  securityTextWrap: {
    flex: 1,
  },
  securityTitle: {
    color: colors.cardForeground,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
  securityDescription: {
    marginTop: 4,
    color: colors.mutedForeground,
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
  },
  securityProgress: {
    marginTop: 10,
    height: 6,
  },
});
