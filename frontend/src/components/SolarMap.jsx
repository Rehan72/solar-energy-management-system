import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './SolarMap.css';

// Import marker cluster
import MarkerClusterGroup from 'react-leaflet-cluster';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom animated solar icons
const createSolarIcon = (status, size = 30) => {
  const color = status === 'active' ? '#f59e0b' : '#ef4444';
  const pulseColor = status === 'active' ? '#fbbf24' : '#dc2626';
  
  return new L.DivIcon({
    html: `
      <div class="solar-marker-container">
        <div class="solar-marker-pulse" style="--pulse-color: ${pulseColor}"></div>
        <div class="solar-marker" style="border-color: ${color}">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="${color}" opacity="0.9"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" 
                  stroke="white" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        </div>
        <div class="energy-glow"></div>
      </div>
    `,
    className: 'custom-solar-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

// Generate realistic solar farm data
const generateSolarFarms = () => {
  const cities = [
    { name: 'Delhi', lat: 28.6139, lng: 77.2090, state: 'Delhi' },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, state: 'Telangana' },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  ];

  const solarFarms = [];
  const farmTypes = ['Residential', 'Commercial', 'Industrial', 'Utility'];
  const statuses = ['active', 'active', 'active', 'maintenance', 'offline'];

  cities.forEach((city, index) => {
    const farmsCount = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < farmsCount; i++) {
      const lat = city.lat + (Math.random() - 0.5) * 0.5;
      const lng = city.lng + (Math.random() - 0.5) * 0.5;
      
      const type = farmTypes[Math.floor(Math.random() * farmTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const capacity = type === 'Utility' ? 
        (Math.random() * 5 + 5).toFixed(1) :
        type === 'Industrial' ? 
          (Math.random() * 2 + 1).toFixed(1) :
          (Math.random() * 0.9 + 0.1).toFixed(1);
      
      const generation = status === 'active' ? 
        (Math.random() * 0.7 + 0.3).toFixed(1) : 0;
      
      solarFarms.push({
        id: `${city.name}-${i}`,
        name: `${city.name} Solar Farm ${i + 1}`,
        location: city.name,
        state: city.state,
        lat,
        lng,
        type,
        status,
        capacity: `${capacity} MW`,
        generation: `${generation} MW`,
        efficiency: status === 'active' ? `${(generation / capacity * 100).toFixed(1)}%` : '0%',
        co2Reduction: `${(generation * 0.7).toFixed(1)} tons/day`,
        lastUpdate: `${Math.floor(Math.random() * 60)} minutes ago`,
      });
    }
  });

  return solarFarms;
};

// Power grid connections
const generateGridConnections = (farms) => {
  const connections = [];
  const groupedByState = {};
  
  farms.forEach(farm => {
    if (!groupedByState[farm.state]) {
      groupedByState[farm.state] = [];
    }
    groupedByState[farm.state].push(farm);
  });
  
  Object.values(groupedByState).forEach(stateFarms => {
    if (stateFarms.length > 1) {
      const hub = stateFarms[0];
      for (let i = 1; i < Math.min(stateFarms.length, 4); i++) {
        connections.push({
          from: hub,
          to: stateFarms[i],
          status: 'active',
          capacity: '100kV'
        });
      }
    }
  });
  
  return connections;
};

export default function SolarMap() {
  const [solarFarms, setSolarFarms] = useState([]);
  const [gridConnections, setGridConnections] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [showConnections, setShowConnections] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false); // Disabled by default to fix black screen
  const mapRef = useRef(null);
  const rotateIntervalRef = useRef(null);

  const center = [20.5937, 78.9629];
  const indiaBounds = [[6.462, 68.109], [35.513, 97.395]];

  // Initialize data
  useEffect(() => {
    const farms = generateSolarFarms();
    setSolarFarms(farms);
    setGridConnections(generateGridConnections(farms));
  }, []);

  // Time of day simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const hours = new Date().getHours();
      if (hours >= 6 && hours < 18) {
        setTimeOfDay('day');
      } else {
        setTimeOfDay('night');
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Fixed auto-rotate with proper bounds checking
  useEffect(() => {
    if (rotateIntervalRef.current) {
      clearInterval(rotateIntervalRef.current);
      rotateIntervalRef.current = null;
    }

    if (autoRotate && mapRef.current) {
      let currentZoom = 5;
      let isZoomingOut = true;
      
      rotateIntervalRef.current = setInterval(() => {
        if (!mapRef.current) return;
        
        const currentCenter = mapRef.current.getCenter();
        
        if (isZoomingOut) {
          currentZoom -= 0.05;
          if (currentZoom <= 4) { // Don't go below minZoom
            isZoomingOut = false;
          }
        } else {
          currentZoom += 0.05;
          if (currentZoom >= 5) { // Back to original zoom
            isZoomingOut = true;
          }
        }
        
        // Ensure zoom stays within bounds
        const boundedZoom = Math.max(4, Math.min(6, currentZoom));
        mapRef.current.setView(currentCenter, boundedZoom);
      }, 2000); // Slower rotation
    }

    return () => {
      if (rotateIntervalRef.current) {
        clearInterval(rotateIntervalRef.current);
      }
    };
  }, [autoRotate]);

  // Handle map initialization
  const handleMapReady = () => {
    if (mapRef.current) {
      mapRef.current.fitBounds(indiaBounds);
    }
  };

  // Get color based on status
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#10b981';
      case 'maintenance': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch(type) {
      case 'Residential': return '#3b82f6';
      case 'Commercial': return '#8b5cf6';
      case 'Industrial': return '#f59e0b';
      case 'Utility': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="solar-map-container relative w-full h-96 rounded-2xl overflow-hidden border border-solar-primary shadow-2xl bg-solar-night/80 backdrop-blur-xl">
      {/* Map Controls - REMOVED LIVE STATS */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setShowConnections(!showConnections)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showConnections 
                ? 'bg-solar-yellow text-solar-dark' 
                : 'bg-solar-card/90 text-solar-primary'
            } backdrop-blur-sm border border-solar-border`}
          >
            {showConnections ? 'Hide Grid' : 'Show Grid'}
          </button>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showHeatmap 
                ? 'bg-solar-yellow text-solar-dark' 
                : 'bg-solar-card/90 text-solar-primary'
            } backdrop-blur-sm border border-solar-border`}
          >
            {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              autoRotate 
                ? 'bg-solar-yellow text-solar-dark' 
                : 'bg-solar-card/90 text-solar-primary'
            } backdrop-blur-sm border border-solar-border`}
          >
            {autoRotate ? 'Pause' : 'Auto'}
          </button>
        </div>
      </div>

      {/* Time of Day Indicator */}
      {/* <div className="absolute top-4 left-4 z-[1000]">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-solar-card/90 backdrop-blur-sm border border-solar-border">
          <div className={`w-3 h-3 rounded-full ${timeOfDay === 'day' ? 'bg-solar-yellow' : 'bg-solar-panel'}`} />
          <span className="text-xs font-medium text-solar-primary">
            {timeOfDay === 'day' ? 'Day Time' : 'Night Time'}
          </span>
        </div>
      </div> */}

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        whenReady={handleMapReady}
        ref={mapRef}
        minZoom={4}
        maxZoom={8} // Reduced max zoom to prevent black screen
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0}
      >
        {/* Dynamic Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={timeOfDay === 'day' 
            ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          }
        />

        {/* Heatmap Layer */}
        {showHeatmap && solarFarms.map(farm => (
          <Circle
            key={`heat-${farm.id}`}
            center={[farm.lat, farm.lng]}
            radius={parseFloat(farm.capacity) * 1500}
            pathOptions={{
              fillColor: getStatusColor(farm.status),
              fillOpacity: 0.1,
              color: getStatusColor(farm.status),
              opacity: 0.3,
              weight: 1,
            }}
          />
        ))}

        {/* Grid Connections */}
        {showConnections && gridConnections.map((conn, idx) => (
          <Polyline
            key={`conn-${idx}`}
            positions={[
              [conn.from.lat, conn.from.lng],
              [conn.to.lat, conn.to.lng]
            ]}
            pathOptions={{
              color: '#f59e0b',
              weight: 1,
              opacity: 0.6,
              dashArray: '5, 10',
              className: 'power-line'
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="text-xs">
                {conn.from.location} ↔ {conn.to.location}<br/>
                Capacity: {conn.capacity}
              </div>
            </Tooltip>
          </Polyline>
        ))}

        {/* Marker Cluster Group */}
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          spiderfyOnMaxZoom={true}
          maxClusterRadius={50}
        >
          {solarFarms.map((farm) => (
            <Marker
              key={farm.id}
              position={[farm.lat, farm.lng]}
              icon={createSolarIcon(farm.status, 30)}
              eventHandlers={{
                click: () => setSelectedFarm(farm),
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup()
              }}
            >
              <Popup>
                <div className="solar-farm-popup">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(farm.status) }}
                    />
                    <h3 className="font-bold text-solar-primary">{farm.name}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-solar-muted">Location:</span>
                      <span className="font-medium">{farm.location}, {farm.state}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-solar-muted">Type:</span>
                      <span 
                        className="font-medium px-2 py-0.5 rounded text-xs"
                        style={{ 
                          backgroundColor: `${getTypeColor(farm.type)}20`,
                          color: getTypeColor(farm.type)
                        }}
                      >
                        {farm.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-solar-muted">Capacity</p>
                        <p className="font-bold text-solar-panel">{farm.capacity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-solar-muted">Generation</p>
                        <p className="font-bold text-solar-yellow">{farm.generation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-solar-muted">Efficiency</p>
                        <p className="font-bold text-solar-success">{farm.efficiency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-solar-muted">CO₂ Reduction</p>
                        <p className="font-bold text-green-500">{farm.co2Reduction}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-solar-border">
                      <p className="text-xs text-solar-muted">Last Update: {farm.lastUpdate}</p>
                    </div>
                  </div>
                </div>
              </Popup>
              
              <Tooltip direction="top" offset={[0, -15]} opacity={0.9} permanent={false}>
                <div className="text-xs">
                  <strong>{farm.name}</strong><br/>
                  {farm.generation} / {farm.capacity}
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* Selected Farm Highlight */}
        {selectedFarm && (
          <Circle
            center={[selectedFarm.lat, selectedFarm.lng]}
            radius={5000}
            pathOptions={{
              fillColor: '#f59e0b',
              fillOpacity: 0.1,
              color: '#f59e0b',
              opacity: 0.8,
              weight: 2,
              dashArray: '5, 5'
            }}
          />
        )}

        {/* Sun Position Indicator */}
        <Circle
          center={[28.6, 77.2]}
          radius={80000}
          pathOptions={{
            fillColor: '#fbbf24',
            fillOpacity: timeOfDay === 'day' ? 0.05 : 0,
            color: '#f59e0b',
            opacity: timeOfDay === 'day' ? 0.3 : 0,
            weight: 1,
          }}
        />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-solar-card/90 backdrop-blur-sm border border-solar-border rounded-lg p-3">
          <h4 className="text-xs font-semibold text-solar-primary mb-2">Legend</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-solar-primary">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-solar-primary">Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-solar-primary">Offline</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-solar-border">
              <div className="w-3 h-3 rounded-full border-2 border-solar-yellow"></div>
              <span className="text-xs text-solar-primary">Grid Lines</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Farm Details */}
      {selectedFarm && (
        <div className="absolute bottom-4 right-4 z-[1000] w-64">
          <div className="bg-solar-card/95 backdrop-blur-sm border border-solar-yellow rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-solar-primary">{selectedFarm.name}</h3>
              <button 
                onClick={() => setSelectedFarm(null)}
                className="text-solar-muted hover:text-solar-primary"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-solar-muted">Current Status</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getStatusColor(selectedFarm.status) }}
                  />
                  <span className="text-sm font-medium capitalize">{selectedFarm.status}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-solar-bg rounded p-2">
                  <p className="text-xs text-solar-muted">Generation</p>
                  <p className="text-lg font-bold text-solar-yellow">{selectedFarm.generation}</p>
                </div>
                <div className="bg-solar-bg rounded p-2">
                  <p className="text-xs text-solar-muted">Capacity</p>
                  <p className="text-lg font-bold text-solar-panel">{selectedFarm.capacity}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-solar-border">
                <p className="text-xs text-solar-muted mb-1">Efficiency</p>
                <div className="w-full bg-solar-border rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-solar-success to-solar-yellow"
                    style={{ width: selectedFarm.efficiency }}
                  />
                </div>
                <p className="text-right text-xs font-medium mt-1">{selectedFarm.efficiency}</p>
              </div>
              
              <button className="w-full mt-2 py-2 bg-solar-yellow/20 text-solar-yellow rounded-lg text-sm font-medium hover:bg-solar-yellow/30 transition-colors">
                View Detailed Analytics →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}