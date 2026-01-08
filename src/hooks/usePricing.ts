'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ServiceType, CargoSize, EvacuatorType, ServiceVehicleType } from '@/lib/types';
import { CARGO_PRICES, EVACUATOR_PRICES, SERVICE_VEHICLE_PRICES, TBILISI_FIXED_ZONE_KM } from '@/lib/constants';

interface PriceConfig {
  customerPrice: number;
  driverPrice: number;
  perKm: number;
  perKmProfit: number;
}

interface PricingSettings {
  tbilisiFixedZoneKm: number;
  cargo: Record<string, PriceConfig>;
  evacuator: Record<string, PriceConfig>;
  serviceVehicle: Record<string, PriceConfig>;
}

interface PriceResult {
  customerPrice: number;
  driverPrice: number;
  profit: number;
}

interface DetailedPriceResult extends PriceResult {
  baseCustomerPrice: number;
  baseDriverPrice: number;
  baseProfit: number;
  extraKm: number;
  extraCustomerCharge: number;
  extraDriverCharge: number;
  extraProfit: number;
  isOverBase: boolean;
}

function getDefaultSettings(): PricingSettings {
  const cargoDefaults: Record<string, PriceConfig> = {};
  const evacuatorDefaults: Record<string, PriceConfig> = {};
  const serviceVehicleDefaults: Record<string, PriceConfig> = {};

  Object.entries(CARGO_PRICES).forEach(([key, value]) => {
    cargoDefaults[key] = {
      customerPrice: value.customerPrice,
      driverPrice: value.driverPrice,
      perKm: value.perKm,
      perKmProfit: value.perKmProfit,
    };
  });

  Object.entries(EVACUATOR_PRICES).forEach(([key, value]) => {
    evacuatorDefaults[key] = {
      customerPrice: value.customerPrice,
      driverPrice: value.driverPrice,
      perKm: value.perKm,
      perKmProfit: value.perKmProfit,
    };
  });

  Object.entries(SERVICE_VEHICLE_PRICES).forEach(([key, value]) => {
    serviceVehicleDefaults[key] = {
      customerPrice: value.customerPrice,
      driverPrice: value.driverPrice,
      perKm: value.perKm,
      perKmProfit: value.perKmProfit,
    };
  });

  return {
    tbilisiFixedZoneKm: TBILISI_FIXED_ZONE_KM,
    cargo: cargoDefaults,
    evacuator: evacuatorDefaults,
    serviceVehicle: serviceVehicleDefaults,
  };
}

