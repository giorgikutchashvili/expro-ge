'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ServiceType, CargoSize, EvacuatorType } from '@/lib/types';
import { CARGO_PRICES, EVACUATOR_PRICES, TBILISI_FIXED_ZONE_KM } from '@/lib/constants';

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

      if (distanceKm <= settings.tbilisiFixedZoneKm) {
        return {
          customerPrice: priceInfo.customerPrice,
          driverPrice: priceInfo.driverPrice,
          profit: priceInfo.customerPrice - priceInfo.driverPrice,
        };
      }

      const extraKm = distanceKm - settings.tbilisiFixedZoneKm;
      const extraCharge = extraKm * priceInfo.perKm;

      return {
        customerPrice: Math.round(priceInfo.customerPrice + extraCharge),
        driverPrice: Math.round(priceInfo.driverPrice + extraCharge),
        profit: priceInfo.customerPrice - priceInfo.driverPrice,
      };
    },
    [settings]
  );

  return {
    settings,
    isLoading,
    calculatePrice,
  };
}
