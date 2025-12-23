export type ServiceType = 'cargo' | 'evacuator';

export type CargoSize = 'S' | 'M' | 'L' | 'XL' | 'CONSTRUCTION';

export type EvacuatorType = 'LIGHT' | 'JEEP' | 'MINIBUS' | 'SPIDER' | 'OVERSIZED';

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  serviceType: ServiceType;
  subType: CargoSize | EvacuatorType;
  pickup: Location;
  dropoff: Location;
  distance: number;
  customerPrice: number;
  driverPrice: number;
  phone: string;
  status: OrderStatus;
  scheduledTime?: Date;
  createdAt: Date;
}
