import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ServiceType, CargoSize, EvacuatorType } from './types';
import { CARGO_PRICES, EVACUATOR_PRICES, TBILISI_FIXED_ZONE_KM } from './constants';

interface PriceConfig {
  customerPrice: number;
  driverPrice: number;
  perKm: number;
}

interface PricingSettings {
  tbilisiFixedZoneKm: number;
  cargo: Record<string, PriceConfig>;
  evacuator: Record<string, PriceConfig>;
}

interface PriceResult {
  customerPrice: number;
  driverPrice: number;
  profit: number;
}

// Cache for pricing settings
let cachedSettings: PricingSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get default settings from constants
function getDefaultSettings(): PricingSettings {
  const cargoDefaults: Record<string, PriceConfig> = {};
  const evacuatorDefaults: Record<string, PriceConfig> = {};

  Object.entries(CARGO_PRICES).forEach(([key, value]) => {
    cargoDefaults[key] = {
      customerPrice: value.customerPrice,
      driverPrice: value.driverPrice,
      perKm: value.perKm,
    };
  });

  Object.entries(EVACUATOR_PRICES).forEach(([key, value]) => {
    evacuatorDefaults[key] = {
      customerPrice: value.customerPrice,
      driverPrice: value.driverPrice,
      perKm: value.perKm,
    };
  });

  return {
    tbilisiFixedZoneKm: TBILISI_FIXED_ZONE_KM,
    cargo: cargoDefaults,
    evacuator: evacuatorDefaults,
  };
}

// Fetch pricing settings from Firestore with caching
export async function getPricingSettings(): Promise<PricingSettings> {
  const now = Date.now();

  // Return cached settings if still valid
  if (cachedSettings && now - cacheTimestamp < CACHE_DURATION) {
    return cachedSettings;
  }

  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'pricing'));

    if (settingsDoc.exists()) {
      const data = settingsDoc.data() as PricingSettings;
      const defaults = getDefaultSettings();

      // Merge with defaults to ensure all keys exist
      cachedSettings = {
        tbilisiFixedZoneKm: data.tbilisiFixedZoneKm ?? defaults.tbilisiFixedZoneKm,
        cargo: { ...defaults.cargo, ...data.cargo },
        evacuator: { ...defaults.evacuator, ...data.evacuator },
      };
    } else {
      cachedSettings = getDefaultSettings();
    }

    cacheTimestamp = now;
    return cachedSettings;
  } catch (error) {
    console.error('Error fetching pricing settings:', error);
    // Return defaults on error
    return getDefaultSettings();
  }
}

// Clear the cache (useful when settings are updated)
export function clearPricingCache(): void {
  cachedSettings = null;
  cacheTimestamp = 0;
}

// Calculate price using Firestore settings
export async function calculatePriceAsync(
  serviceType: ServiceType,
  subType: CargoSize | EvacuatorType,
  distanceKm: number
): Promise<PriceResult> {
  const settings = await getPricingSettings();
  const prices = serviceType === 'cargo' ? settings.cargo : settings.evacuator;
  const priceInfo = prices[subType];

  if (!priceInfo) {
    throw new Error(`Unknown subType: ${subType}`);
  }

  // Fixed price for distances within Tbilisi zone
  if (distanceKm <= settings.tbilisiFixedZoneKm) {
    return {
      customerPrice: priceInfo.customerPrice,
      driverPrice: priceInfo.driverPrice,
      profit: priceInfo.customerPrice - priceInfo.driverPrice,
    };
  }

  // Add per-km charge for distances beyond fixed zone
  const extraKm = distanceKm - settings.tbilisiFixedZoneKm;
  const extraCharge = extraKm * priceInfo.perKm;

  return {
    customerPrice: Math.round(priceInfo.customerPrice + extraCharge),
    driverPrice: Math.round(priceInfo.driverPrice + extraCharge),
    profit: priceInfo.customerPrice - priceInfo.driverPrice,
  };
}

// Synchronous version using cached settings (for React components)
export function calculatePriceSync(
  serviceType: ServiceType,
  subType: CargoSize | EvacuatorType,
  distanceKm: number,
  settings?: PricingSettings | null
): PriceResult {
  const effectiveSettings = settings || cachedSettings || getDefaultSettings();
  const prices = serviceType === 'cargo' ? effectiveSettings.cargo : effectiveSettings.evacuator;
  const priceInfo = prices[subType];

  if (!priceInfo) {
    // Fallback to defaults
    const defaults = getDefaultSettings();
    const defaultPrices = serviceType === 'cargo' ? defaults.cargo : defaults.evacuator;
    const defaultPriceInfo = defaultPrices[subType];

    if (!defaultPriceInfo) {
      return { customerPrice: 0, driverPrice: 0, profit: 0 };
    }

    return calculateWithPriceInfo(defaultPriceInfo, distanceKm, defaults.tbilisiFixedZoneKm);
  }

  return calculateWithPriceInfo(priceInfo, distanceKm, effectiveSettings.tbilisiFixedZoneKm);
}

function calculateWithPriceInfo(
  priceInfo: PriceConfig,
  distanceKm: number,
  fixedZoneKm: number
): PriceResult {
  if (distanceKm <= fixedZoneKm) {
    return {
      customerPrice: priceInfo.customerPrice,
      driverPrice: priceInfo.driverPrice,
      profit: priceInfo.customerPrice - priceInfo.driverPrice,
    };
  }

  const extraKm = distanceKm - fixedZoneKm;
  const extraCharge = extraKm * priceInfo.perKm;

  return {
    customerPrice: Math.round(priceInfo.customerPrice + extraCharge),
    driverPrice: Math.round(priceInfo.driverPrice + extraCharge),
    profit: priceInfo.customerPrice - priceInfo.driverPrice,
  };
}
