'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CARGO_PRICES, EVACUATOR_PRICES, SERVICE_VEHICLE_PRICES, TBILISI_FIXED_ZONE_KM } from '@/lib/constants';
import { SERVICE_VEHICLE_LABELS } from '@/lib/types';
import {
  Save,
  Package,
  Truck,
  MapPin,
  RefreshCw,
} from 'lucide-react';

interface PriceConfig {
  customerPrice: number;
  driverPrice: number;
  perKm: number;
}

interface PricingSettings {
  tbilisiFixedZoneKm: number;
  cargo: Record<string, PriceConfig>;
  evacuator: Record<string, PriceConfig>;
  serviceVehicle: Record<string, PriceConfig>;
}

const cargoTypes = [
  { key: 'S', label: 'S - მცირე' },
  { key: 'M', label: 'M - საშუალო' },
  { key: 'L', label: 'L - დიდი' },
  { key: 'XL', label: 'XL - ძალიან დიდი' },
  { key: 'CONSTRUCTION', label: 'სამშენებლო' },
];

const evacuatorTypes = [
  { key: 'LIGHT', label: 'მსუბუქი' },
  { key: 'JEEP', label: 'ჯიპი' },
  { key: 'MINIBUS', label: 'მიკროავტობუსი' },
  { key: 'SPIDER', label: 'სპაიდერი' },
  { key: 'OVERSIZED', label: 'ზომაგადასული' },
];

// New service vehicle types
const serviceVehicleTypes = [
  { key: 'STANDARD', label: SERVICE_VEHICLE_LABELS.STANDARD },
  { key: 'SPIDER', label: SERVICE_VEHICLE_LABELS.SPIDER },
  { key: 'LOWBOY', label: SERVICE_VEHICLE_LABELS.LOWBOY },
  { key: 'HEAVY_MANIPULATOR', label: SERVICE_VEHICLE_LABELS.HEAVY_MANIPULATOR },
  { key: 'LONG_BED', label: SERVICE_VEHICLE_LABELS.LONG_BED },
  { key: 'MOTO_CARRIER', label: SERVICE_VEHICLE_LABELS.MOTO_CARRIER },
];

const getDefaultSettings = (): PricingSettings => {
  const cargoDefaults: Record<string, PriceConfig> = {};
  const evacuatorDefaults: Record<string, PriceConfig> = {};
  const serviceVehicleDefaults: Record<string, PriceConfig> = {};

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

  Object.entries(SERVICE_VEHICLE_PRICES).forEach(([key, value]) => {
    serviceVehicleDefaults[key] = {
      customerPrice: value.customerPrice,
      driverPrice: value.driverPrice,
      perKm: value.perKm,
    };
  });

  return {
    tbilisiFixedZoneKm: TBILISI_FIXED_ZONE_KM,
    cargo: cargoDefaults,
    evacuator: evacuatorDefaults,
    serviceVehicle: serviceVehicleDefaults,
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
              };
            });
            return result;
          };

          setSettings({
            tbilisiFixedZoneKm: data.tbilisiFixedZoneKm || defaults.tbilisiFixedZoneKm,
            cargo: mergePrices(defaults.cargo, data.cargo),
            evacuator: mergePrices(defaults.evacuator, data.evacuator),
            serviceVehicle: mergePrices(defaults.serviceVehicle, data.serviceVehicle),
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

  const updateEvacuatorPrice = (key: string, field: keyof PriceConfig, value: number) => {
    setSettings((prev) => ({
      ...prev,
      evacuator: {
        ...prev.evacuator,
        [key]: {
          ...prev.evacuator[key],
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
          <h1 className="text-xl font-bold text-gray-800">ფასების მართვა</h1>
          <p className="text-sm text-gray-500">დააყენეთ ფასები სერვისების მიხედვით</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">თბილისის ფიქსირებული ზონა</h2>
            <p className="text-sm text-gray-500">
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
            className="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
          />
          <span className="text-gray-600">კმ</span>
        </div>
      </div>

      {/* Cargo Prices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center space-x-3 p-6 border-b border-gray-100">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-gray-800">ტვირთის ფასები</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ტიპი
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  კლიენტის ფასი (₾)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  მძღოლის ფასი (₾)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  კმ-ზე (₾)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  მოგება
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargoTypes.map(({ key, label }) => {
                const config = settings.cargo[key] || { customerPrice: 0, driverPrice: 0, perKm: 0 };
                const profit = config.customerPrice - config.driverPrice;
                return (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                      {label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.customerPrice}
                        onChange={(e) =>
                          updateCargoPrice(key, 'customerPrice', Number(e.target.value))
                        }
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.driverPrice}
                        onChange={(e) =>
                          updateCargoPrice(key, 'driverPrice', Number(e.target.value))
                        }
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.1"
                        value={config.perKm}
                        onChange={(e) =>
                          updateCargoPrice(key, 'perKm', Number(e.target.value))
                        }
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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

      {/* Evacuator Prices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center space-x-3 p-6 border-b border-gray-100">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Truck className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="font-semibold text-gray-800">ევაკუატორის ფასები</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ტიპი
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  კლიენტის ფასი (₾)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  მძღოლის ფასი (₾)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  კმ-ზე (₾)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  მოგება
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {evacuatorTypes.map(({ key, label }) => {
                const config = settings.evacuator[key] || { customerPrice: 0, driverPrice: 0, perKm: 0 };
                const profit = config.customerPrice - config.driverPrice;
                return (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                      {label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.customerPrice}
                        onChange={(e) =>
                          updateEvacuatorPrice(key, 'customerPrice', Number(e.target.value))
                        }
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.driverPrice}
                        onChange={(e) =>
                          updateEvacuatorPrice(key, 'driverPrice', Number(e.target.value))
                        }
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.1"
                        value={config.perKm}
                        onChange={(e) =>
                          updateEvacuatorPrice(key, 'perKm', Number(e.target.value))
                        }
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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

      {/* Service Vehicle Prices (New) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center space-x-3 p-6 border-b border-gray-100">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Truck className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">ევაკუატორის ფასები (ახალი)</h2>
            <p className="text-xs text-gray-500">მომხმარებლის არჩევანის მიხედვით</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ტიპი
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  კლიენტის ფასი (₾)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  მძღოლის ფასი (₾)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  კმ-ზე (₾)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  მოგება
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {serviceVehicleTypes.map(({ key, label }) => {
                const config = settings.serviceVehicle[key] || { customerPrice: 0, driverPrice: 0, perKm: 0 };
                const profit = config.customerPrice - config.driverPrice;
                return (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                      {label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.customerPrice}
                        onChange={(e) =>
                          updateServiceVehiclePrice(key, 'customerPrice', Number(e.target.value))
                        }
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={config.driverPrice}
                        onChange={(e) =>
                          updateServiceVehiclePrice(key, 'driverPrice', Number(e.target.value))
                        }
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.1"
                        value={config.perKm}
                        onChange={(e) =>
                          updateServiceVehiclePrice(key, 'perKm', Number(e.target.value))
                        }
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
    </div>
  );
}
