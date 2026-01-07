
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Navigation, Search, X, MapPin } from 'lucide-react'

// Fix for default marker icon in Leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom draggable marker icon
const draggableIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Component to handle map events and make marker draggable
function DraggableMarker({ position, setPosition }) {
  const markerRef = useRef(null)

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng)
      }
    },
  })

  useEffect(() => {
    if (markerRef.current) {
      const marker = markerRef.current
      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng()
        setPosition(newPos)
      })
    }
  }, [setPosition])

  return position ? (
    <Marker
      ref={markerRef}
      position={position}
      icon={draggableIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const newPos = e.target.getLatLng()
          setPosition(newPos)
        },
      }}
    />
  ) : null
}

// Component to handle search result clicks
function SearchResultMarker({ position }) {
  useMap().setView(position, 13)
  return null
}

const LocationPicker = ({
  latitude,
  longitude,
  onLocationChange,
  className = "",
  placeholder = "Search for a location (e.g., Delhi, India)"
}) => {
  const [mapPosition, setMapPosition] = useState(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  )
  const [showMap, setShowMap] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const searchInputRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  // Update map position when props change
  useEffect(() => {
    if (latitude !== null && latitude !== undefined &&
        longitude !== null && longitude !== undefined &&
        !isNaN(latitude) && !isNaN(longitude)) {
      setMapPosition({ lat: latitude, lng: longitude })
    } else {
      setMapPosition(null)
    }
  }, [latitude, longitude])

  // Update parent component when map position changes
  const handlePositionChange = (newPosition) => {
    setMapPosition(newPosition)
    if (onLocationChange) {
      onLocationChange({
        latitude: newPosition.lat,
        longitude: newPosition.lng
      })
    }
  }

  // Search location using Nominatim (OpenStreetMap)
  const searchLocation = (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
        )
        const data = await response.json()

        const results = data.map(item => ({
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          display_name: item.display_name,
          address: item.address,
          type: item.type
        }))

        setSearchResults(results)
      } catch (error) {
        console.error('Error searching location:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500)
  }

  const handleLocationSearchChange = (e) => {
    const value = e.target.value
    setLocationSearch(value)
    searchLocation(value)
  }

  const selectSearchResult = (result) => {
    const newPos = { lat: result.lat, lng: result.lon }
    handlePositionChange(newPos)
    setLocationSearch(result.display_name)
    setSearchResults([])
    setShowMap(true)
  }

  const clearLocationSearch = () => {
    setLocationSearch('')
    setSearchResults([])
  }

  const clearMapLocation = () => {
    setMapPosition(null)
    if (onLocationChange) {
      onLocationChange({ latitude: null, longitude: null })
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const newPos = { lat: latitude, lng: longitude }
          handlePositionChange(newPos)
          setShowMap(true)
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  // Calculate dropdown position when results are available
  const updateDropdownPosition = () => {
    if (searchResults.length > 0 && searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
  }

  useEffect(() => {
    updateDropdownPosition()
  }, [searchResults.length])

  // Update dropdown position on scroll
  useEffect(() => {
    if (searchResults.length > 0) {
      window.addEventListener('scroll', updateDropdownPosition, true)
      return () => window.removeEventListener('scroll', updateDropdownPosition, true)
    }
  }, [searchResults.length])

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        // Don't close immediately to allow clicking on dropdown
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Search Results Dropdown (rendered via Portal)
  const searchResultsDropdown = searchResults.length > 0 ? (
    <div
      className="fixed z-[9999] bg-[#ffffff] border border-solar-yellow/30 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width
      }}
    >
      {searchResults.map((result, index) => (
        <button
          key={index}
          type="button"
          onClick={() => selectSearchResult(result)}
          className="w-full text-left px-4 py-3 hover:bg-solar-panel/50 border-b border-solar-yellow/10 last:border-b-0 transition-colors"
        >
          <p className="text-sm text-solar-primary truncate">{result.display_name}</p>
        </button>
      ))}
    </div>
  ) : null

  return (
    <>
      {createPortal(searchResultsDropdown, document.body)}
      <div className={`space-y-4 ${className}`}>
        {/* Location Search */}
        <div className="relative isolate overflow-visible">
          <label className="block text-sm font-medium text-solar-primary mb-2">
            Search Location
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={locationSearch}
              onChange={handleLocationSearchChange}
              className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2 pl-10"
              style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
              placeholder={placeholder}
            />
            <Search className="w-5 h-5 text-solar-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
            {locationSearch && (
              <button
                type="button"
                onClick={clearLocationSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-solar-muted hover:text-solar-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-solar-yellow border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={getCurrentLocation}
          className="flex items-center space-x-2 px-4 py-2 bg-solar-yellow/20 border border-solar-yellow/30 rounded-lg text-solar-yellow hover:bg-solar-yellow/30 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          <span>Get Current Location</span>
        </button>

        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center space-x-2 px-4 py-2 bg-solar-panel/50 border border-solar-yellow/30 rounded-lg text-solar-primary hover:bg-solar-panel/80 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
        </button>

        {mapPosition && (
          <button
            type="button"
            onClick={clearMapLocation}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600/20 border border-red-600/30 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors text-sm"
          >
            <X className="w-3 h-3" />
            <span>Clear Location</span>
          </button>
        )}
      </div>

      {/* Latitude/Longitude Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-solar-primary mb-2">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={latitude || ''}
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : null
              if (value !== null && value !== undefined && !isNaN(value) && longitude !== null && longitude !== undefined && !isNaN(longitude)) {
                handlePositionChange({ lat: value, lng: longitude })
              } else if (onLocationChange) {
                onLocationChange({ latitude: value, longitude })
              }
            }}
            className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
            placeholder="Latitude"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-solar-primary mb-2">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={longitude || ''}
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : null
              if (value !== null && value !== undefined && !isNaN(value) && latitude !== null && latitude !== undefined && !isNaN(latitude)) {
                handlePositionChange({ lat: latitude, lng: value })
              } else if (onLocationChange) {
                onLocationChange({ latitude, longitude: value })
              }
            }}
            className="w-full px-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
            placeholder="Longitude"
          />
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div className="h-96 rounded-lg overflow-hidden border border-solar-yellow/30 relative">
          {mapPosition && mapPosition.lat !== undefined && mapPosition.lng !== undefined ? (
            <MapContainer
              center={[mapPosition.lat, mapPosition.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DraggableMarker
                position={mapPosition}
                setPosition={handlePositionChange}
              />
            </MapContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-solar-night/80">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-solar-muted mx-auto mb-2" />
                <p className="text-solar-muted">No location selected</p>
                <p className="text-xs text-solar-muted mt-1">Click on the map, search, or use "Get Current Location"</p>
              </div>
            </div>
          )}
          <p className="absolute bottom-2 left-2 text-xs text-solar-primary bg-solar-card/80 px-2 py-1 rounded">
            💡 Drag the marker or click on the map to set location
          </p>
        </div>
      )}
    </div>
    </>
  )
}

export default LocationPicker