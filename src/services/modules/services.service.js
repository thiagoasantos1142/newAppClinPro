import api from '../api';

export const getAvailableServices = async (params = {}) => {
  const { data } = await api.get('/clinpro/services/available', { params });
  return normalizeAvailableServicesResponse(data);
};

export const getServiceById = async (id) => {
  const { data } = await api.get(`/clinpro/services/${id}`);
  return data;
};

export const acceptServiceById = async (id, payload = {}) => {
  const { data } = await api.post(`/clinpro/services/${id}/accept`, payload);
  return data;
};

export const getMyServices = async (params = {}) => {
  const { data } = await api.get('/clinpro/services/my', { params });
  return data;
};

export const getServiceHistory = async (params = {}) => {
  const { data } = await api.get('/clinpro/services/history', { params });
  return data;
};

export const updateServiceStatus = async (id, payload) => {
  const { data } = await api.patch(`/clinpro/services/${id}/status`, payload);
  return data;
};

function normalizeAvailableServicesResponse(data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const normalizedItems = items
    .map(normalizeAvailableServiceItem)
    .filter(Boolean);

  return {
    ...data,
    items: normalizedItems,
    pagination: data?.pagination || {
      page: 1,
      limit: normalizedItems.length,
      total: normalizedItems.length,
    },
  };
}

function normalizeAvailableServiceItem(service) {
  if (!service || typeof service !== 'object') return null;

  const slots = Array.isArray(service.slots) ? service.slots : [];
  const emptySlot = slots.find((slot) => slot && (slot.user_id == null));

  // Only list services that are actually available and still have a free slot.
  if (String(service.status || '').toLowerCase() !== 'available') return null;
  if (!emptySlot) return null;

  const slotValue = Number(emptySlot.value);
  const hasSlotValue = Number.isFinite(slotValue);

  return {
    ...service,
    slots,
    available_slot: emptySlot,
    available_slot_id: emptySlot.id ?? null,
    price_amount: hasSlotValue ? slotValue : service.price_amount,
    price_label: hasSlotValue ? formatCurrencyBRL(slotValue) : (service.price_label || 'R$ 0,00'),
  };
}

function formatCurrencyBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);
}
