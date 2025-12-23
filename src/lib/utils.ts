import { ServiceType, CargoSize, EvacuatorType } from './types';
import { CARGO_PRICES, EVACUATOR_PRICES, TBILISI_FIXED_ZONE_KM } from './constants';

interface PriceResult {
  customerPrice: number;
  driverPrice: number;
  profit: number;
}

export function calculatePrice(
  serviceType: ServiceType,
  subType: CargoSize | EvacuatorType,
  distanceKm: number
): PriceResult {
  const prices = serviceType === 'cargo' ? CARGO_PRICES : EVACUATOR_PRICES;
  const priceInfo = prices[subType];

  if (!priceInfo) {
    throw new Error(`Unknown subType: ${subType}`);
  }

  // Fixed price for distances within Tbilisi zone
  if (distanceKm <= TBILISI_FIXED_ZONE_KM) {
    return {
      customerPrice: priceInfo.customerPrice,
      driverPrice: priceInfo.driverPrice,
      profit: priceInfo.profit,
    };
  }

  // Add per-km charge for distances beyond fixed zone
  const extraKm = distanceKm - TBILISI_FIXED_ZONE_KM;
  const extraCharge = extraKm * priceInfo.perKm;

  return {
    customerPrice: Math.round(priceInfo.customerPrice + extraCharge),
    driverPrice: Math.round(priceInfo.driverPrice + extraCharge),
    profit: priceInfo.profit,
  };
}

export function formatPrice(amount: number): string {
  return `${amount}₾`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
