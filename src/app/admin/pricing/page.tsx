'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CARGO_PRICES, SERVICE_VEHICLE_PRICES, CRANE_PRICES, TBILISI_FIXED_ZONE_KM } from '@/lib/constants';
import { SERVICE_VEHICLE_LABELS, CRANE_DURATION_LABELS, CRANE_FLOOR_LABELS, CraneDuration, CraneFloor } from '@/lib/types';
import {
  Save,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { CargoTruckIcon, TowTruckIcon } from '@/components/icons';

interface PriceConfig {
  customerPrice: number;
  driverPrice: number;
  perKm: number;
  perKmProfit: number;
}

interface CranePriceConfig {
  customerPrice: number;
  driverPrice: number;
}

interface CraneFloorSurcharge {
  surcharge: number;
  driverSurcharge: number;
}

interface PricingSettings {
  tbilisiFixedZoneKm: number;
  cargo: Record<string, PriceConfig>;
  serviceVehicle: Record<string, PriceConfig>;
  crane: Record<string, CranePriceConfig>;
  craneFloorSurcharges: Record<string, CraneFloorSurcharge>;
}

const cargoTypes = [
  { key: 'S', label: 'S - მცირე' },
  { key: 'M', label: 'M - საშუალო' },
  { key: 'L', label: 'L - დიდი' },
  { key: 'XL', label: 'XL - ძალიან დიდი' },
  { key: 'CONSTRUCTION', label: 'სამშენებლო' },
];

// Service vehicle types for evacuators
const serviceVehicleTypes = [
  { key: 'STANDARD', label: SERVICE_VEHICLE_LABELS.STANDARD },
  { key: 'SPIDER', label: SERVICE_VEHICLE_LABELS.SPIDER },
  { key: 'LOWBOY', label: SERVICE_VEHICLE_LABELS.LOWBOY },
  { key: 'HEAVY_MANIPULATOR', label: SERVICE_VEHICLE_LABELS.HEAVY_MANIPULATOR },
  { key: 'LONG_BED', label: SERVICE_VEHICLE_LABELS.LONG_BED },
  { key: 'MOTO_CARRIER', label: SERVICE_VEHICLE_LABELS.MOTO_CARRIER },
];

// Crane duration types
const craneDurationTypes: { key: CraneDuration; label: string }[] = [
  { key: 'ONE_TIME', label: CRANE_DURATION_LABELS.ONE_TIME },
  { key: 'HOURLY', label: CRANE_DURATION_LABELS.HOURLY },
  { key: 'FULL_DAY', label: CRANE_DURATION_LABELS.FULL_DAY },
];

// Crane floor surcharge types
const craneFloorTypes: { key: CraneFloor; label: string }[] = [
  { key: 'FLOOR_1_7', label: CRANE_FLOOR_LABELS.FLOOR_1_7.title },
  { key: 'FLOOR_8_11', label: CRANE_FLOOR_LABELS.FLOOR_8_11.title },
  { key: 'FLOOR_12_20', label: CRANE_FLOOR_LABELS.FLOOR_12_20.title },
];

// Crane lift icon
function CraneLiftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M8 7l4-4 4 4" />
      <path d="M8 17l4 4 4-4" />
      <rect x="4" y="9" width="16" height="6" rx="1" />
    </svg>
  );
}

