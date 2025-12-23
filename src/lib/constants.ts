// Fixed zone radius for Tbilisi in kilometers
export const TBILISI_FIXED_ZONE_KM = 35;

// Price structure type
export interface PriceInfo {
  customerPrice: number;
  driverPrice: number;
  profit: number;
  perKm: number;
}

// Cargo vehicle prices
export const CARGO_PRICES: Record<string, PriceInfo> = {
  S: {
    customerPrice: 35,
    driverPrice: 25,
    profit: 10,
    perKm: 1.00,
  },
  M: {
    customerPrice: 50,
    driverPrice: 40,
    profit: 10,
    perKm: 1.30,
  },
  L: {
    customerPrice: 60,
    driverPrice: 50,
    profit: 10,
    perKm: 1.45,
  },
  XL: {
    customerPrice: 120,
    driverPrice: 100,
    profit: 20,
    perKm: 2.40,
  },
  CONSTRUCTION: {
    customerPrice: 120,
    driverPrice: 100,
    profit: 20,
    perKm: 2.50,
  },
};

// Evacuator vehicle prices
export const EVACUATOR_PRICES: Record<string, PriceInfo> = {
  LIGHT: {
    customerPrice: 80,
    driverPrice: 70,
    profit: 10,
    perKm: 2.30,
  },
  JEEP: {
    customerPrice: 90,
    driverPrice: 80,
    profit: 10,
    perKm: 2.50,
  },
  MINIBUS: {
    customerPrice: 100,
    driverPrice: 90,
    profit: 10,
    perKm: 2.70,
  },
  SPIDER: {
    customerPrice: 130,
    driverPrice: 120,
    profit: 10,
    perKm: 2.80,
  },
  OVERSIZED: {
    customerPrice: 350,
    driverPrice: 300,
    profit: 50,
    perKm: 10.00,
  },
};
