import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create custom SVG Leaflet pin icons for Donor, NGO, and Driver
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.25);
      ">
        <span style="transform: rotate(45deg); font-size: 14px; color: white; font-weight: bold;">
          ${label}
        </span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34]
  });
};

// Pulsing animated driver GPS marker
const liveDriverIcon = L.divIcon({
  className: 'live-driver-marker',
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; items-center; justify-content: center;">
      <div style="
        position: absolute;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: rgba(37, 99, 235, 0.35);
        animation: pulse-ring 2s infinite ease-out;
      "></div>
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #2563eb;
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 13px;
        font-weight: bold;
      ">
        🛵
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

const donorIcon = createCustomIcon('#ea580c', '🍲'); // Orange
const ngoIcon = createCustomIcon('#059669', '🏠');   // Green
const driverIcon = createCustomIcon('#2563eb', '🛵'); // Blue

// Helper to auto-fit bounds if markers or polyline change
function MapBoundsUpdater({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const validPoints = points.filter(p => p && Number.isFinite(p[0]) && Number.isFinite(p[1]));
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [points, map]);
  return null;
}

export default function RescueMap({
  center = [26.4499, 74.6399],
  zoom = 13,
  donors = [],
  ngos = [],
  drivers = [],
  driverLocation = null, // [lat, lng] live GPS coordinates of current driver
  showNearestRadius = false,
  nearestRadiusMeters = 3000,
  activeRoute = null,
  height = '420px',
  className = ''
}) {
  // Collect all points for auto-centering
  const allCoordinates = [];

  if (driverLocation && Number.isFinite(driverLocation[0])) {
    allCoordinates.push(driverLocation);
  }

  if (activeRoute?.waypoints?.length > 0) {
    activeRoute.waypoints.forEach(pt => allCoordinates.push(pt));
  } else {
    donors.forEach(d => d.latitude && allCoordinates.push([d.latitude, d.longitude]));
    ngos.forEach(n => n.latitude && allCoordinates.push([n.latitude, n.longitude]));
    drivers.forEach(drv => drv.latitude && allCoordinates.push([drv.latitude, drv.longitude]));
  }

  return (
    <div style={{ height }} className={`w-full rounded-2xl overflow-hidden shadow-inner relative border border-slate-200 ${className}`}>
      <MapContainer
        center={driverLocation || center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto fit bounds */}
        {allCoordinates.length > 0 && <MapBoundsUpdater points={allCoordinates} />}

        {/* Nearest Rescue Area Radius Circle */}
        {showNearestRadius && driverLocation && (
          <Circle
            center={driverLocation}
            radius={nearestRadiusMeters}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#3b82f6',
              fillOpacity: 0.08,
              dashArray: '6, 6'
            }}
          />
        )}

        {/* Live Driver Moving GPS Marker */}
        {driverLocation && Number.isFinite(driverLocation[0]) && (
          <Marker position={driverLocation} icon={liveDriverIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  Your Live Location
                </span>
                <h4 className="font-bold text-xs mt-1 text-slate-900">Current Position (Live GPS)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Lat: {driverLocation[0].toFixed(4)}, Lng: {driverLocation[1].toFixed(4)}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  ● Tracking Active
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Route Polyline */}
        {activeRoute && activeRoute.waypoints?.length > 1 && (
          <Polyline
            positions={activeRoute.waypoints}
            pathOptions={{
              color: '#059669',
              weight: 5,
              opacity: 0.85,
              dashArray: '8, 8'
            }}
          />
        )}

        {/* Donor Markers */}
        {donors.map((d, idx) => (
          <Marker
            key={`donor-${d._id || idx}`}
            position={[d.latitude || 26.47, d.longitude || 74.64]}
            icon={donorIcon}
          >
            <Popup>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                  Food Donor (Pickup)
                </span>
                <h4 className="font-bold text-xs mt-1 text-slate-900">{d.foodName || d.name || 'Donor Location'}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{d.pickupAddress || d.address}</p>
                {d.quantity && (
                  <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                    Available: {d.quantity} {d.unit || 'kg'}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* NGO Markers with Capacity Verification Details */}
        {ngos.map((n, idx) => {
          const avail = n.availableCapacity ?? n.capacity ?? 100;
          const total = n.capacity ?? 100;
          const hasCapacity = avail > 0;

          return (
            <Marker
              key={`ngo-${n._id || idx}`}
              position={[n.latitude || 26.452, n.longitude || 74.636]}
              icon={ngoIcon}
            >
              <Popup>
                <div className="p-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Shelter Destination
                  </span>
                  <h4 className="font-bold text-xs mt-1 text-slate-900">{n.organizationName || n.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{n.address}</p>
                  
                  {/* Capacity Indicator */}
                  <div className="mt-2 pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-semibold">Shelter Intake Capacity:</span>
                    <span className={`text-[11px] font-bold ${hasCapacity ? 'text-emerald-700' : 'text-red-600'}`}>
                      {avail} / {total} meals free
                    </span>
                    <span className={`block text-[10px] font-semibold mt-0.5 ${hasCapacity ? 'text-emerald-600' : 'text-red-500'}`}>
                      {hasCapacity ? '✓ Capacity Verified' : '⚠️ Shelter Full'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Other Driver Markers */}
        {drivers.map((drv, idx) => (
          <Marker
            key={`driver-${drv._id || idx}`}
            position={[
              drv.currentLocation?.latitude || drv.latitude || 26.455,
              drv.currentLocation?.longitude || drv.longitude || 74.638
            ]}
            icon={driverIcon}
          >
            <Popup>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  Volunteer Driver
                </span>
                <h4 className="font-bold text-xs mt-1 text-slate-900">{drv.name || drv.vehicleNumber}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{drv.vehicleType}</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  {drv.availabilityStatus || 'Available'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
