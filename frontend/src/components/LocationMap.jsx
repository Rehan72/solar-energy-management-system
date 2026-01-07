import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, Navigation } from 'lucide-react'

export default function LocationMap({ onLocationChange, initialLocation = null }) {
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [map, setMap] = useState(null)
  const mapInstanceRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [coordinates, setCoordinates] = useState({
    latitude: initialLocation?.latitude || null,
    longitude: initialLocation?.longitude || null
  })

  // Define functions before useEffects that use them
  const updateCoordinates = (lat, lng) => {
    const newCoords = { latitude: lat, longitude: lng }
    setCoordinates(newCoords)
    onLocationChange(newCoords)
  }

  const updateMarker = (lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else if (map) {
      const marker = window.L.marker([lat, lng], {
        draggable: true,
        icon: window.L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: #FFD700; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map)

      marker.on('dragend', (e) => {
        const { lat: newLat, lng: newLng } = e.target.getLatLng()
        updateCoordinates(newLat, newLng)
      })

      markerRef.current = marker
    }
  }

  // Sync coordinates when initialLocation changes from parent
  useEffect(() => {
    if (initialLocation?.latitude && initialLocation?.longitude) {
      const newCoords = {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude
      }
      setCoordinates(newCoords)
      
      if (mapInstanceRef.current) {
        updateMarker(initialLocation.latitude, initialLocation.longitude)
        mapInstanceRef.current.setView([initialLocation.latitude, initialLocation.longitude], 13)
      }
    }
  }, [initialLocation])

  // Watch for coordinates changes and update map accordingly
  useEffect(() => {
    if (mapInstanceRef.current && coordinates.latitude && coordinates.longitude) {
      updateMarker(coordinates.latitude, coordinates.longitude)
      mapInstanceRef.current.setView([coordinates.latitude, coordinates.longitude], 13)
    }
  }, [coordinates.latitude, coordinates.longitude])

  // Initialize map
  useEffect(() => {
    if (typeof window !== 'undefined' && window.L && mapRef.current && !map) {
      const mapInstance = window.L.map(mapRef.current).setView([20.5937, 78.9629], 5)

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance)

      setMap(mapInstance)

      // Handle map clicks
      mapInstance.on('click', (e) => {
        const { lat, lng } = e.latlng
        updateMarker(lat, lng)
        updateCoordinates(lat, lng)
      })

      // Add marker if coordinates exist
      if (coordinates.latitude && coordinates.longitude) {
        updateMarker(coordinates.latitude, coordinates.longitude)
        mapInstance.setView([coordinates.latitude, coordinates.longitude], 13)
      }
    }
  }, [map])


  const searchLocations = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=IN`
      )
      const data = await response.json()
      setSearchResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    }
  }

  const selectLocation = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    updateMarker(lat, lng)
    updateCoordinates(lat, lng)
    
    // Use mapInstanceRef.current instead of map state variable
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 13)
    }
    
    setSearchQuery(result.display_name)
    setShowResults(false)
  }

  const handleCoordinateChange = (field, value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    const newCoords = { ...coordinates, [field]: numValue }
    setCoordinates(newCoords)

    if (newCoords.latitude && newCoords.longitude) {
      updateMarker(newCoords.latitude, newCoords.longitude)
      map.setView([newCoords.latitude, newCoords.longitude], 13)
      onLocationChange(newCoords)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          updateMarker(latitude, longitude)
          updateCoordinates(latitude, longitude)
          map.setView([latitude, longitude], 13)
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-solar-primary mb-2">
        <MapPin className="w-4 h-4 inline mr-2" />
        Current Location (Optional)
      </label>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-solar-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              searchLocations(e.target.value)
            }}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-4 py-3 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
          />
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full bg-solar-card border border-solar-yellow rounded-lg mt-1 max-h-48 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => selectLocation(result)}
                className="w-full text-left px-4 py-2 hover:bg-solar-panel/20 text-solar-primary border-b border-solar-panel/20 last:border-b-0"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 bg-solar-night/80 border border-solar-yellow rounded-lg"
        />

        {/* Current Location Button */}
        <button
          type="button"
          onClick={getCurrentLocation}
          className="absolute top-2 right-2 z-10 p-2 bg-solar-card hover:bg-solar-panel/20 rounded-lg border border-solar-yellow"
          title="Use current location"
        >
          <Navigation className="w-4 h-4 text-solar-yellow" />
        </button>
      </div>

      {/* Coordinate Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-solar-primary mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={coordinates.latitude || ''}
            onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
            placeholder="e.g., 28.6139"
            className="w-full px-4 py-2 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-solar-primary mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={coordinates.longitude || ''}
            onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
            placeholder="e.g., 77.2090"
            className="w-full px-4 py-2 bg-solar-night/80 border border-solar-yellow rounded-lg text-solar-primary placeholder-solar-muted focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'rgb(255, 190, 61)' }}
          />
        </div>
      </div>

      <p className="text-xs text-solar-muted">
        Click on the map or drag the marker to set location. You can also search or enter coordinates manually.
      </p>
    </div>
  )
}