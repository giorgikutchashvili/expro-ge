'use client';

import { useState, useCallback } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ServiceType, CargoSize, EvacuatorType, Location, Order, CustomerVehicleType, ServiceVehicleType, EvacuatorAnswers, SERVICE_VEHICLE_LABELS, CUSTOMER_VEHICLE_LABELS } from '@/lib/types';
import { usePricing } from '@/hooks/usePricing';

import GoogleMapsProvider from '@/components/GoogleMapsProvider';
import ServiceSelector from '@/components/ServiceSelector';
import SubTypeSelector from '@/components/SubTypeSelector';
import LocationPicker from '@/components/LocationPicker';
import DateTimePicker from '@/components/DateTimePicker';
import OrderForm from '@/components/OrderForm';
import OrderConfirmation from '@/components/OrderConfirmation';
import EvacuatorTypeSelector from '@/components/EvacuatorTypeSelector';
import EvacuatorQuestionnaire, { needsQuestionnaire, getDirectServiceType } from '@/components/EvacuatorQuestionnaire';

type Step = 1 | 2 | 2.5 | 3 | 4 | 5 | 6;

const stepTitles: Record<Step, string> = {
  1: 'სერვისი',
  2: 'ტიპი',
  2.5: 'კითხვარი',
  3: 'მისამართი',
  4: 'დრო',
  5: 'დადასტურება',
  6: 'დასრულება',
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

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Get pricing from Firestore
  const { calculatePrice, calculateServiceVehiclePrice } = usePricing();

  // Calculate price - use new service vehicle pricing for evacuator
  const price = serviceType === 'evacuator' && serviceVehicleType && distance
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

  const handleLocationComplete = () => {
    if (pickup && dropoff && distance) {
      setCurrentStep(4);
    }
  };

  const handleDateTimeComplete = () => {
    setCurrentStep(5);
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
    } else if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  }, [currentStep, serviceType, customerVehicleType]);

  const handleSubmit = async () => {
    // For evacuator, we need serviceVehicleType instead of subType
    const isEvacuator = serviceType === 'evacuator';
    if (!serviceType || (!isEvacuator && !subType) || (isEvacuator && !serviceVehicleType) || !pickup || !dropoff || !distance || !phone) {
      return;
    }

    setIsLoading(true);

    try {
      // Create order object
      const orderData = {
        serviceType,
        subType: isEvacuator ? serviceVehicleType : subType,
        ...(isEvacuator && {
          customerVehicleType,
          serviceVehicleType,
          evacuatorAnswers,
        }),
        pickup,
        dropoff,
        distance,
        customerPrice: price.customerPrice,
        driverPrice: price.driverPrice,
        phone,
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
        const telegramResponse = await fetch('/api/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceType,
            subType,
            pickupAddress: pickup.address,
            pickupLat: pickup.lat,
            pickupLng: pickup.lng,
            dropoffAddress: dropoff.address,
            dropoffLat: dropoff.lat,
            dropoffLng: dropoff.lng,
            customerPrice: price.customerPrice,
            phone,
            distance,
          }),
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
        subType: isEvacuator ? serviceVehicleType! : subType!,
        ...(isEvacuator && {
          customerVehicleType: customerVehicleType!,
          serviceVehicleType: serviceVehicleType!,
          evacuatorAnswers,
        }),
        pickup,
        dropoff,
        distance,
        customerPrice: price.customerPrice,
        driverPrice: price.driverPrice,
        phone,
        status: 'pending',
        scheduledTime: isScheduled && scheduledTime ? scheduledTime : undefined,
        createdAt: new Date(),
      };

      setCompletedOrder(order);
      setCurrentStep(6);
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
  };

  // Check if can proceed from location step
  const canProceedFromLocation = pickup && dropoff && distance;

  return (
    <GoogleMapsProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo - clickable to go home */}
              <button
                onClick={handleNewOrder}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
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
                <span className="text-xl font-bold text-gray-800">EXPRO.GE</span>
              </button>

              {/* Step Indicator */}
              {currentStep < 6 && (
                <div className="hidden sm:flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                          ${
                            step === currentStep
                              ? 'bg-blue-500 text-white'
                              : step < currentStep
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                      >
                        {step < currentStep ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          step
                        )}
                      </div>
                      {step < 5 && (
                        <div
                          className={`w-8 h-1 mx-1 rounded ${
                            step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile Step Indicator */}
              {currentStep < 6 && (
                <div className="sm:hidden">
                  <span className="text-sm text-gray-500">
                    ნაბიჯი {currentStep}/5 - {stepTitles[currentStep]}
                  </span>
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

          {/* Step 3: Location Picker */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
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
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
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

              <LocationPicker
                pickup={pickup}
                dropoff={dropoff}
                onPickupChange={setPickup}
                onDropoffChange={setDropoff}
                distance={distance}
                onDistanceChange={setDistance}
              />

              {/* Continue Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleLocationComplete}
                  disabled={!canProceedFromLocation}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform
                    ${
                      canProceedFromLocation
                        ? 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  გაგრძელება
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Date/Time Picker */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-lg mx-auto">
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
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
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
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
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold
                           transition-all duration-300 transform hover:shadow-lg hover:-translate-y-0.5"
                >
                  გაგრძელება
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Order Form */}
          {currentStep === 5 && (
            <div className="space-y-6 max-w-lg mx-auto">
              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
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
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
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
              <div className="bg-white rounded-xl p-4 shadow-md">
                <h3 className="font-semibold text-gray-800 mb-3">შეკვეთის მონაცემები</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">სერვისი:</span>
                    <span className="font-medium">
                      {serviceType === 'cargo' ? `ტვირთი (${subType})` : 'ევაკუატორი'}
                    </span>
                  </div>
                  {serviceType === 'evacuator' && customerVehicleType && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ავტომობილი:</span>
                      <span className="font-medium">
                        {CUSTOMER_VEHICLE_LABELS[customerVehicleType].title}
                      </span>
                    </div>
                  )}
                  {serviceType === 'evacuator' && serviceVehicleType && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">ევაკუატორი:</span>
                      <span className="font-medium">
                        {SERVICE_VEHICLE_LABELS[serviceVehicleType]}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">მანძილი:</span>
                    <span className="font-medium">{distance} კმ</span>
                  </div>
                  {isScheduled && scheduledTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">დრო:</span>
                      <span className="font-medium">
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
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Step 6: Confirmation */}
          {currentStep === 6 && completedOrder && (
            <OrderConfirmation order={completedOrder} onNewOrder={handleNewOrder} />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto py-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} EXPRO.GE - ყველა უფლება დაცულია</p>
        </footer>
      </div>
    </GoogleMapsProvider>
  );
}
