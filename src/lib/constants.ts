// Fixed zone radius for Tbilisi in kilometers
export const TBILISI_FIXED_ZONE_KM = 35;

// Price structure type
export interface PriceInfo {
  customerPrice: number;
  driverPrice: number;
  profit: number;
  perKm: number;
  perKmProfit: number;
}

// Cargo vehicle prices
export const CARGO_PRICES: Record<string, PriceInfo> = {
  S: {
    customerPrice: 35,
    driverPrice: 25,
    profit: 10,
    perKm: 1.00,
    perKmProfit: 0.3,
  },
  M: {
    customerPrice: 50,
    driverPrice: 40,
    profit: 10,
    perKm: 1.30,
    perKmProfit: 0.4,
  },
  L: {
    customerPrice: 60,
    driverPrice: 50,
    profit: 10,
    perKm: 1.45,
    perKmProfit: 0.45,
  },
  XL: {
    customerPrice: 120,
    driverPrice: 100,
    profit: 20,
    perKm: 2.40,
    perKmProfit: 0.7,
  },
  CONSTRUCTION: {
    customerPrice: 120,
    driverPrice: 100,
    profit: 20,
    perKm: 2.50,
    perKmProfit: 0.8,
  },
};

// Legacy Evacuator vehicle prices (kept for backward compatibility)
export const EVACUATOR_PRICES: Record<string, PriceInfo> = {
  LIGHT: {
    customerPrice: 80,
    driverPrice: 70,
    profit: 10,
    perKm: 2.30,
    perKmProfit: 0.5,
  },
  JEEP: {
    customerPrice: 90,
    driverPrice: 80,
    profit: 10,
    perKm: 2.50,
    perKmProfit: 0.5,
  },
  MINIBUS: {
    customerPrice: 100,
    driverPrice: 90,
    profit: 10,
    perKm: 2.70,
    perKmProfit: 0.5,
  },
  SPIDER: {
    customerPrice: 130,
    driverPrice: 120,
    profit: 10,
    perKm: 2.80,
    perKmProfit: 0.6,
  },
  OVERSIZED: {
    customerPrice: 350,
    driverPrice: 300,
    profit: 50,
    perKm: 10.00,
    perKmProfit: 2.0,
  },
};

// Service Vehicle Type prices (based on what evacuator is needed)
export const SERVICE_VEHICLE_PRICES: Record<string, PriceInfo> = {
  STANDARD: {
    customerPrice: 80,
    driverPrice: 70,
    profit: 10,
    perKm: 2.30,
    perKmProfit: 0.5,
  },
  SPIDER: {
    customerPrice: 130,
    driverPrice: 120,
    profit: 10,
    perKm: 2.80,
    perKmProfit: 0.6,
  },
  LOWBOY: {
    customerPrice: 350,
    driverPrice: 300,
    profit: 50,
    perKm: 10.00,
    perKmProfit: 2.0,
  },
  HEAVY_MANIPULATOR: {
    customerPrice: 200,
    driverPrice: 180,
    profit: 20,
    perKm: 5.00,
    perKmProfit: 1.0,
  },
  LONG_BED: {
    customerPrice: 100,
    driverPrice: 90,
    profit: 10,
    perKm: 2.70,
    perKmProfit: 0.5,
  },
  MOTO_CARRIER: {
    customerPrice: 60,
    driverPrice: 50,
    profit: 10,
    perKm: 1.50,
    perKmProfit: 0.3,
  },
};
