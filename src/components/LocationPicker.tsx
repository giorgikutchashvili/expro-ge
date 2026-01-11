'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Location } from '@/lib/types';
import { useTranslation } from '@/contexts/LanguageContext';

interface LocationPickerProps {
  pickup: Location | null;
  dropoff: Location | null;
  onPickupChange: (location: Location | null) => void;
  onDropoffChange: (location: Location | null) => void;
  distance: number | null;
  onDistanceChange: (distance: number | null) => void;
}

interface PlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
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

// Default Google Maps style with all buildings visible
const mapOptions: google.maps.MapOptions = {
  gestureHandling: "greedy",
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

export default function LocationPicker({
  pickup,
  dropoff,
  onPickupChange,
  onDropoffChange,
  distance,
  onDistanceChange,
}: LocationPickerProps) {
  const t = useTranslation();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [pickupInput, setPickupInput] = useState(pickup?.address || '');
  const [dropoffInput, setDropoffInput] = useState(dropoff?.address || '');
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);
  const [pickupError, setPickupError] = useState<string | null>(null);
  const [dropoffError, setDropoffError] = useState<string | null>(null);

  // Autocomplete suggestions (from Places API)
  const [pickupSuggestions, setPickupSuggestions] = useState<PlaceSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  // Loading states for autocomplete
  const [isLoadingPickupSuggestions, setIsLoadingPickupSuggestions] = useState(false);
  const [isLoadingDropoffSuggestions, setIsLoadingDropoffSuggestions] = useState(false);

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

  // Fetch autocomplete suggestions using new Places API
  const fetchAutocompleteSuggestions = useCallback(async (input: string, type: 'pickup' | 'dropoff') => {
    if (input.length < 2) {
      if (type === 'pickup') {
        setPickupSuggestions([]);
      } else {
        setDropoffSuggestions([]);
      }
      return;
    }

    if (type === 'pickup') {
      setIsLoadingPickupSuggestions(true);
    } else {
      setIsLoadingDropoffSuggestions(true);
    }

    try {
      const response = await fetch(
        'https://places.googleapis.com/v1/places:autocomplete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          },
          body: JSON.stringify({
            input: input,
            locationBias: {
              circle: {
                center: { latitude: 41.7151, longitude: 44.8271 },
                radius: 50000
              }
            },
            includedRegionCodes: ['GE'],
            languageCode: 'ka'
          })
        }
      );

      const data = await response.json();

      if (data.suggestions && data.suggestions.length > 0) {
        const suggestions: PlaceSuggestion[] = data.suggestions
          .slice(0, 5)
          .map((suggestion: { placePrediction?: { placeId: string; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } }; text?: { text: string } } }) => {
            const prediction = suggestion.placePrediction;
            if (!prediction) return null;
            return {
              placeId: prediction.placeId,
              mainText: prediction.structuredFormat?.mainText?.text || prediction.text?.text || '',
              secondaryText: prediction.structuredFormat?.secondaryText?.text || '',
              fullText: prediction.text?.text || '',
            };
          })
          .filter(Boolean) as PlaceSuggestion[];

        if (type === 'pickup') {
          setPickupSuggestions(suggestions);
          setShowPickupSuggestions(suggestions.length > 0);
        } else {
          setDropoffSuggestions(suggestions);
          setShowDropoffSuggestions(suggestions.length > 0);
        }
      } else {
        if (type === 'pickup') {
          setPickupSuggestions([]);
        } else {
          setDropoffSuggestions([]);
        }
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      // Fall back to empty suggestions on error
      if (type === 'pickup') {
        setPickupSuggestions([]);
      } else {
        setDropoffSuggestions([]);
      }
    } finally {
      if (type === 'pickup') {
        setIsLoadingPickupSuggestions(false);
      } else {
        setIsLoadingDropoffSuggestions(false);
      }
    }
  }, []);

  // Get place details from place ID using new Places API
  const getPlaceDetails = useCallback(async (placeId: string): Promise<Location | null> => {
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
            'X-Goog-FieldMask': 'displayName,formattedAddress,location'
          }
        }
      );

      const data = await response.json();

      if (data.location) {
        return {
          address: data.formattedAddress || data.displayName?.text || '',
          lat: data.location.latitude,
          lng: data.location.longitude,
        };
      }
      return null;
    } catch (error) {
      console.error('Place details error:', error);
      return null;
    }
  }, []);

  // Fallback: Search with Geocoder
  const searchWithGeocoder = useCallback((input: string, type: 'pickup' | 'dropoff') => {
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }

    if (type === 'pickup') {
      setIsSearchingPickup(true);
    } else {
      setIsSearchingDropoff(true);
    }

    geocoderRef.current.geocode(
      {
        address: input,
        region: 'ge',
        componentRestrictions: { country: 'ge' },
      },
      (results, status) => {
        if (type === 'pickup') {
          setIsSearchingPickup(false);
        } else {
          setIsSearchingDropoff(false);
        }

        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const location: Location = {
            address: result.formatted_address,
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          };

          if (type === 'pickup') {
            onPickupChange(location);
            setPickupInput(location.address);
            setShowPickupSuggestions(false);
            setPickupSuggestions([]);
            setMapCenter({ lat: location.lat, lng: location.lng });
            setMapZoom(15);
            setPickupError(null);
          } else {
            onDropoffChange(location);
            setDropoffInput(location.address);
            setShowDropoffSuggestions(false);
            setDropoffSuggestions([]);
            setDropoffError(null);
          }
        } else {
          if (type === 'pickup') {
            setPickupError(t.locationPicker.addressNotFound);
          } else {
            setDropoffError(t.locationPicker.addressNotFound);
          }
        }
      }
    );
  }, [onPickupChange, onDropoffChange, t.locationPicker.addressNotFound]);

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: PlaceSuggestion, type: 'pickup' | 'dropoff') => {
    // Get place details (coordinates) from place_id
    const location = await getPlaceDetails(suggestion.placeId);

    if (location) {
      if (type === 'pickup') {
        onPickupChange(location);
        setPickupInput(location.address);
        setShowPickupSuggestions(false);
        setPickupSuggestions([]);
        setMapCenter({ lat: location.lat, lng: location.lng });
        setMapZoom(15);
        setPickupError(null);
      } else {
        onDropoffChange(location);
        setDropoffInput(location.address);
        setShowDropoffSuggestions(false);
        setDropoffSuggestions([]);
        setDropoffError(null);
      }
    } else {
      // Fallback to geocoder if place details fail
      searchWithGeocoder(suggestion.fullText || suggestion.mainText, type);
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

  // Debounced autocomplete for pickup
  useEffect(() => {
    if (!pickupInput || pickupInput.length < 2 || pickup?.address === pickupInput) {
      return;
    }

    const timer = setTimeout(() => {
      fetchAutocompleteSuggestions(pickupInput, 'pickup');
    }, 300);

    return () => clearTimeout(timer);
  }, [pickupInput, pickup?.address, fetchAutocompleteSuggestions]);

  // Debounced autocomplete for dropoff
  useEffect(() => {
    if (!dropoffInput || dropoffInput.length < 2 || dropoff?.address === dropoffInput) {
      return;
    }

    const timer = setTimeout(() => {
      fetchAutocompleteSuggestions(dropoffInput, 'dropoff');
    }, 300);

    return () => clearTimeout(timer);
  }, [dropoffInput, dropoff?.address, fetchAutocompleteSuggestions]);

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
    if (e.target.value.length >= 2) {
      setShowPickupSuggestions(true);
    } else {
      setShowPickupSuggestions(false);
      setPickupSuggestions([]);
    }
  };

  const handleDropoffInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDropoffInput(e.target.value);
    setDropoffError(null);
    if (e.target.value.length >= 2) {
      setShowDropoffSuggestions(true);
    } else {
      setShowDropoffSuggestions(false);
      setDropoffSuggestions([]);
    }
  };

  const handlePickupSearch = () => {
    if (!pickupInput.trim()) {
      setPickupError(t.locationPicker.enterAddress);
      return;
    }
    setShowPickupSuggestions(false);
    searchWithGeocoder(pickupInput, 'pickup');
  };

  const handleDropoffSearch = () => {
    if (!dropoffInput.trim()) {
      setDropoffError(t.locationPicker.enterAddress);
      return;
    }
    setShowDropoffSuggestions(false);
    searchWithGeocoder(dropoffInput, 'dropoff');
  };

  const handlePickupKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (pickupSuggestions.length > 0) {
        handleSuggestionSelect(pickupSuggestions[0], 'pickup');
      } else {
        handlePickupSearch();
      }
    } else if (e.key === 'Escape') {
      setShowPickupSuggestions(false);
    }
  };

  const handleDropoffKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (dropoffSuggestions.length > 0) {
        handleSuggestionSelect(dropoffSuggestions[0], 'dropoff');
      } else {
        handleDropoffSearch();
      }
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
      <div className="bg-[#1E293B] rounded-xl p-4 sm:p-6 shadow-md space-y-3 sm:space-y-4 border border-[#475569]">
        <h3 className="text-base sm:text-lg font-semibold text-[#F8FAFC] mb-3 sm:mb-4">{t.locationPicker.title}</h3>

        {/* Pickup Input */}
        <div ref={pickupContainerRef}>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>{t.locationPicker.pickupLabel}</span>
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={pickupInput}
                onChange={handlePickupInputChange}
                onFocus={() => pickupInput.length >= 2 && setShowPickupSuggestions(true)}
                onKeyDown={handlePickupKeyDown}
                placeholder={t.locationPicker.pickupPlaceholder}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border rounded-lg focus:ring-2
                         focus:ring-blue-500 focus:border-transparent outline-none transition-all
                         text-sm sm:text-base text-[#F8FAFC] placeholder:text-[#64748B] bg-[#334155]
                         ${pickupError ? 'border-red-500' : 'border-[#475569]'}`}
              />
              {pickup ? (
                <button
                  onClick={clearPickup}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]
                           hover:text-[#F8FAFC] transition-colors z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : isLoadingPickupSuggestions && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 animate-spin text-[#94A3B8]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}

              {/* Pickup Suggestions Dropdown */}
              {showPickupSuggestions && pickupSuggestions.length > 0 && (
                <div
                  className="absolute left-0 right-0 sm:right-auto top-full mt-1 bg-[#1E293B] border border-[#475569] rounded-lg shadow-xl max-h-60 sm:max-h-72 overflow-y-auto sm:min-w-full sm:w-max sm:max-w-[500px]"
                  style={{ zIndex: 9999 }}
                >
                  {pickupSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.placeId}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion, 'pickup')}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-[#334155] border-b border-[#475569] last:border-b-0
                               flex items-start space-x-2 sm:space-x-3 transition-colors ${index === 0 ? 'bg-[#334155]/50' : ''}`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#F8FAFC] break-words">{suggestion.mainText}</p>
                        {suggestion.secondaryText && (
                          <p className="text-xs text-[#94A3B8] break-words line-clamp-2">{suggestion.secondaryText}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons row */}
            <div className="flex gap-2">
              {/* Search Button */}
              <button
                onClick={handlePickupSearch}
                disabled={isSearchingPickup}
                type="button"
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300
                         text-white rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2"
                title={t.locationPicker.search}
              >
                {isSearchingPickup ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                <span className="hidden sm:inline">{t.locationPicker.search}</span>
              </button>

              {/* Map Selection Button */}
              <button
                onClick={() => toggleSelectionMode('pickup')}
                type="button"
                className={`px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center
                          ${selectionMode === 'pickup'
                            ? 'bg-green-600 text-white'
                            : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'}`}
                title={t.locationPicker.selectOnMap}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
          {pickupError && (
            <p className="mt-1 text-xs sm:text-sm text-red-500">{pickupError}</p>
          )}
          {pickup && (
            <p className="mt-1 text-xs sm:text-sm text-green-600 flex items-start">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="break-words">{pickup.address}</span>
            </p>
          )}
        </div>

        {/* Dropoff Input */}
        <div ref={dropoffContainerRef}>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>{t.locationPicker.dropoffLabel}</span>
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={dropoffInput}
                onChange={handleDropoffInputChange}
                onFocus={() => dropoffInput.length >= 2 && setShowDropoffSuggestions(true)}
                onKeyDown={handleDropoffKeyDown}
                placeholder={t.locationPicker.dropoffPlaceholder}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border rounded-lg focus:ring-2
                         focus:ring-blue-500 focus:border-transparent outline-none transition-all
                         text-sm sm:text-base text-[#F8FAFC] placeholder:text-[#64748B] bg-[#334155]
                         ${dropoffError ? 'border-red-500' : 'border-[#475569]'}`}
              />
              {dropoff ? (
                <button
                  onClick={clearDropoff}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]
                           hover:text-[#F8FAFC] transition-colors z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : isLoadingDropoffSuggestions && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 animate-spin text-[#94A3B8]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}

              {/* Dropoff Suggestions Dropdown */}
              {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                <div
                  className="absolute left-0 right-0 sm:right-auto top-full mt-1 bg-[#1E293B] border border-[#475569] rounded-lg shadow-xl max-h-60 sm:max-h-72 overflow-y-auto sm:min-w-full sm:w-max sm:max-w-[500px]"
                  style={{ zIndex: 9999 }}
                >
                  {dropoffSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.placeId}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion, 'dropoff')}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-[#334155] border-b border-[#475569] last:border-b-0
                               flex items-start space-x-2 sm:space-x-3 transition-colors ${index === 0 ? 'bg-[#334155]/50' : ''}`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#F8FAFC] break-words">{suggestion.mainText}</p>
                        {suggestion.secondaryText && (
                          <p className="text-xs text-[#94A3B8] break-words line-clamp-2">{suggestion.secondaryText}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons row */}
            <div className="flex gap-2">
              {/* Search Button */}
              <button
                onClick={handleDropoffSearch}
                disabled={isSearchingDropoff}
                type="button"
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300
                         text-white rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2"
                title={t.locationPicker.search}
              >
                {isSearchingDropoff ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                <span className="hidden sm:inline">{t.locationPicker.search}</span>
              </button>

              {/* Map Selection Button */}
              <button
                onClick={() => toggleSelectionMode('dropoff')}
                type="button"
                className={`px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center
                          ${selectionMode === 'dropoff'
                            ? 'bg-red-600 text-white'
                            : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569]'}`}
                title={t.locationPicker.selectOnMap}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
          {dropoffError && (
            <p className="mt-1 text-xs sm:text-sm text-red-500">{dropoffError}</p>
          )}
          {dropoff && (
            <p className="mt-1 text-xs sm:text-sm text-green-600 flex items-start">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="break-words">{dropoff.address}</span>
            </p>
          )}
        </div>

        {/* Distance Display */}
        {distance !== null && (
          <div className="flex items-center justify-center bg-[#1E3A5F] rounded-lg p-4 mt-4 border border-[#3B82F6]">
            <svg className="w-5 h-5 text-[#60A5FA] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <span className="text-[#60A5FA] font-medium">
              {t.locationPicker.distance}: <span className="text-lg font-bold">{distance} {t.locationPicker.km}</span>
            </span>
          </div>
        )}
      </div>

      {/* Selection Mode Indicator */}
      {selectionMode && (
        <div className={`flex items-center justify-center p-3 rounded-lg ${
          selectionMode === 'pickup' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
        }`}>
          <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span className="font-medium">
            {selectionMode === 'pickup' ? t.locationPicker.clickToSelectPickup : t.locationPicker.clickToSelectDropoff}
          </span>
          <button
            onClick={() => setSelectionMode(null)}
            type="button"
            className="ml-3 text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Google Map */}
      <div
        className={`bg-[#1E293B] rounded-xl overflow-hidden shadow-md h-80 sm:h-96 border border-[#475569] ${
          selectionMode ? 'ring-4 ring-offset-2 ring-offset-[#0F172A] ' + (selectionMode === 'pickup' ? 'ring-green-400' : 'ring-red-400') : ''
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
