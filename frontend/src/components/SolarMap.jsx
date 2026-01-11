import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { getRequest } from '../lib/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Shield, Zap, MapPin, ChevronRight, Activity } from 'lucide-react';
import './SolarMap.css';

// Import marker cluster
import MarkerClusterGroup from 'react-leaflet-cluster';

// Fix for default markers
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function SolarMap({ height = "500px", selectedRegion = "", isPublic = false }) {
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const mapRef = useRef(null);

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const endpoint = isPublic ? '/public/hierarchy' : '/superadmin/hierarchy';
      const response = await getRequest(endpoint);
      if (response.data && response.data.data) {
        setHierarchy(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch hierarchy:', error);
      // Fallback to minimal mock if API fails entirely
      if (isPublic) {
        setHierarchy([
          {
            region: "Public Network",
            plants: [
              { id: 'demo-1', name: "Demo Solar Plant", latitude: 20.5937, longitude: 78.9629, status: 'ACTIVE' }
            ]
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  // Sync map view with selected region
  useEffect(() => {
    if (selectedRegion && mapRef.current && hierarchy.length > 0) {
      const regionData = hierarchy.find(r => r.region === selectedRegion);
      if (regionData && regionData.plants.length > 0) {
        const firstPlant = regionData.plants[0];
        mapRef.current.setView([firstPlant.latitude, firstPlant.longitude], 8, { animate: true });
      }
    } else if (mapRef.current) {
      mapRef.current.setView([20.5937, 78.9629], 5, { animate: true });
    }
  }, [selectedRegion, hierarchy]);

  if (loading) {
    return (
      <div style={{ height }} className="w-full bg-solar-card/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-solar-border/30">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-solar-yellow border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-solar-muted font-medium">Loading System Hierarchy Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-solar-border/30 shadow-2xl bg-solar-night/80 backdrop-blur-xl group">
      <div style={{ height }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MarkerClusterGroup chunkedLoading>
            {hierarchy.map(region =>
              region.plants.map(plant => (
                <Marker
                  key={plant.id}
                  position={[plant.latitude, plant.longitude]}
                  icon={defaultIcon}
                  eventHandlers={{
                    click: () => setSelectedPlant(plant),
                  }}
                >
                  <Popup className="solar-popup">
                    <div className="p-3 w-64 bg-solar-card rounded-xl">
                      <div className="flex items-center justify-between mb-3 border-b border-solar-border/30 pb-2">
                        <div className="flex items-center space-x-2 truncate">
                          <div className={`w-2 h-2 flex-shrink-0 rounded-full ${plant?.status === 'ACTIVE' ? 'bg-solar-success' : 'bg-solar-warning'}`}></div>
                          <h3 className="font-bold text-solar-primary text-sm truncate">{plant?.name}</h3>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-solar-yellow leading-none">{plant?.current_output_kw?.toFixed(1)} kW</span>
                          <span className="text-[8px] text-solar-muted font-bold uppercase tracking-tighter">Live Output</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Hierarchy View: Admin -> Users */}
                        <div className="max-h-48 overflow-y-auto custom-scrollbar pr-1">
                          {plant?.admins && plant?.admins?.length > 0 ? (
                            plant?.admins?.map(admin => (
                              <div key={admin.id} className="mb-3 last:mb-0">
                                <div className="flex items-center text-[10px] font-bold text-solar-orange uppercase tracking-wider mb-1">
                                  <Shield size={10} className="mr-1" /> Admin: {admin?.name}
                                </div>
                                <div className="space-y-1 ml-2 border-l-2 border-solar-border/30 pl-2">
                                  {admin?.users?.map(user => (
                                    <div key={user.id} className="flex items-center justify-between text-[11px] text-solar-primary py-0.5 group/user">
                                      <div className="flex items-center truncate">
                                        <User size={8} className="mr-1 text-solar-muted" />
                                        <span className="truncate">{user?.name}</span>
                                      </div>
                                      <span className="text-[8px] text-solar-muted opacity-0 group-hover/user:opacity-100 transition-opacity">Online</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-solar-muted italic">No admins/users assigned yet</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-2 border-t border-solar-border/30 flex justify-between items-center text-[10px]">
                        <span className="text-solar-muted font-medium">Region: {region?.region}</span>
                        <span className="font-black text-solar-yellow">{plant?.status}</span>
                      </div>
                    </div>
                  </Popup>

                  <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                    <div className="text-xs font-bold">{plant?.name}</div>
                  </Tooltip>
                </Marker>
              ))
            )}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Map Interactive Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={fetchHierarchy}
          disabled={loading}
          className="bg-solar-card/90 backdrop-blur-md border border-solar-border/30 p-2 rounded-xl flex items-center space-x-3 shadow-lg hover:bg-solar-panel/20 transition-all group/sync active:scale-95 disabled:opacity-50"
          title="Click to refresh map data"
        >
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-solar-yellow animate-spin' : 'bg-solar-success animate-pulse'}`}></div>
            <span className="text-[10px] font-black text-solar-primary uppercase tracking-widest group-hover/sync:text-solar-yellow transition-colors">
              {loading ? 'Syncing...' : 'Live Hierarchy Sync'}
            </span>
          </div>
          <div className="h-3 w-px bg-solar-border/50"></div>
          <div className="text-[10px] text-solar-muted font-bold">
            {selectedRegion || 'All Regions'}
          </div>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-solar-card/90 backdrop-blur-md border border-solar-border/30 rounded-xl p-3 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 rounded-full bg-solar-orange"></div>
              <span className="text-[10px] font-bold text-solar-muted uppercase">Admin Layer</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 rounded-full bg-solar-success"></div>
              <span className="text-[10px] font-bold text-solar-muted uppercase">User Deployment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}