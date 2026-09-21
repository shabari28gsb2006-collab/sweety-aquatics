import { ServiceablePincode } from '../types';

export interface ServiceabilityResult {
  isServiceable: boolean;
  isTamilNadu: boolean;
  pincode: string;
  message: string;
  pincodeData?: ServiceablePincode;
  estimatedDeliveryTime?: string;
  courier?: string;
}

type PincodeListener = (pincodes: ServiceablePincode[]) => void;
type Envelope<T> = { success: boolean; message?: string; data?: T };

type BackendPincode = {
  id: string;
  pincode: string;
  area?: string | null;
  city?: string | null;
  district: string;
  state: string;
  courierName?: string | null;
  stationCode?: string | null;
  isActive: boolean;
  estimatedDeliveryDays?: number | null;
  updatedAt?: string;
};

type PublicServiceability = {
  serviceable: boolean;
  pincode: string;
  area?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  courierName?: string | null;
  stationCode?: string | null;
  estimatedDeliveryDays?: number | null;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

function mapBackendPincode(row: BackendPincode): ServiceablePincode {
  const days = row.estimatedDeliveryDays ?? undefined;
  return {
    id: row.id,
    pincode: row.pincode,
    area: row.area || row.city || row.district,
    district: row.district,
    state: row.state,
    courier: row.courierName || 'Seller-selected courier',
    isActive: row.isActive,
    updatedDate: row.updatedAt ? row.updatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    estimatedDays: days ? `${days} Day${days === 1 ? '' : 's'}` : undefined,
  };
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as Envelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || `Request failed (${response.status})`);
  }
  return payload.data as T;
}

class ServiceabilityService {
  private pincodes: ServiceablePincode[] = [];
  private listeners = new Set<PincodeListener>();

  subscribe(listener: PincodeListener): () => void {
    this.listeners.add(listener);
    listener([...this.pincodes]);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const rows = [...this.pincodes];
    this.listeners.forEach((listener) => listener(rows));
  }

  getAllPincodes(): ServiceablePincode[] {
    return [...this.pincodes];
  }

  async loadAdminPincodes(): Promise<ServiceablePincode[]> {
    const rows = await apiRequest<BackendPincode[]>('/admin/serviceability');
    this.pincodes = rows.map(mapBackendPincode);
    this.notify();
    return [...this.pincodes];
  }

  async checkPincode(pincodeInput: string, stateInput = 'Tamil Nadu'): Promise<ServiceabilityResult> {
    const cleaned = pincodeInput.trim();
    if (!/^\d{6}$/.test(cleaned)) {
      return {
        isServiceable: false,
        isTamilNadu: false,
        pincode: cleaned,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      };
    }

    const state = (stateInput || '').trim().toLowerCase();
    if (state && state !== 'tn' && !state.includes('tamil nadu')) {
      return {
        isServiceable: false,
        isTamilNadu: false,
        pincode: cleaned,
        message: 'Delivery is currently available only within Tamil Nadu.',
      };
    }

    try {
      const result = await apiRequest<PublicServiceability>(`/serviceability/${cleaned}`);
      if (!result.serviceable) {
        return {
          isServiceable: false,
          isTamilNadu: true,
          pincode: cleaned,
          message: 'Sorry, delivery is currently unavailable for this PIN code.',
        };
      }

      const days = result.estimatedDeliveryDays ?? undefined;
      const pincodeData: ServiceablePincode = {
        id: `public-${cleaned}`,
        pincode: cleaned,
        area: result.area || result.city || result.district || 'Serviceable area',
        district: result.district || 'Tamil Nadu',
        state: result.state || 'Tamil Nadu',
        courier: result.courierName || 'Seller-selected courier',
        isActive: true,
        updatedDate: new Date().toISOString().slice(0, 10),
        estimatedDays: days ? `${days} Day${days === 1 ? '' : 's'}` : undefined,
      };

      return {
        isServiceable: true,
        isTamilNadu: true,
        pincode: cleaned,
        pincodeData,
        courier: pincodeData.courier,
        estimatedDeliveryTime: pincodeData.estimatedDays || 'Seller will confirm after packing',
        message: `Delivery is available to ${pincodeData.area}, ${pincodeData.district}${result.courierName ? ` via ${result.courierName}` : ''}.`,
      };
    } catch (error) {
      return {
        isServiceable: false,
        isTamilNadu: true,
        pincode: cleaned,
        message: error instanceof Error ? error.message : 'Unable to check delivery availability right now.',
      };
    }
  }

  async addPincode(data: Omit<ServiceablePincode, 'id' | 'updatedDate'>): Promise<ServiceablePincode> {
    const daysMatch = data.estimatedDays?.match(/\d+/);
    const created = await apiRequest<BackendPincode>('/admin/serviceability', {
      method: 'POST',
      body: JSON.stringify({
        pincode: data.pincode,
        area: data.area,
        city: data.area,
        district: data.district,
        state: 'Tamil Nadu',
        courierName: data.courier || null,
        isActive: data.isActive,
        estimatedDeliveryDays: daysMatch ? Number(daysMatch[0]) : null,
      }),
    });
    const mapped = mapBackendPincode(created);
    this.pincodes = [mapped, ...this.pincodes.filter((row) => row.id !== mapped.id)];
    this.notify();
    return mapped;
  }

  async toggleActive(id: string): Promise<boolean> {
    const current = this.pincodes.find((row) => row.id === id);
    if (!current) return false;
    const daysMatch = current.estimatedDays?.match(/\d+/);
    const updated = await apiRequest<BackendPincode>(`/admin/serviceability/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        pincode: current.pincode,
        area: current.area,
        city: current.area,
        district: current.district,
        state: 'Tamil Nadu',
        courierName: current.courier || null,
        isActive: !current.isActive,
        estimatedDeliveryDays: daysMatch ? Number(daysMatch[0]) : null,
      }),
    });
    const mapped = mapBackendPincode(updated);
    this.pincodes = this.pincodes.map((row) => (row.id === id ? mapped : row));
    this.notify();
    return true;
  }

  async updatePincode(id: string, data: Omit<ServiceablePincode, 'id' | 'updatedDate'>): Promise<ServiceablePincode> {
    const daysMatch = data.estimatedDays?.match(/\d+/);
    const updated = await apiRequest<BackendPincode>(`/admin/serviceability/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ pincode: data.pincode, area: data.area, city: data.area, district: data.district, state: 'Tamil Nadu', courierName: data.courier || null, isActive: data.isActive, estimatedDeliveryDays: daysMatch ? Number(daysMatch[0]) : null }),
    });
    const mapped = mapBackendPincode(updated);
    this.pincodes = this.pincodes.map((row) => row.id === id ? mapped : row);
    this.notify();
    return mapped;
  }

  async deletePincode(id: string): Promise<boolean> {
    await apiRequest(`/admin/serviceability/${id}`, { method: 'DELETE' });
    this.pincodes = this.pincodes.filter((row) => row.id !== id);
    this.notify();
    return true;
  }
}

export const serviceabilityService = new ServiceabilityService();
