'use client';

import { useState, useCallback } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ServiceType, CargoSize, EvacuatorType, Location, Order, CustomerVehicleType, ServiceVehicleType, EvacuatorAnswers, SERVICE_VEHICLE_LABELS, CUSTOMER_VEHICLE_LABELS, PaymentMethodType, CraneFloor, CraneCargoType, CraneDuration, CRANE_FLOOR_LABELS, CRANE_CARGO_LABELS, CRANE_DURATION_LABELS } from '@/lib/types';
import { usePricing } from '@/hooks/usePricing';

import GoogleMapsProvider from '@/components/GoogleMapsProvider';
import ServiceSelector from '@/components/ServiceSelector';
import SubTypeSelector from '@/components/SubTypeSelector';
import LocationPicker from '@/components/LocationPicker';
import SingleLocationPicker from '@/components/SingleLocationPicker';
import DateTimePicker from '@/components/DateTimePicker';
import OrderForm from '@/components/OrderForm';
import OrderConfirmation from '@/components/OrderConfirmation';
import EvacuatorTypeSelector from '@/components/EvacuatorTypeSelector';
import EvacuatorQuestionnaire, { needsQuestionnaire, getDirectServiceType } from '@/components/EvacuatorQuestionnaire';
import CraneLiftSelector from '@/components/CraneLiftSelector';
import CookieBanner from '@/components/CookieBanner';
import Link from 'next/link';

type Step = 1 | 2 | 2.5 | 3 | 5 | 6 | 7;

const stepTitles: Record<Step, string> = {
  1: 'სერვისი',
  2: 'ტიპი',
  2.5: 'კითხვარი',
  3: 'მისამართი',
  5: 'დრო',
  6: 'დადასტურება',
  7: 'დასრულება',
};