export function usePricing() {
  const [settings, setSettings] = useState<PricingSettings>(getDefaultSettings());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'pricing'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as PricingSettings;
          const defaults = getDefaultSettings();
          setSettings({
            tbilisiFixedZoneKm: data.tbilisiFixedZoneKm ?? defaults.tbilisiFixedZoneKm,
            cargo: { ...defaults.cargo, ...data.cargo },
            evacuator: { ...defaults.evacuator, ...data.evacuator },
            serviceVehicle: { ...defaults.serviceVehicle, ...data.serviceVehicle },
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error listening to pricing settings:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const calculatePrice = useCallback(
    (
      serviceType: ServiceType,
      subType: CargoSize | EvacuatorType,
      distanceKm: number
    ): PriceResult => {
      const prices = serviceType === 'cargo' ? settings.cargo : settings.evacuator;
      const priceInfo = prices[subType];

      if (!priceInfo) {
        return { customerPrice: 0, driverPrice: 0, profit: 0 };
      }

      const baseProfit = priceInfo.customerPrice - priceInfo.driverPrice;

      if (distanceKm <= settings.tbilisiFixedZoneKm) {
        return {
          customerPrice: priceInfo.customerPrice,
          driverPrice: priceInfo.driverPrice,
          profit: baseProfit,
        };
      }

      const extraKm = distanceKm - settings.tbilisiFixedZoneKm;
      const extraCustomerCharge = extraKm * priceInfo.perKm;
      const extraProfit = extraKm * (priceInfo.perKmProfit || 0);
      const extraDriverCharge = extraCustomerCharge - extraProfit;

      return {
        customerPrice: Math.round(priceInfo.customerPrice + extraCustomerCharge),
        driverPrice: Math.round(priceInfo.driverPrice + extraDriverCharge),
        profit: Math.round(baseProfit + extraProfit),
      };
    },
    [settings]
  );

  const calculateServiceVehiclePrice = useCallback(
    (serviceVehicleType: ServiceVehicleType, distanceKm: number): PriceResult => {
      const priceInfo = settings.serviceVehicle[serviceVehicleType];

      if (!priceInfo) {
        return { customerPrice: 0, driverPrice: 0, profit: 0 };
      }

      const baseProfit = priceInfo.customerPrice - priceInfo.driverPrice;

      if (distanceKm <= settings.tbilisiFixedZoneKm) {
        return {
          customerPrice: priceInfo.customerPrice,
          driverPrice: priceInfo.driverPrice,
          profit: baseProfit,
        };
      }

      const extraKm = distanceKm - settings.tbilisiFixedZoneKm;
      const extraCustomerCharge = extraKm * priceInfo.perKm;
      const extraProfit = extraKm * (priceInfo.perKmProfit || 0);
      const extraDriverCharge = extraCustomerCharge - extraProfit;

      return {
        customerPrice: Math.round(priceInfo.customerPrice + extraCustomerCharge),
        driverPrice: Math.round(priceInfo.driverPrice + extraDriverCharge),
        profit: Math.round(baseProfit + extraProfit),
      };
    },
    [settings]
  );

  // Detailed price calculation for order details breakdown
  const calculateDetailedPrice = useCallback(
    (
      serviceType: ServiceType,
      subType: CargoSize | EvacuatorType | ServiceVehicleType,
      distanceKm: number,
      isServiceVehicle: boolean = false
    ): DetailedPriceResult => {
      const prices = isServiceVehicle
        ? settings.serviceVehicle
        : serviceType === 'cargo'
          ? settings.cargo
          : settings.evacuator;
      const priceInfo = prices[subType];

      if (!priceInfo) {
        return {
          customerPrice: 0,
          driverPrice: 0,
          profit: 0,
          baseCustomerPrice: 0,
          baseDriverPrice: 0,
          baseProfit: 0,
          extraKm: 0,
          extraCustomerCharge: 0,
          extraDriverCharge: 0,
          extraProfit: 0,
          isOverBase: false,
        };
      }

      const baseProfit = priceInfo.customerPrice - priceInfo.driverPrice;

      if (distanceKm <= settings.tbilisiFixedZoneKm) {
        return {
          customerPrice: priceInfo.customerPrice,
          driverPrice: priceInfo.driverPrice,
          profit: baseProfit,
          baseCustomerPrice: priceInfo.customerPrice,
          baseDriverPrice: priceInfo.driverPrice,
          baseProfit: baseProfit,
          extraKm: 0,
          extraCustomerCharge: 0,
          extraDriverCharge: 0,
          extraProfit: 0,
          isOverBase: false,
        };
      }

      const extraKm = distanceKm - settings.tbilisiFixedZoneKm;
      const extraCustomerCharge = extraKm * priceInfo.perKm;
      const extraProfit = extraKm * (priceInfo.perKmProfit || 0);
      const extraDriverCharge = extraCustomerCharge - extraProfit;

      return {
        customerPrice: Math.round(priceInfo.customerPrice + extraCustomerCharge),
        driverPrice: Math.round(priceInfo.driverPrice + extraDriverCharge),
        profit: Math.round(baseProfit + extraProfit),
        baseCustomerPrice: priceInfo.customerPrice,
        baseDriverPrice: priceInfo.driverPrice,
        baseProfit: baseProfit,
        extraKm: extraKm,
        extraCustomerCharge: Math.round(extraCustomerCharge),
        extraDriverCharge: Math.round(extraDriverCharge),
        extraProfit: Math.round(extraProfit),
        isOverBase: true,
      };
    },
    [settings]
  );

  return {
    settings,
    isLoading,
    calculatePrice,
    calculateServiceVehiclePrice,
    calculateDetailedPrice,
  };
}
