'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ServiceVehicleType, SERVICE_VEHICLE_LABELS } from '@/lib/types';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  User,
  Phone,
  Save,
  MapPin,
  Clock,
  Calendar,
} from 'lucide-react';
import { CargoTruckIcon, TowTruckIcon } from '@/components/icons';

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType?: string; // Legacy field
  serviceVehicleType?: ServiceVehicleType;
  baseLocation?: string;
  workingDays?: string[];
  workingHours?: { start: string; end: string };
  createdAt?: Timestamp;
}

// Service vehicle types for evacuators
const serviceVehicleTypes: { value: ServiceVehicleType; label: string }[] = [
  { value: 'STANDARD', label: SERVICE_VEHICLE_LABELS.STANDARD },
  { value: 'SPIDER', label: SERVICE_VEHICLE_LABELS.SPIDER },
  { value: 'LOWBOY', label: SERVICE_VEHICLE_LABELS.LOWBOY },
  { value: 'HEAVY_MANIPULATOR', label: SERVICE_VEHICLE_LABELS.HEAVY_MANIPULATOR },
  { value: 'LONG_BED', label: SERVICE_VEHICLE_LABELS.LONG_BED },
  { value: 'MOTO_CARRIER', label: SERVICE_VEHICLE_LABELS.MOTO_CARRIER },
];

// Cargo vehicle types
const cargoVehicleTypes = [
  { value: 'S', label: 'S - მცირე' },
  { value: 'M', label: 'M - საშუალო' },
  { value: 'L', label: 'L - დიდი' },
  { value: 'XL', label: 'XL - ძალიან დიდი' },
  { value: 'CONSTRUCTION', label: 'სამშენებლო' },
];

const weekDays = [
  { value: 'MON', label: 'ორშ' },
  { value: 'TUE', label: 'სამ' },
  { value: 'WED', label: 'ოთხ' },
  { value: 'THU', label: 'ხუთ' },
  { value: 'FRI', label: 'პარ' },
  { value: 'SAT', label: 'შაბ' },
  { value: 'SUN', label: 'კვი' },
];

type DriverType = 'cargo' | 'evacuator';

interface FormData {
  name: string;
  phone: string;
  driverType: DriverType;
  vehicleType: string;
  serviceVehicleType: ServiceVehicleType;
  baseLocation: string;
  workingDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
}