export default function Home() {
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Order data
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [subType, setSubType] = useState<CargoSize | EvacuatorType | null>(null);
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [phone, setPhone] = useState('');

  // New evacuator flow state
  const [customerVehicleType, setCustomerVehicleType] = useState<CustomerVehicleType | null>(null);
  const [serviceVehicleType, setServiceVehicleType] = useState<ServiceVehicleType | null>(null);
  const [evacuatorAnswers, setEvacuatorAnswers] = useState<EvacuatorAnswers>({});

  // Crane lift state
  const [craneFloor, setCraneFloor] = useState<CraneFloor | null>(null);
  const [craneCargoType, setCraneCargoType] = useState<CraneCargoType | null>(null);
  const [craneDuration, setCraneDuration] = useState<CraneDuration | null>(null);

  // Payment method state - default to 'cash'
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Get pricing from Firestore
  const { calculatePrice, calculateServiceVehiclePrice, calculateCranePrice } = usePricing();

  // Calculate price - use new service vehicle pricing for evacuator, crane pricing for crane
  const price = serviceType === 'crane' && craneDuration && craneFloor
    ? calculateCranePrice(craneDuration, craneFloor)
    : serviceType === 'evacuator' && serviceVehicleType && distance
    ? calculateServiceVehiclePrice(serviceVehicleType, distance)
    : serviceType && subType && distance
      ? calculatePrice(serviceType, subType, distance)
      : { customerPrice: 0, driverPrice: 0, profit: 0 };

  // Handlers
  const handleServiceSelect = (type: ServiceType) => {
    setServiceType(type);
    setCurrentStep(2);
  };

  const handleSubTypeSelect = (type: CargoSize) => {
    setSubType(type);
    setCurrentStep(3);
  };

  // New evacuator flow handlers
  const handleCustomerVehicleSelect = (type: CustomerVehicleType) => {
    setCustomerVehicleType(type);

    // Check if questionnaire is needed
    if (needsQuestionnaire(type)) {
      setCurrentStep(2.5);
    } else {
      // Directly determine service type and proceed
      const svcType = getDirectServiceType(type);
      setServiceVehicleType(svcType);
      setCurrentStep(3);
    }
  };

  const handleQuestionnaireComplete = (answers: EvacuatorAnswers, svcType: ServiceVehicleType) => {
    setEvacuatorAnswers(answers);
    setServiceVehicleType(svcType);
    setCurrentStep(3);
  };

  // Crane lift handler
  const handleCraneComplete = (floor: CraneFloor, cargoType: CraneCargoType, duration: CraneDuration) => {
    setCraneFloor(floor);
    setCraneCargoType(cargoType);
    setCraneDuration(duration);
    setCurrentStep(3);
  };

  const handleLocationComplete = () => {
    if (serviceType === 'crane') {
      // For crane, only need single address (pickup)
      if (pickup) {
        setCurrentStep(5);
      }
    } else if (pickup && dropoff && distance) {
      setCurrentStep(5); // Skip payment step (now in OrderForm), go to date/time
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethodType) => {
    setPaymentMethod(method);
  };

  const handleDateTimeComplete = () => {
    setCurrentStep(6);
  };

  const handleBack = useCallback(() => {
    if (currentStep === 2.5) {
      // From questionnaire, go back to vehicle type selection
      setCurrentStep(2);
    } else if (currentStep === 3 && serviceType === 'evacuator') {
      // From location picker in evacuator flow
      if (customerVehicleType && needsQuestionnaire(customerVehicleType)) {
        setCurrentStep(2.5);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 3 && serviceType === 'crane') {
      // From location picker in crane flow, go back to crane selector
      setCurrentStep(2);
    } else if (currentStep === 5) {
      // From date/time, go back to location
      setCurrentStep(3);
    } else if (currentStep === 6) {
      // From order form, go back to date/time
      setCurrentStep(5);
    } else if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  }, [currentStep, serviceType, customerVehicleType]);

  const handleSubmit = async () => {
    // For evacuator, we need serviceVehicleType instead of subType
    const isEvacuator = serviceType === 'evacuator';
    const isCrane = serviceType === 'crane';

    // Validation
    if (!serviceType || !pickup || !phone) return;
    if (!isCrane && (!dropoff || !distance)) return;
    if (!isEvacuator && !isCrane && !subType) return;
    if (isEvacuator && !serviceVehicleType) return;
    if (isCrane && (!craneFloor || !craneCargoType || !craneDuration)) return;

    setIsLoading(true);

    try {
      // Create order object
      const orderData = {
        serviceType,
        subType: isCrane ? craneDuration : isEvacuator ? serviceVehicleType : subType,
        ...(isEvacuator && {
          customerVehicleType,
          serviceVehicleType,
          evacuatorAnswers,
        }),
        ...(isCrane && {
          craneFloor,
          craneCargoType,
          craneDuration,
        }),
        pickup,
        ...(dropoff && { dropoff }),
        ...(distance && { distance }),
        customerPrice: price.customerPrice,
        driverPrice: price.driverPrice,
        phone,
        paymentMethod,
        status: 'pending',
        scheduledTime: isScheduled && scheduledTime ? Timestamp.fromDate(scheduledTime) : null,
        createdAt: Timestamp.now(),
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      console.log('Order saved to Firestore with ID:', docRef.id);

      // Send Telegram notification
      console.log('Sending Telegram notification...');
      try {
        const telegramBody: Record<string, unknown> = {
          serviceType,
          subType: isCrane ? craneDuration : isEvacuator ? serviceVehicleType : subType,
          pickupAddress: pickup.address,
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          customerPrice: price.customerPrice,
          phone,
        };

        // Add dropoff for non-crane services
        if (!isCrane && dropoff) {
          telegramBody.dropoffAddress = dropoff.address;
          telegramBody.dropoffLat = dropoff.lat;
          telegramBody.dropoffLng = dropoff.lng;
          telegramBody.distance = distance;
        }

        // Add crane-specific fields
        if (isCrane) {
          telegramBody.craneFloor = craneFloor;
          telegramBody.craneCargoType = craneCargoType;
          telegramBody.craneDuration = craneDuration;
        }

        const telegramResponse = await fetch('/api/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(telegramBody),
        });

        const telegramData = await telegramResponse.json();
        console.log('Telegram API response:', telegramResponse.status, telegramData);

        if (!telegramResponse.ok) {
          console.error('Telegram notification failed:', telegramData);
        } else {
          console.log('Telegram notification sent successfully');
        }
      } catch (telegramError) {
        console.error('Error calling Telegram API:', telegramError);
      }

      // Set completed order for confirmation
      const order: Order = {
        id: docRef.id,
        serviceType,
        subType: isCrane ? craneDuration! : isEvacuator ? serviceVehicleType! : subType!,
        ...(isEvacuator && {
          customerVehicleType: customerVehicleType!,
          serviceVehicleType: serviceVehicleType!,
          evacuatorAnswers,
        }),
        ...(isCrane && {
          craneFloor: craneFloor!,
          craneCargoType: craneCargoType!,
          craneDuration: craneDuration!,
        }),
        pickup,
        dropoff: dropoff || undefined,
        distance: distance || undefined,
        customerPrice: price.customerPrice,
        driverPrice: price.driverPrice,
        phone,
        paymentMethod,
        status: 'pending',
        scheduledTime: isScheduled && scheduledTime ? scheduledTime : undefined,
        createdAt: new Date(),
      };

      setCompletedOrder(order);
      setCurrentStep(7);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('შეკვეთის გაგზავნა ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewOrder = () => {
    // Reset all state
    setCurrentStep(1);
    setServiceType(null);
    setSubType(null);
    setPickup(null);
    setDropoff(null);
    setDistance(null);
    setIsScheduled(false);
    setScheduledTime(null);
    setPhone('');
    setCompletedOrder(null);
    // Reset new evacuator flow state
    setCustomerVehicleType(null);
    setServiceVehicleType(null);
    setEvacuatorAnswers({});
    // Reset crane state
    setCraneFloor(null);
    setCraneCargoType(null);
    setCraneDuration(null);
    // Reset payment method to default
    setPaymentMethod('cash');
  };

  // Check if can proceed from location step
  const canProceedFromLocation = serviceType === 'crane'
    ? pickup
    : pickup && dropoff && distance;

  return (
    <GoogleMapsProvider>
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-[#1E293B] shadow-md sticky top-0 z-50 border-b border-[#475569]">
          <div className="max-w-4xl mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
              {/* Logo - clickable to go home */}
              <button
                onClick={handleNewOrder}
                className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-[#F8FAFC]">EXPRO.GE</span>
              </button>

              {/* Step Indicator */}
              {currentStep < 7 && (
                <div className="hidden sm:flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((step) => {
                    // Map current step to display position (step 4 is skipped, so 5->4, 6->5)
                    const currentActual = currentStep === 2.5 ? 2 : Math.floor(currentStep);
                    const displayCurrent = currentActual <= 3 ? currentActual : currentActual - 1;

                    return (
                      <div key={step} className="flex items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 shadow-sm
                            ${
                              step === displayCurrent
                                ? 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white shadow-md'
                                : step < displayCurrent
                                ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white'
                                : 'bg-[#334155] text-[#94A3B8]'
                            }`}
                        >
                          {step < displayCurrent ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            step
                          )}
                        </div>
                        {step < 5 && (
                          <div
                            className={`w-6 h-1 mx-0.5 rounded-full transition-all duration-200 ${
                              step < displayCurrent ? 'bg-[#10B981]' : 'bg-[#475569]'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mobile Step Indicator */}
              {currentStep < 7 && (
                <div className="sm:hidden">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white flex items-center justify-center text-sm font-bold">
                      {Math.floor(currentStep)}
                    </div>
                    <span className="text-sm font-medium text-[#94A3B8]">
                      {stepTitles[currentStep]}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && <ServiceSelector onSelect={handleServiceSelect} />}

          {/* Step 2: SubType Selection (Cargo) or Vehicle Type Selection (Evacuator) */}
          {currentStep === 2 && serviceType === 'cargo' && (
            <SubTypeSelector
              onSelect={handleSubTypeSelect}
              onBack={handleBack}
            />
          )}

          {/* Step 2: Evacuator Vehicle Type Selection */}
          {currentStep === 2 && serviceType === 'evacuator' && (
            <EvacuatorTypeSelector
              selected={customerVehicleType}
              onSelect={handleCustomerVehicleSelect}
              onBack={handleBack}
            />
          )}

          {/* Step 2.5: Evacuator Questionnaire */}
          {currentStep === 2.5 && serviceType === 'evacuator' && customerVehicleType && (
            <EvacuatorQuestionnaire
              vehicleType={customerVehicleType}
              onComplete={handleQuestionnaireComplete}
              onBack={handleBack}
            />
          )}

          {/* Step 2: Crane Lift Selector */}
          {currentStep === 2 && serviceType === 'crane' && (
            <CraneLiftSelector
              onComplete={handleCraneComplete}
              onBack={handleBack}
            />
          )}

          {/* Step 3: Location Picker */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>უკან</span>
                </button>
                <button
                  onClick={handleNewOrder}
                  className="flex items-center space-x-2 text-[#60A5FA] hover:text-[#3B82F6] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>თავიდან</span>
                </button>
              </div>

              {serviceType === 'crane' ? (
                <SingleLocationPicker
                  location={pickup}
                  onLocationChange={setPickup}
                  label="მისამართი"
                />
              ) : (
                <LocationPicker
                  pickup={pickup}
                  dropoff={dropoff}
                  onPickupChange={setPickup}
                  onDropoffChange={setDropoff}
                  distance={distance}
                  onDistanceChange={setDistance}
                />
              )}

              {/* Continue Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleLocationComplete}
                  disabled={!canProceedFromLocation}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform
                    ${
                      canProceedFromLocation
                        ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-[#334155] text-[#64748B] cursor-not-allowed'
                    }`}
                >
                  გაგრძელება
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Date/Time Picker */}
          {currentStep === 5 && (
            <div className="space-y-6 max-w-lg mx-auto">
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>უკან</span>
                </button>
                <button
                  onClick={handleNewOrder}
                  className="flex items-center space-x-2 text-[#60A5FA] hover:text-[#3B82F6] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>თავიდან</span>
                </button>
              </div>

              <DateTimePicker
                scheduledTime={scheduledTime}
                onScheduledTimeChange={setScheduledTime}
                isScheduled={isScheduled}
                onIsScheduledChange={setIsScheduled}
              />

              {/* Continue Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleDateTimeComplete}
                  className="px-8 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white rounded-xl font-semibold
                           transition-all duration-300 transform hover:shadow-lg hover:-translate-y-0.5"
                >
                  გაგრძელება
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Order Form */}
          {currentStep === 6 && (
            <div className="space-y-6 max-w-lg mx-auto">
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>უკან</span>
                </button>
                <button
                  onClick={handleNewOrder}
                  className="flex items-center space-x-2 text-[#60A5FA] hover:text-[#3B82F6] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>თავიდან</span>
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-[#1E293B] rounded-xl p-4 shadow-md border border-[#475569]">
                <h3 className="font-semibold text-[#F8FAFC] mb-3">შეკვეთის მონაცემები</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">სერვისი:</span>
                    <span className="font-medium text-[#F8FAFC]">
                      {serviceType === 'cargo' ? `ტვირთი (${subType})` : serviceType === 'crane' ? 'ამწე ლიფტი' : 'ევაკუატორი'}
                    </span>
                  </div>
                  {serviceType === 'evacuator' && customerVehicleType && (
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">ავტომობილი:</span>
                      <span className="font-medium text-[#F8FAFC]">
                        {CUSTOMER_VEHICLE_LABELS[customerVehicleType].title}
                      </span>
                    </div>
                  )}
                  {serviceType === 'evacuator' && serviceVehicleType && (
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">ევაკუატორი:</span>
                      <span className="font-medium text-[#F8FAFC]">
                        {SERVICE_VEHICLE_LABELS[serviceVehicleType]}
                      </span>
                    </div>
                  )}
                  {serviceType === 'crane' && craneFloor && (
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">სართული:</span>
                      <span className="font-medium text-[#F8FAFC]">
                        {CRANE_FLOOR_LABELS[craneFloor].title}
                      </span>
                    </div>
                  )}
                  {serviceType === 'crane' && craneCargoType && (
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">ტვირთის ტიპი:</span>
                      <span className="font-medium text-[#F8FAFC]">
                        {CRANE_CARGO_LABELS[craneCargoType]}
                      </span>
                    </div>
                  )}
                  {serviceType === 'crane' && craneDuration && (
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">ხანგრძლივობა:</span>
                      <span className="font-medium text-[#F8FAFC]">
                        {CRANE_DURATION_LABELS[craneDuration]}
                      </span>
                    </div>
                  )}
                  {distance && (
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">მანძილი:</span>
                      <span className="font-medium text-[#F8FAFC]">{distance} კმ</span>
                    </div>
                  )}
                  {isScheduled && scheduledTime && (
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">დრო:</span>
                      <span className="font-medium text-[#F8FAFC]">
                        {scheduledTime.toLocaleDateString('ka-GE')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <OrderForm
                phone={phone}
                onPhoneChange={setPhone}
                price={price}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={handlePaymentMethodChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Step 7: Confirmation */}
          {currentStep === 7 && completedOrder && (
            <OrderConfirmation order={completedOrder} onNewOrder={handleNewOrder} />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto py-4 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} EXPRO.GE{' '}
            <span className="mx-1">·</span>
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">კონფიდენციალურობა</Link>
            <span className="mx-1">·</span>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">პირობები</Link>
            <span className="mx-1">·</span>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">კონტაქტი</Link>
          </p>
        </footer>

        {/* Cookie Banner */}
        <CookieBanner />
      </div>
    </GoogleMapsProvider>
  );
}