const getDefaultSettings = (): PricingSettings => {
  const cargoDefaults: Record<string, PriceConfig> = {};
  const serviceVehicleDefaults: Record<string, PriceConfig> = {};
  const craneDefaults: Record<string, CranePriceConfig> = {};
  const craneFloorSurchargeDefaults: Record<string, CraneFloorSurcharge> = {};

  Object.entries(CARGO_PRICES).forEach(([key, value]) => {
    cargoDefaults[key] = {
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

  Object.entries(CRANE_PRICES).forEach(([key, value]) => {
    craneDefaults[key] = {
      customerPrice: value.customerPrice,
      driverPrice: value.driverPrice,
    };
  });

  // Floor surcharges with driver getting 70% of surcharge
  Object.entries(CRANE_FLOOR_LABELS).forEach(([key, value]) => {
    craneFloorSurchargeDefaults[key] = {
      surcharge: value.surcharge,
      driverSurcharge: Math.round(value.surcharge * 0.7),
    };
  });

  return {
    tbilisiFixedZoneKm: TBILISI_FIXED_ZONE_KM,
    cargo: cargoDefaults,
    serviceVehicle: serviceVehicleDefaults,
    crane: craneDefaults,
    craneFloorSurcharges: craneFloorSurchargeDefaults,
  };
};

export default function PricingPage() {
  const [settings, setSettings] = useState<PricingSettings>(getDefaultSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'pricing'));
        const defaults = getDefaultSettings();

        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as PricingSettings;

          // Helper to merge price configs, using default if Firestore value is 0 or missing
          const mergePrices = (
            defaultPrices: Record<string, PriceConfig>,
            firestorePrices: Record<string, PriceConfig> | undefined
          ): Record<string, PriceConfig> => {
            const result: Record<string, PriceConfig> = {};
            Object.keys(defaultPrices).forEach((key) => {
              const defaultConfig = defaultPrices[key];
              const firestoreConfig = firestorePrices?.[key];

              // Use Firestore value if it exists and is not 0, otherwise use default
              result[key] = {
                customerPrice:
                  firestoreConfig?.customerPrice && firestoreConfig.customerPrice > 0
                    ? firestoreConfig.customerPrice
                    : defaultConfig.customerPrice,
                driverPrice:
                  firestoreConfig?.driverPrice && firestoreConfig.driverPrice > 0
                    ? firestoreConfig.driverPrice
                    : defaultConfig.driverPrice,
                perKm:
                  firestoreConfig?.perKm && firestoreConfig.perKm > 0
                    ? firestoreConfig.perKm
                    : defaultConfig.perKm,
                perKmProfit:
                  firestoreConfig?.perKmProfit !== undefined && firestoreConfig.perKmProfit >= 0
                    ? firestoreConfig.perKmProfit
                    : defaultConfig.perKmProfit,
              };
            });
            return result;
          };

          // Helper to merge crane price configs
          const mergeCranePrices = (
            defaultPrices: Record<string, CranePriceConfig>,
            firestorePrices: Record<string, CranePriceConfig> | undefined
          ): Record<string, CranePriceConfig> => {
            const result: Record<string, CranePriceConfig> = {};
            Object.keys(defaultPrices).forEach((key) => {
              const defaultConfig = defaultPrices[key];
              const firestoreConfig = firestorePrices?.[key];

              result[key] = {
                customerPrice:
                  firestoreConfig?.customerPrice && firestoreConfig.customerPrice > 0
                    ? firestoreConfig.customerPrice
                    : defaultConfig.customerPrice,
                driverPrice:
                  firestoreConfig?.driverPrice && firestoreConfig.driverPrice > 0
                    ? firestoreConfig.driverPrice
                    : defaultConfig.driverPrice,
              };
            });
            return result;
          };

          // Helper to merge crane floor surcharges
          const mergeFloorSurcharges = (
            defaultSurcharges: Record<string, CraneFloorSurcharge>,
            firestoreSurcharges: Record<string, CraneFloorSurcharge> | undefined
          ): Record<string, CraneFloorSurcharge> => {
            const result: Record<string, CraneFloorSurcharge> = {};
            Object.keys(defaultSurcharges).forEach((key) => {
              const defaultConfig = defaultSurcharges[key];
              const firestoreConfig = firestoreSurcharges?.[key];

              result[key] = {
                surcharge:
                  firestoreConfig?.surcharge !== undefined
                    ? firestoreConfig.surcharge
                    : defaultConfig.surcharge,
                driverSurcharge:
                  firestoreConfig?.driverSurcharge !== undefined
                    ? firestoreConfig.driverSurcharge
                    : defaultConfig.driverSurcharge,
              };
            });
            return result;
          };

          setSettings({
            tbilisiFixedZoneKm: data.tbilisiFixedZoneKm || defaults.tbilisiFixedZoneKm,
            cargo: mergePrices(defaults.cargo, data.cargo),
            serviceVehicle: mergePrices(defaults.serviceVehicle, data.serviceVehicle),
            crane: mergeCranePrices(defaults.crane, data.crane),
            craneFloorSurcharges: mergeFloorSurcharges(defaults.craneFloorSurcharges, data.craneFloorSurcharges),
          });
        } else {
          // No Firestore data, use defaults
          setSettings(defaults);
        }
      } catch (error) {
        console.error('Error fetching pricing settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await setDoc(doc(db, 'settings', 'pricing'), settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving pricing settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(getDefaultSettings());
  };

  const updateCargoPrice = (key: string, field: keyof PriceConfig, value: number) => {
    setSettings((prev) => ({
      ...prev,
      cargo: {
        ...prev.cargo,
        [key]: {
          ...prev.cargo[key],
          [field]: value,
        },
      },
    }));
  };

  const updateServiceVehiclePrice = (key: string, field: keyof PriceConfig, value: number) => {
    setSettings((prev) => ({
      ...prev,
      serviceVehicle: {
        ...prev.serviceVehicle,
        [key]: {
          ...prev.serviceVehicle[key],
          [field]: value,
        },
      },
    }));
  };

  const updateCranePrice = (key: string, field: keyof CranePriceConfig, value: number) => {
    setSettings((prev) => ({
      ...prev,
      crane: {
        ...prev.crane,
        [key]: {
          ...prev.crane[key],
          [field]: value,
        },
      },
    }));
  };

  const updateCraneFloorSurcharge = (key: string, field: keyof CraneFloorSurcharge, value: number) => {
    setSettings((prev) => ({
      ...prev,
      craneFloorSurcharges: {
        ...prev.craneFloorSurcharges,
        [key]: {
          ...prev.craneFloorSurcharges[key],
          [field]: value,
        },
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">ფასების მართვა</h1>
          <p className="text-sm text-slate-400">დააყენეთ ფასები სერვისების მიხედვით</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 border border-[#475569] text-slate-400 hover:bg-[#334155] rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>აღდგენა</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              saveSuccess
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50`}
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{saveSuccess ? 'შენახულია!' : 'შენახვა'}</span>
          </button>
        </div>
      </div>

      {/* Fixed Zone Setting */}
      <div className="bg-[#1E293B] rounded-xl p-6 shadow-sm border border-[#475569]">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-white">თბილისის ფიქსირებული ზონა</h2>
            <p className="text-sm text-slate-400">
              ამ მანძილამდე მოქმედებს ფიქსირებული ფასი
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            value={settings.tbilisiFixedZoneKm}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                tbilisiFixedZoneKm: Number(e.target.value),
              }))
            }
            className="w-32 px-4 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white bg-[#334155]"
          />
          <span className="text-slate-400">კმ</span>
        </div>
      </div>

      {/* Cargo Prices */}
      <div className="bg-[#1E293B] rounded-xl shadow-sm border border-[#475569] overflow-hidden">
        <div className="flex items-center space-x-3 p-6 border-b border-[#475569]">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CargoTruckIcon className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-white">ტვირთის ფასები</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#334155]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  ტიპი
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  კლიენტის ფასი (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  მძღოლის ფასი (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  კმ-ზე (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  კმ-ზე მოგება (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  მოგება
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#475569]">
              {cargoTypes.map(({ key, label }) => {
                const config = settings.cargo[key] || { customerPrice: 0, driverPrice: 0, perKm: 0, perKmProfit: 0 };
                const profit = config.customerPrice - config.driverPrice;
                return (
                  <tr key={key}>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-white">
                      {label}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.customerPrice}
                        onChange={(e) =>
                          updateCargoPrice(key, 'customerPrice', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.driverPrice}
                        onChange={(e) =>
                          updateCargoPrice(key, 'driverPrice', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.1"
                        value={config.perKm}
                        onChange={(e) =>
                          updateCargoPrice(key, 'perKm', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.1"
                        value={config.perKmProfit}
                        onChange={(e) =>
                          updateCargoPrice(key, 'perKmProfit', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit}₾
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evacuator / Service Vehicle Prices */}
      <div className="bg-[#1E293B] rounded-xl shadow-sm border border-[#475569] overflow-hidden">
        <div className="flex items-center space-x-3 p-6 border-b border-[#475569]">
          <div className="p-2 bg-orange-100 rounded-lg">
            <TowTruckIcon className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="font-semibold text-white">ევაკუატორის ფასები</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#334155]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  ტიპი
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  კლიენტის ფასი (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  მძღოლის ფასი (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  კმ-ზე (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  კმ-ზე მოგება (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  მოგება
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#475569]">
              {serviceVehicleTypes.map(({ key, label }) => {
                const config = settings.serviceVehicle[key] || { customerPrice: 0, driverPrice: 0, perKm: 0, perKmProfit: 0 };
                const profit = config.customerPrice - config.driverPrice;
                return (
                  <tr key={key}>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-white">
                      {label}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.customerPrice}
                        onChange={(e) =>
                          updateServiceVehiclePrice(key, 'customerPrice', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.driverPrice}
                        onChange={(e) =>
                          updateServiceVehiclePrice(key, 'driverPrice', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.1"
                        value={config.perKm}
                        onChange={(e) =>
                          updateServiceVehiclePrice(key, 'perKm', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.1"
                        value={config.perKmProfit}
                        onChange={(e) =>
                          updateServiceVehiclePrice(key, 'perKmProfit', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit}₾
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crane Lift Prices */}
      <div className="bg-[#1E293B] rounded-xl shadow-sm border border-[#475569] overflow-hidden">
        <div className="flex items-center space-x-3 p-6 border-b border-[#475569]">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <CraneLiftIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="font-semibold text-white">ამწე ლიფტის ფასები</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#334155]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  ხანგრძლივობა
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  კლიენტის ფასი (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  მძღოლის ფასი (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  მოგება
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#475569]">
              {craneDurationTypes.map(({ key, label }) => {
                const config = settings.crane[key] || { customerPrice: 0, driverPrice: 0 };
                const profit = config.customerPrice - config.driverPrice;
                return (
                  <tr key={key}>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-white">
                      {label}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.customerPrice}
                        onChange={(e) =>
                          updateCranePrice(key, 'customerPrice', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.driverPrice}
                        onChange={(e) =>
                          updateCranePrice(key, 'driverPrice', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit}₾
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crane Floor Surcharges */}
      <div className="bg-[#1E293B] rounded-xl shadow-sm border border-[#475569] overflow-hidden">
        <div className="flex items-center space-x-3 p-6 border-b border-[#475569]">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <CraneLiftIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-white">სართულის დამატებითი ფასი</h2>
            <p className="text-sm text-slate-400">დამატებითი ფასი სართულის მიხედვით</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#334155]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  სართული
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  დამატება კლიენტს (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  დამატება მძღოლს (₾)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  დამატებითი მოგება
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#475569]">
              {craneFloorTypes.map(({ key, label }) => {
                const config = settings.craneFloorSurcharges[key] || { surcharge: 0, driverSurcharge: 0 };
                const profitSurcharge = config.surcharge - config.driverSurcharge;
                return (
                  <tr key={key}>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-white">
                      {label}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.surcharge}
                        onChange={(e) =>
                          updateCraneFloorSurcharge(key, 'surcharge', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.driverSurcharge}
                        onChange={(e) =>
                          updateCraneFloorSurcharge(key, 'driverSurcharge', Number(e.target.value))
                        }
                        className="w-20 px-3 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white bg-[#334155]"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${profitSurcharge >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        +{profitSurcharge}₾
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
