import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import geoData from '../../../data/geojson/nag_river_segments.json';

// Custom Map Marker Pin for Ground Photos
const photoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function getPriorityColor(level) {
  switch (level) {
    case 'Critical': return '#EF4444';  // 🔴 Red
    case 'High': return '#F97316';      // 🟠 Orange
    case 'Moderate': return '#F59E0B';  // 🟡 Yellow
    case 'Low':
    default: return '#10B981';         // 🟢 Green
  }
}

export default function MapView({ segments, selectedSegmentId, onSelectSegment }) {
  // Center map on Nag River, Nagpur (approx [21.138, 79.080])
  const nagpurCenter = [21.142, 79.095];

  const styleGeoJson = (feature) => {
    const matched = segments.find(s => s.segment_id === feature.properties.segment_id);
    const priority = matched ? matched.priority_level : feature.properties.priority_level;
    const isSelected = feature.properties.segment_id === selectedSegmentId;

    return {
      color: getPriorityColor(priority),
      weight: isSelected ? 8 : 5,
      opacity: isSelected ? 1.0 : 0.85,
      lineCap: 'round'
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => {
        onSelectSegment(feature.properties.segment_id);
      }
    });
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={nagpurCenter}
        zoom={13}
        className="w-full h-full z-10"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <GeoJSON
          key={JSON.stringify(segments)}
          data={geoData}
          style={styleGeoJson}
          onEachFeature={onEachFeature}
        />

        {/* Render Ground Photo Markers */}
        {segments.map((seg) => {
          if (!seg.centroid) return null;
          const isCriticalOrHigh = seg.priority_level === 'Critical' || seg.priority_level === 'High';
          return (
            <Marker
              key={`marker-${seg.segment_id}`}
              position={seg.centroid}
              icon={photoIcon}
              eventHandlers={{
                click: () => onSelectSegment(seg.segment_id)
              }}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-sm text-gray-100">{seg.name}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded text-white" style={{ backgroundColor: getPriorityColor(seg.priority_level) }}>
                      {seg.priority_level} Priority
                    </span>
                    <span className="text-xs text-gray-300 font-mono">
                      Score: {seg.investigation_priority_score}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Floating Overlay */}
      <div className="absolute bottom-6 left-6 z-20 bg-dark-800/90 backdrop-blur border border-dark-700 p-3 rounded-xl shadow-xl max-w-xs">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Investigation Priority</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-priority-low"></span>
            <span className="text-gray-300">🟢 Low (0-25)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-priority-moderate"></span>
            <span className="text-gray-300">🟡 Moderate (26-50)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-priority-high"></span>
            <span className="text-gray-300">🟠 High (51-75)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-priority-critical"></span>
            <span className="text-gray-300">🔴 Critical (76-100)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
