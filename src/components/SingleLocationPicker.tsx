'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { Location } from '@/lib/types';
import { useTranslation } from '@/contexts/LanguageContext';

interface SingleLocationPickerProps {
  location: Location | null;
  onLocationChange: (location: Location | null) => void;
  label?: string;
}

interface PlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

const defaultCenter = {
  lat: 41.7151,
  lng: 44.8271,
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  gestureHandling: "greedy",
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

export default function SingleLocationPicker({
  location,
  onLocationChange,
  label,
}: SingleLocationPickerProps) {
  const t = useTranslation();
  const displayLabel = label || t.locationPicker.addressLabel;
  const [addressInput, setAddressInput] = useState(location?.address || '');
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);
  const [isSearching, setIsSearching] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const fetchAutocompleteSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);

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
        const newSuggestions: PlaceSuggestion[] = data.suggestions
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

        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

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

  const searchWithGeocoder = useCallback((input: string) => {
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }

    setIsSearching(true);

    geocoderRef.current.geocode(
      {
        address: input,
        region: 'ge',
        componentRestrictions: { country: 'ge' },
      },
      (results, status) => {
        setIsSearching(false);

        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const loc: Location = {
            address: result.formatted_address,
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          };

          onLocationChange(loc);
          setAddressInput(loc.address);
          setShowSuggestions(false);
          setSuggestions([]);
          setMapCenter({ lat: loc.lat, lng: loc.lng });
          setMapZoom(15);
          setAddressError(null);
        } else {
          setAddressError(t.locationPicker.addressNotFound);
        }
      }
    );
  }, [onLocationChange, t.locationPicker.addressNotFound]);

  const handleSuggestionSelect = async (suggestion: PlaceSuggestion) => {
    const loc = await getPlaceDetails(suggestion.placeId);

    if (loc) {
      onLocationChange(loc);
      setAddressInput(loc.address);
      setShowSuggestions(false);
      setSuggestions([]);
      setMapCenter({ lat: loc.lat, lng: loc.lng });
      setMapZoom(15);
      setAddressError(null);
    } else {
      searchWithGeocoder(suggestion.fullText || suggestion.mainText);
    }
  };

  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!selectionMode || !e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const address = await reverseGeocode(lat, lng);

    if (address) {
      const loc: Location = { address, lat, lng };
      onLocationChange(loc);
      setAddressInput(address);
    }

    setSelectionMode(false);
  }, [selectionMode, reverseGeocode, onLocationChange]);

  useEffect(() => {
    if (!addressInput || addressInput.length < 2 || location?.address === addressInput) {
      return;
    }

    const timer = setTimeout(() => {
      fetchAutocompleteSuggestions(addressInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [addressInput, location?.address, fetchAutocompleteSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value);
    setAddressError(null);
    if (e.target.value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSearch = () => {
    if (!addressInput.trim()) {
      setAddressError(t.locationPicker.enterAddress);
      return;
    }
    setShowSuggestions(false);
    searchWithGeocoder(addressInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSuggestionSelect(suggestions[0]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const clearLocation = () => {
    onLocationChange(null);
    setAddressInput('');
    setAddressError(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Location Input */}
      <div className="bg-[#1E293B] rounded-xl p-4 sm:p-6 shadow-md space-y-3 sm:space-y-4 border border-[#475569]">
        <h3 className="text-base sm:text-lg font-semibold text-[#F8FAFC] mb-3 sm:mb-4">{displayLabel}</h3>

        <div ref={containerRef}>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-[#10B981] rounded-full"></span>
              <span>{t.locationPicker.addressLabel}</span>
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={addressInput}
                onChange={handleInputChange}
                onFocus={() => addressInput.length >= 2 && setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder={t.locationPicker.addressPlaceholder}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 border rounded-lg focus:ring-2
                         focus:ring-[#10B981] focus:border-transparent outline-none transition-all
                         text-sm sm:text-base text-[#F8FAFC] placeholder:text-[#64748B] bg-[#334155]
                         ${addressError ? 'border-red-500' : 'border-[#475569]'}`}
              />
              {location ? (
                <button
                  onClick={clearLocation}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]
                           hover:text-[#F8FAFC] transition-colors z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : isLoadingSuggestions && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 animate-spin text-[#94A3B8]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="absolute left-0 right-0 sm:right-auto top-full mt-1 bg-[#1E293B] border border-[#475569] rounded-lg shadow-xl max-h-60 sm:max-h-72 overflow-y-auto sm:min-w-full sm:w-max sm:max-w-[500px]"
                  style={{ zIndex: 9999 }}
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.placeId}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-[#334155] border-b border-[#475569] last:border-b-0
                               flex items-start space-x-2 sm:space-x-3 transition-colors ${index === 0 ? 'bg-[#334155]/50' : ''}`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#10B981] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                onClick={handleSearch}
                disabled={isSearching}
                type="button"
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#10B981]/50
                         text-white rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2"
                title={t.locationPicker.search}
              >
                {isSearching ? (
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
                onClick={() => setSelectionMode(!selectionMode)}
                type="button"
                className={`px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center
                          ${selectionMode
                            ? 'bg-[#10B981] text-white'
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
          {addressError && (
            <p className="mt-1 text-xs sm:text-sm text-red-500">{addressError}</p>
          )}
          {location && (
            <p className="mt-1 text-xs sm:text-sm text-[#10B981] flex items-start">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="break-words">{location.address}</span>
            </p>
          )}
        </div>
      </div>

      {/* Selection Mode Indicator */}
      {selectionMode && (
        <div className="flex items-center justify-center p-3 rounded-lg bg-[#10B981]/20 text-[#10B981]">
          <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span className="font-medium">{t.locationPicker.clickToSelect}</span>
          <button
            onClick={() => setSelectionMode(false)}
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
          selectionMode ? 'ring-4 ring-offset-2 ring-offset-[#0F172A] ring-[#10B981]' : ''
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
          {/* Location Marker */}
          {location && (
            <Marker
              position={{ lat: location.lat, lng: location.lng }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#10B981',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
