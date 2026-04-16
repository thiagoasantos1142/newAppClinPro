import api from '../api';

export const getAddressByPostalCode = async (postalCode) => {
  const digits = String(postalCode || '').replace(/\D/g, '');
  const { data } = await api.get(`/address/cep/${digits}`);
  const addressData = data?.data;

  if (!data?.success || !addressData) {
    throw new Error('CEP não encontrado.');
  }

  return {
    postalCode: addressData?.zip || '',
    address: addressData?.street || '',
    complement: addressData?.complement || '',
    province: addressData?.neighborhood || '',
    city: addressData?.city || '',
    state: addressData?.state || '',
  };
};
