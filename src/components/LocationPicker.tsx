'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Location } from '@/lib/types';

interface LocationPickerProps {
  pickup: Location | null;
  dropoff: Location | null;
  onPickupChange: (location: Location | null) => void;
  onDropoffChange: (location: Location | null) => void;
  distance: number | null;
  onDistanceChange: (distance: number | null) => void;
}

interface Suggestion {
  address: string;
  lat: number;
  lng: number;
}

type SelectionMode = 'pickup' | 'dropoff' | null;

const defaultCenter = {
  lat: 41.7151,
  lng: 44.8271,
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  clickableIcons: false,
};

export default function LocationPicker({
  pickup,
  dropoff,
  onPickupChange,
  onDropoffChange,
  distance,
  onDistanceChange,
}: LocationPickerProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [pickupInput, setPickupInput] = useState(pickup?.address || '');
  const [dropoffInput, setDropoffInput] = useState(dropoff?.address || '');
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);
  const [pickupError, setPickupError] = useState<string | null>(null);
  const [dropoffError, setDropoffError] = useState<string | null>(null);

  // Autocomplete suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState<Suggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<Suggestion[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  // Map click selection mode
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const pickupContainerRef = useRef<HTMLDivElement>(null);
  const dropoffContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Geocoder when Google Maps is available
  useEffect(() => {
    if (typeof google !== 'undefined' && google.maps) {
      if (!geocoderRef.current) {
        geocoderRef.current = new google.maps.Geocoder();
      }
    }
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, []);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string | null> => {
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }

    return new Promise((resolve) => {
      geocoderRef.current!.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve(null);
          }
        }
      );
    });
  }, []);

  // Geocode address to coordinates
  const geocodeAddress = useCallback(async (address: string): Promise<Location | null> => {
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }

    return new Promise((resolve) => {
      geocoderRef.current!.geocode(
        {
          address: address,
          region: 'ge',
          componentRestrictions: { country: 'ge' },
        },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            resolve({
              address: result.formatted_address,
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }, []);

  // Fetch address suggestions using Geocoding API
  const fetchSuggestions = useCallback(async (input: string, type: 'pickup' | 'dropoff') => {
    if (!geocoderRef.current) {
      if (typeof google !== 'undefined' && google.maps) {
        geocoderRef.current = new google.maps.Geocoder();
      } else {
        return;
      }
    }

    if (input.length < 2) {
      if (type === 'pickup') {
        setPickupSuggestions([]);
      } else {
        setDropoffSuggestions([]);
      }
      return;
    }

    geocoderRef.current.geocode(
      {
        address: input,
        region: 'ge',
        componentRestrictions: { country: 'ge' },
      },
      (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          // Take up to 5 results as suggestions
          const suggestions: Suggestion[] = results.slice(0, 5).map((result) => ({
            address: result.formatted_address,
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          }));

          if (type === 'pickup') {
            setPickupSuggestions(suggestions);
          } else {
            setDropoffSuggestions(suggestions);
          }
        } else {
          if (type === 'pickup') {
            setPickupSuggestions([]);
          } else {
            setDropoffSuggestions([]);
          }
        }
      }
    );
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: Suggestion, type: 'pickup' | 'dropoff') => {
    const location: Location = {
      address: suggestion.address,
      lat: suggestion.lat,
      lng: suggestion.lng,
    };

    if (type === 'pickup') {
      onPickupChange(location);
      setPickupInput(location.address);
      setShowPickupSuggestions(false);
      setPickupSuggestions([]);
      setMapCenter({ lat: location.lat, lng: location.lng });
      setMapZoom(14);
    } else {
      onDropoffChange(location);
      setDropoffInput(location.address);
      setShowDropoffSuggestions(false);
      setDropoffSuggestions([]);
    }
  };

  // Handle map click
  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!selectionMode || !e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const address = await reverseGeocode(lat, lng);

    if (address) {
      const location: Location = { address, lat, lng };

      if (selectionMode === 'pickup') {
        onPickupChange(location);
        setPickupInput(address);
      } else {
        onDropoffChange(location);
        setDropoffInput(address);
      }
    }

    setSelectionMode(null);
  }, [selectionMode, reverseGeocode, onPickupChange, onDropoffChange]);

  // Debounced input change for autocomplete
  useEffect(() => {
    if (!pickupInput || pickupInput.length < 2) {
      setPickupSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      if (showPickupSuggestions) {
        fetchSuggestions(pickupInput, 'pickup');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pickupInput, showPickupSuggestions, fetchSuggestions]);

  useEffect(() => {
    if (!dropoffInput || dropoffInput.length < 2) {
      setDropoffSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      if (showDropoffSuggestions) {
        fetchSuggestions(dropoffInput, 'dropoff');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [dropoffInput, showDropoffSuggestions, fetchSuggestions]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickupContainerRef.current && !pickupContainerRef.current.contains(e.target as Node)) {
        setShowPickupSuggestions(false);
      }
      if (dropoffContainerRef.current && !dropoffContainerRef.current.contains(e.target as Node)) {
        setShowDropoffSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePickupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPickupInput(e.target.value);
    setPickupError(null);
    setShowPickupSuggestions(true);
  };

  const handleDropoffInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDropoffInput(e.target.value);
    setDropoffError(null);
    setShowDropoffSuggestions(true);
  };

  const handlePickupSearch = async () => {
    if (!pickupInput.trim()) {
      setPickupError('გთხოვთ შეიყვანოთ მისამართი');
      return;
    }

    setIsSearchingPickup(true);
    setPickupError(null);
    setShowPickupSuggestions(false);

    const location = await geocodeAddress(pickupInput);

    if (location) {
      onPickupChange(location);
      setPickupInput(location.address);
      setMapCenter({ lat: location.lat, lng: location.lng });
      setMapZoom(14);
    } else {
      setPickupError('მისამართი ვერ მოიძებნა');
    }

    setIsSearchingPickup(false);
  };

  const handleDropoffSearch = async () => {
    if (!dropoffInput.trim()) {
      setDropoffError('გთხოვთ შეიყვანოთ მისამართი');
      return;
    }

    setIsSearchingDropoff(true);
    setDropoffError(null);
    setShowDropoffSuggestions(false);

    const location = await geocodeAddress(dropoffInput);

    if (location) {
      onDropoffChange(location);
      setDropoffInput(location.address);
    } else {
      setDropoffError('მისამართი ვერ მოიძებნა');
    }

    setIsSearchingDropoff(false);
  };

  const handlePickupKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowPickupSuggestions(false);
      handlePickupSearch();
    } else if (e.key === 'Escape') {
      setShowPickupSuggestions(false);
    }
  };

  const handleDropoffKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowDropoffSuggestions(false);
      handleDropoffSearch();
    } else if (e.key === 'Escape') {
      setShowDropoffSuggestions(false);
    }
  };

  // Calculate route when both locations are set
  const calculateRoute = useCallback(async () => {
    if (!pickup || !dropoff) {
      setDirections(null);
      onDistanceChange(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: { lat: pickup.lat, lng: pickup.lng },
        destination: { lat: dropoff.lat, lng: dropoff.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(result);

      const route = result.routes[0];
      if (route && route.legs[0]) {
        const distanceInMeters = route.legs[0].distance?.value || 0;
        const distanceInKm = distanceInMeters / 1000;
        onDistanceChange(Math.round(distanceInKm * 10) / 10);
      }

      if (mapRef.current && result.routes[0]?.bounds) {
        mapRef.current.fitBounds(result.routes[0].bounds);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      setDirections(null);
      onDistanceChange(null);
    }
  }, [pickup, dropoff, onDistanceChange]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  const clearPickup = () => {
    onPickupChange(null);
    setPickupInput('');
    setPickupError(null);
    setPickupSuggestions([]);
    setShowPickupSuggestions(false);
    setDirections(null);
    onDistanceChange(null);
  };

  const clearDropoff = () => {
    onDropoffChange(null);
    setDropoffInput('');
    setDropoffError(null);
    setDropoffSuggestions([]);
    setShowDropoffSuggestions(false);
    setDirections(null);
    onDistanceChange(null);
  };

  const toggleSelectionMode = (mode: SelectionMode) => {
    setSelectionMode(selectionMode === mode ? null : mode);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Location Inputs */}
      <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">მისამართები</h3>

        {/* Pickup Input */}
        <div ref={pickupContainerRef}>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>აყვანის ადგილი</span>
            </span>
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={pickupInput}
                onChange={handlePickupInputChange}
                onFocus={() => setShowPickupSuggestions(true)}
                onKeyDown={handlePickupKeyDown}
                placeholder="მაგ: თავისუფლების მოედანი, თბილისი"
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2
                         focus:ring-blue-500 focus:border-transparent outline-none transition-all
                         text-gray-900 placeholder:text-gray-400 bg-white
                         ${pickupError ? 'border-red-300' : 'border-gray-200'}`}
              />
              {pickup && (
                <button
                  onClick={clearPickup}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                           hover:text-gray-600 transition-colors z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Pickup Suggestions Dropdown */}
              {showPickupSuggestions && pickupSuggestions.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                  style={{ zIndex: 9999 }}
                >
                  {pickupSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion, 'pickup')}
                      className="w-full px-4 py-3 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0
                               flex items-start space-x-3 transition-colors"
                    >
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">{suggestion.address}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handlePickupSearch}
              disabled={isSearchingPickup}
              type="button"
              className="px-3 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300
                       text-white rounded-lg transition-colors flex items-center"
              title="ძებნა"
            >
              {isSearchingPickup ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>

            {/* Map Selection Button */}
            <button
              onClick={() => toggleSelectionMode('pickup')}
              type="button"
              className={`px-3 py-3 rounded-lg transition-colors flex items-center
                        ${selectionMode === 'pickup'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="აირჩიეთ რუკაზე"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          {pickupError && (
            <p className="mt-1 text-sm text-red-500">{pickupError}</p>
          )}
          {pickup && (
            <p className="mt-1 text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {pickup.address}
            </p>
          )}
        </div>

        {/* Dropoff Input */}
        <div ref={dropoffContainerRef}>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>ჩაბარების ადგილი</span>
            </span>
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={dropoffInput}
                onChange={handleDropoffInputChange}
                onFocus={() => setShowDropoffSuggestions(true)}
                onKeyDown={handleDropoffKeyDown}
                placeholder="მაგ: თბილისის აეროპორტი"
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2
                         focus:ring-blue-500 focus:border-transparent outline-none transition-all
                         text-gray-900 placeholder:text-gray-400 bg-white
                         ${dropoffError ? 'border-red-300' : 'border-gray-200'}`}
              />
              {dropoff && (
                <button
                  onClick={clearDropoff}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                           hover:text-gray-600 transition-colors z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Dropoff Suggestions Dropdown */}
              {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                  style={{ zIndex: 9999 }}
                >
                  {dropoffSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion, 'dropoff')}
                      className="w-full px-4 py-3 text-left hover:bg-red-50 border-b border-gray-100 last:border-b-0
                               flex items-start space-x-3 transition-colors"
                    >
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">{suggestion.address}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleDropoffSearch}
              disabled={isSearchingDropoff}
              type="button"
              className="px-3 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300
                       text-white rounded-lg transition-colors flex items-center"
              title="ძებნა"
            >
              {isSearchingDropoff ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>

            {/* Map Selection Button */}
            <button
              onClick={() => toggleSelectionMode('dropoff')}
              type="button"
              className={`px-3 py-3 rounded-lg transition-colors flex items-center
                        ${selectionMode === 'dropoff'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="აირჩიეთ რუკაზე"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          {dropoffError && (
            <p className="mt-1 text-sm text-red-500">{dropoffError}</p>
          )}
          {dropoff && (
            <p className="mt-1 text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {dropoff.address}
            </p>
          )}
        </div>

        {/* Distance Display */}
        {distance !== null && (
          <div className="flex items-center justify-center bg-blue-50 rounded-lg p-4 mt-4">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <span className="text-blue-700 font-medium">
              მანძილი: <span className="text-lg font-bold">{distance} კმ</span>
            </span>
          </div>
        )}
      </div>

      {/* Selection Mode Indicator */}
      {selectionMode && (
        <div className={`flex items-center justify-center p-3 rounded-lg ${
          selectionMode === 'pickup' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span className="font-medium">
            დააწკაპუნეთ რუკაზე {selectionMode === 'pickup' ? 'აყვანის' : 'ჩაბარების'} ადგილის ასარჩევად
          </span>
          <button
            onClick={() => setSelectionMode(null)}
            type="button"
            className="ml-3 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Google Map */}
      <div
        className={`bg-white rounded-xl overflow-hidden shadow-md h-80 sm:h-96 ${
          selectionMode ? 'ring-4 ring-offset-2 ' + (selectionMode === 'pickup' ? 'ring-green-400' : 'ring-red-400') : ''
        }`}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          options={{
            ...mapOptions,
            draggableCursor: selectionMode ? 'crosshair' : undefined,
          }}
          onLoad={onMapLoad}
          onClick={handleMapClick}
        >
          {/* Pickup Marker */}
          {pickup && !directions && (
            <Marker
              position={{ lat: pickup.lat, lng: pickup.lng }}
              label={{
                text: 'A',
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          )}

          {/* Dropoff Marker */}
          {dropoff && !directions && (
            <Marker
              position={{ lat: dropoff.lat, lng: dropoff.lng }}
              label={{
                text: 'B',
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          )}

          {/* Route */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: '#3b82f6',
                  strokeWeight: 5,
                },
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