const defaultFormData: FormData = {
  name: '',
  phone: '',
  driverType: 'evacuator',
  vehicleType: 'M',
  serviceVehicleType: 'STANDARD',
  baseLocation: '',
  workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00',
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'cargo' | 'evacuator'>('all');

  // Form state
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'drivers'), (snapshot) => {
      const driversData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Driver[];
      setDrivers(driversData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingDriver(null);
    setFormData(defaultFormData);
    setShowModal(true);
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);

    // Determine driver type based on existing data
    const isEvacuator = !!driver.serviceVehicleType;

    setFormData({
      name: driver.name,
      phone: driver.phone,
      driverType: isEvacuator ? 'evacuator' : 'cargo',
      vehicleType: driver.vehicleType || 'M',
      serviceVehicleType: driver.serviceVehicleType || 'STANDARD',
      baseLocation: driver.baseLocation || '',
      workingDays: driver.workingDays || ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      workingHoursStart: driver.workingHours?.start || '09:00',
      workingHoursEnd: driver.workingHours?.end || '18:00',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDriver(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSaving(true);
    try {
      const driverData = {
        name: formData.name,
        phone: formData.phone,
        baseLocation: formData.baseLocation,
        workingDays: formData.workingDays,
        workingHours: {
          start: formData.workingHoursStart,
          end: formData.workingHoursEnd,
        },
        ...(formData.driverType === 'cargo'
          ? { vehicleType: formData.vehicleType }
          : { serviceVehicleType: formData.serviceVehicleType }
        ),
      };

      if (editingDriver) {
        // Update existing driver
        await updateDoc(doc(db, 'drivers', editingDriver.id), driverData);
      } else {
        // Add new driver
        await addDoc(collection(db, 'drivers'), {
          ...driverData,
          createdAt: Timestamp.now(),
        });
      }
      closeModal();
    } catch (error) {
      console.error('Error saving driver:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (driverId: string) => {
    try {
      await deleteDoc(doc(db, 'drivers', driverId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  const toggleWorkingDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const getVehicleLabel = (driver: Driver) => {
    if (driver.serviceVehicleType) {
      return SERVICE_VEHICLE_LABELS[driver.serviceVehicleType];
    }
    const cargoType = cargoVehicleTypes.find((v) => v.value === driver.vehicleType);
    return cargoType?.label || driver.vehicleType || '-';
  };

  const isEvacuatorDriver = (driver: Driver) => !!driver.serviceVehicleType;

  const getWorkingDaysLabel = (days?: string[]) => {
    if (!days || days.length === 0) return '-';
    if (days.length === 7) return 'ყოველდღე';
    if (days.length === 5 && !days.includes('SAT') && !days.includes('SUN')) {
      return 'ორშ-პარ';
    }
    return days.map((d) => weekDays.find((w) => w.value === d)?.label).join(', ');
  };

  // Filter drivers
  const filteredDrivers = drivers.filter((driver) => {
    if (filterType === 'all') return true;
    if (filterType === 'evacuator') return isEvacuatorDriver(driver);
    return !isEvacuatorDriver(driver);
  });

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
          <h1 className="text-xl font-bold text-gray-800">მძღოლები</h1>
          <p className="text-sm text-gray-500">სულ: {drivers.length} მძღოლი</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>დამატება</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ყველა ({drivers.length})
        </button>
        <button
          onClick={() => setFilterType('evacuator')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'evacuator'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ევაკუატორი ({drivers.filter(isEvacuatorDriver).length})
        </button>
        <button
          onClick={() => setFilterType('cargo')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'cargo'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ტვირთი ({drivers.filter((d) => !isEvacuatorDriver(d)).length})
        </button>
      </div>

      {/* Drivers Grid */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">მძღოლები არ არის დამატებული</p>
          <button
            onClick={openAddModal}
            className="mt-4 text-blue-600 hover:underline"
          >
            დაამატეთ პირველი მძღოლი
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className={`bg-white rounded-xl p-6 shadow-sm border ${
                isEvacuatorDriver(driver) ? 'border-orange-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isEvacuatorDriver(driver) ? 'bg-orange-100' : 'bg-blue-100'
                  }`}>
                    <User className={`w-6 h-6 ${
                      isEvacuatorDriver(driver) ? 'text-orange-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{driver.name}</h3>
                    <a
                      href={`tel:${driver.phone}`}
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      {driver.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(driver)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(driver.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  {isEvacuatorDriver(driver) ? (
                    <TowTruckIcon className="w-4 h-4 mr-2" />
                  ) : (
                    <CargoTruckIcon className="w-4 h-4 mr-2" />
                  )}
                  <span>{getVehicleLabel(driver)}</span>
                </div>

                {driver.baseLocation && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{driver.baseLocation}</span>
                  </div>
                )}
                {driver.workingDays && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{getWorkingDaysLabel(driver.workingDays)}</span>
                  </div>
                )}
                {driver.workingHours && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{driver.workingHours.start} - {driver.workingHours.end}</span>
                  </div>
                )}
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === driver.id && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 mb-2">დარწმუნებული ხართ?</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      წაშლა
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                    >
                      გაუქმება
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingDriver ? 'მძღოლის რედაქტირება' : 'ახალი მძღოლი'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Driver Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  მძღოლის ტიპი
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, driverType: 'evacuator' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      formData.driverType === 'evacuator'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ევაკუატორი
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, driverType: 'cargo' })}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      formData.driverType === 'cargo'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ტვირთი
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  სახელი
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="მძღოლის სახელი"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ტელეფონი
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+995 5XX XXX XXX"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Cargo-specific fields */}
              {formData.driverType === 'cargo' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ტვირთის ზომა
                    </label>
                    <div className="relative">
                      <CargoTruckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-gray-900"
                      >
                        {cargoVehicleTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      საბაზო ლოკაცია
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.baseLocation}
                        onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value })}
                        placeholder="მაგ: ვაკე, თბილისი"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      სამუშაო დღეები
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleWorkingDay(day.value)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.workingDays.includes(day.value)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      სამუშაო საათები
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="time"
                          value={formData.workingHoursStart}
                          onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="time"
                          value={formData.workingHoursEnd}
                          onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Evacuator-specific fields */}
              {formData.driverType === 'evacuator' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ევაკუატორის ტიპი
                    </label>
                    <div className="relative">
                      <TowTruckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.serviceVehicleType}
                        onChange={(e) => setFormData({ ...formData, serviceVehicleType: e.target.value as ServiceVehicleType })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-gray-900"
                      >
                        {serviceVehicleTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      საბაზო ლოკაცია
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.baseLocation}
                        onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value })}
                        placeholder="მაგ: ვაკე, თბილისი"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      სამუშაო დღეები
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleWorkingDay(day.value)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.workingDays.includes(day.value)
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      სამუშაო საათები
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="time"
                          value={formData.workingHoursStart}
                          onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="time"
                          value={formData.workingHoursEnd}
                          onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg transition-colors ${
                    formData.driverType === 'evacuator'
                      ? 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400'
                      : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                  }`}
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{editingDriver ? 'შენახვა' : 'დამატება'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
