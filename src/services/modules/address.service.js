import axios from 'axios';

export const getAddressByPostalCode = async (postalCode) => {
  const digits = String(postalCode || '').replace(/\D/g, '');
  const { data } = await axios.get(`https://viacep.com.br/ws/${digits}/json/`, {
    timeout: 10000,
  });

  if (data?.erro) {
    throw new Error('CEP não encontrado.');
  }

  return {
    postalCode: data?.cep || '',
    address: data?.logradouro || '',
    complement: data?.complemento || '',
    province: data?.bairro || '',
    city: data?.localidade || '',
    state: data?.uf || '',
  };
};
