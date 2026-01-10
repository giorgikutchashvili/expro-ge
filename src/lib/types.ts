export type ServiceType = 'cargo' | 'evacuator';

export type CargoSize = 'S' | 'M' | 'L' | 'XL' | 'CONSTRUCTION';

// Legacy evacuator type (kept for backward compatibility)
export type EvacuatorType = 'LIGHT' | 'JEEP' | 'MINIBUS' | 'SPIDER' | 'OVERSIZED';

// Customer vehicle types (what customer is evacuating)
export type CustomerVehicleType = 'SEDAN' | 'SUV' | 'MINIBUS' | 'CONSTRUCTION' | 'MOTO' | 'SPORTS';

// Service vehicle types (what evacuator is needed)
export type ServiceVehicleType = 'STANDARD' | 'SPIDER' | 'LOWBOY' | 'HEAVY_MANIPULATOR' | 'LONG_BED' | 'MOTO_CARRIER';

// Questionnaire answers
export interface EvacuatorAnswers {
  wheelLocked?: boolean;
  steeringLocked?: boolean;
  goesNeutral?: boolean;
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

// Payment method types
export type PaymentMethodType = 'cash' | 'card';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: 'ნაღდი ფული',
  card: 'ბარათით',
};

export interface Order {
  id: string;
  serviceType: ServiceType;
  subType: CargoSize | EvacuatorType | ServiceVehicleType;
  pickup: Location;
  dropoff: Location;
  distance: number;
  customerPrice: number;
  driverPrice: number;
  phone: string;
  paymentMethod?: PaymentMethodType;
  status: OrderStatus;
  scheduledTime?: Date;
  createdAt: Date;
  // New evacuator fields
  customerVehicleType?: CustomerVehicleType;
  serviceVehicleType?: ServiceVehicleType;
  evacuatorAnswers?: EvacuatorAnswers;
}

// Driver interface
export interface Driver {
  id: string;
  name: string;
  phone: string;
  serviceVehicleType: ServiceVehicleType;
  baseLocation: string;
  workingDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  createdAt: Date;
}

// Customer vehicle type labels
export const CUSTOMER_VEHICLE_LABELS: Record<CustomerVehicleType, { title: string; description: string }> = {
  SEDAN: { title: 'მსუბუქი', description: 'სედანი, ჰეჩბეკი, კუპე' },
  SUV: { title: 'ჯიპი', description: 'მაღალი გამავლობის, პიკაპი' },
  MINIBUS: { title: 'მიკროავტობუსი', description: 'Sprinter, Transit' },
  CONSTRUCTION: { title: 'სპეცტექნიკა', description: 'Bobcat, Forklift' },
  MOTO: { title: 'მოტოციკლი', description: 'სკუტერი, კვადროციკლი' },
  SPORTS: { title: 'სპორტული', description: 'დაწეული სავალი ნაწილი' },
};

// Service vehicle type labels
export const SERVICE_VEHICLE_LABELS: Record<ServiceVehicleType, string> = {
  STANDARD: 'სტანდარტული (ჯალამბარით)',
  SPIDER: 'ობობა (ჰიდრავლიკური ამწით)',
  LOWBOY: 'მძიმე პლატფორმა (Lowboy)',
  HEAVY_MANIPULATOR: 'მძიმე მანიპულატორი / ბუქსირი',
  LONG_BED: 'გრძელბაქნიანი (Long Bed)',
  MOTO_CARRIER: 'მცირე ევაკუატორი / მოტო-სამაგრებით',
};

// Cargo size labels
export const CARGO_SIZE_LABELS: Record<CargoSize, { title: string; dimensions: string; weight: string }> = {
  S: { title: 'S', dimensions: '1.5მ × 1.2მ × 1მ', weight: '500 კგ-მდე' },
  M: { title: 'M', dimensions: '2.5მ × 1.5მ × 1.5მ', weight: '1000 კგ-მდე' },
  L: { title: 'L', dimensions: '3მ × 1.8მ × 1.8მ', weight: '1500 კგ-მდე' },
  XL: { title: 'XL', dimensions: '4მ × 2მ × 2მ', weight: '3000 კგ-მდე' },
  CONSTRUCTION: { title: 'სამშენებლო', dimensions: '5მ × 2.2მ × 2.2მ', weight: '5000 კგ-მდე' },
};

// Cargo driver interface
export interface CargoDriver {
  id: string;
  name: string;
  phone: string;
  vehicleSize: CargoSize;
  baseLocation: string;
  workingDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  createdAt: Date;
}
