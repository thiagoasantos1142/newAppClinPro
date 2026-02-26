import api from '../api';

const isAccessExpiredResponse = (value) => {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'status' in value &&
      value.status === false
  );
};

export const getProfile = async () => {
  const { data } = await api.get('/clinpro/profile');
  if (isAccessExpiredResponse(data)) {
    const error = new Error(data.message || 'Seu acesso a Clin Pro expirou.');
    error.response = { data };
    throw error;
  }
  return normalizeProfile(data);
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/clinpro/profile', payload);
  return normalizeProfile(data);
};

function normalizeProfile(data) {
  if (!data || typeof data !== 'object') return data;

  const user = data.user && typeof data.user === 'object' ? data.user : {};
  const contactInfo = data.contact_info && typeof data.contact_info === 'object' ? data.contact_info : {};
  const address = data.address && typeof data.address === 'object' ? data.address : null;

  return {
    ...data,
    user,
    contact_info: contactInfo,
    address,
    name: data.name ?? user.name ?? null,
    email: data.email ?? contactInfo.email ?? user.email ?? null,
    phone: data.phone ?? contactInfo.phone ?? user.phone ?? null,
    region: data.region ?? address?.city_id?.title ?? null,
    full_address: data.full_address ?? formatAddressBR(address),
  };
}

function formatAddressBR(address) {
  if (!address || typeof address !== 'object') return null;

  const street = address.street ? String(address.street).trim() : '';
  const number = address.number != null ? String(address.number).trim() : '';
  const neighborhood =
    address.neighborhood_id?.title || (address.neighborhood ? String(address.neighborhood).trim() : '');
  const city = address.city_id?.title || '';
  const state =
    address.city_id?.state?.uf ||
    address.city_id?.state?.code ||
    address.city_id?.state_id?.uf ||
    address.state?.uf ||
    address.state?.code ||
    '';
  const zipDigits = String(address.zip || '').replace(/\D/g, '');
  const zip = zipDigits.length === 8 ? `${zipDigits.slice(0, 5)}-${zipDigits.slice(5)}` : String(address.zip || '').trim();
  const country = address.country?.name || address.country || 'Brasil';

  const first = [street, number].filter(Boolean).join(', ');
  const second = neighborhood;
  const cityState = [city, state].filter(Boolean).join(' - ');
  const parts = [first, second, cityState, zip, country].filter(Boolean);

  return parts.length ? parts.join(', ') : null;
}
