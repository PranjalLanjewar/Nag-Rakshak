import React from 'react';
import { Satellite, Eye, AlertTriangle, CheckCircle2, ShieldCheck, FileText, Camera } from 'lucide-react';

function getPriorityBadgeClass(level) {
  switch (level) {
    case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
    case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    case 'Moderate': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'Low':
    default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  }
}

export default function SegmentDetails({ segment, onOpenUpload }) {
  if (!segment) {
    return (
      <div className="h-full bg-dark-800 p-6 flex flex-col items-center justify-center text-center text-gray-400">
        <Satellite className="w-12 h-12 mb-3 text-gray-600 animate-pulse" />
        <p className="text-sm">Select a river segment on the map to view evidence fusion & satellite analysis.</p>
      </div>
    );
  }

  const sat = segment.satellite_metrics || {};
  const groundEvList = segment.ground_evidence || [];

  return (
    <div className="h-full bg-dark-800 border-l border-dark-700 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400">{segment.segment_id}</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getPriorityBadgeClass(segment.priority_level)}`}>
            {segment.priority_level} Priority
          </span>
        </div>
        <h2 className="text-xl font-bold text-white mt-1">{segment.name}</h2>
        <p className="text-xs text-gray-400 mt-1">Length: {segment.length_km} km • Updated: {new Date(segment.last_updated).toLocaleTimeString()}</p>
      </div>

      {/* Main Priority Score Box */}
      <div className="bg-dark-900 p-4 rounded-xl border border-dark-700 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wider block">Investigation Priority Score</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">
            {segment.priority_score ?? segment.investigation_priority_score} <span className="text-sm font-normal text-gray-400">/ 100</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 block">Evidence Source</span>
          <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 mt-1 inline-block">
            {segment.evidence_agreement || 'Satellite + Ground Fused'}
          </span>
        </div>
      </div>

      {/* Recommended Action Card */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 p-4 rounded-xl">
        <div className="flex items-center space-x-2 text-blue-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Recommended Action</h4>
        </div>
        <p className="text-xs text-gray-200 leading-relaxed">
          {segment.recommended_action || 'Maintain routine monitoring schedule.'}
        </p>
      </div>

      {/* Satellite Evidence Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-gray-200">
          <Satellite className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold">Sentinel-2 Satellite Metrics</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-dark-900 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block">NDWI (Water Index)</span>
            <span className="text-sm font-mono font-bold text-cyan-300 mt-0.5 block">{sat.ndwi ?? 'N/A'}</span>
          </div>
          <div className="bg-dark-900 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block">MNDWI (Mod Water)</span>
            <span className="text-sm font-mono font-bold text-cyan-300 mt-0.5 block">{sat.mndwi ?? 'N/A'}</span>
          </div>
          <div className="bg-dark-900 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block">NDTI (Turbidity Index)</span>
            <span className="text-sm font-mono font-bold text-amber-300 mt-0.5 block">{sat.ndti ?? 'N/A'}</span>
          </div>
          <div className="bg-dark-900 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block">NDVI (Vegetation)</span>
            <span className="text-sm font-mono font-bold text-emerald-300 mt-0.5 block">{sat.ndvi ?? 'N/A'}</span>
          </div>
        </div>

        <div className="bg-dark-900 p-3 rounded-lg border border-dark-700 flex justify-between text-xs">
          <span className="text-gray-400">Temporal Anomaly Change</span>
          <span className={`font-mono font-bold ${sat.temporal_change_percent > 10 ? 'text-red-400' : 'text-emerald-400'}`}>
            {sat.temporal_change_percent ? `${sat.temporal_change_percent}%` : '0%'}
          </span>
        </div>
      </div>

      {/* Historical Environmental Trends SVG Chart */}
      <div className="space-y-3 pt-4 border-t border-dark-700">
        <div className="flex items-center space-x-2 text-gray-200">
          <Satellite className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold">Historical Index Trends (6-Month)</h3>
        </div>

        {segment.historical_data && segment.historical_data.length > 0 ? (
          <div className="bg-dark-900 p-4 rounded-xl border border-dark-700 space-y-3">
            {/* Chart Legend */}
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold px-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span>
                <span>NDWI (Water)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span>
                <span>NDTI (Turbidity)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-400 inline-block"></span>
                <span>NDVI (Algae)</span>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="relative">
              <svg viewBox="0 0 340 150" className="w-full h-36 overflow-visible">
                {/* Horizontal Gridlines */}
                <line x1="35" y1="20" x2="330" y2="20" stroke="#374151" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="35" y1="70" x2="330" y2="70" stroke="#374151" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="35" y1="120" x2="330" y2="120" stroke="#374151" strokeWidth="1" />

                {/* Y-Axis Labels */}
                <text x="5" y="24" fill="#9CA3AF" fontSize="10" className="font-mono">0.8</text>
                <text x="5" y="74" fill="#9CA3AF" fontSize="10" className="font-mono">0.3</text>
                <text x="5" y="124" fill="#9CA3AF" fontSize="10" className="font-mono">-0.2</text>

                {/* Helper variables for coordinates */}
                {(() => {
                  const history = segment.historical_data || [];
                  const getX = (idx) => 35 + (idx / 5) * 285;
                  const getY = (val) => 120 - ((val - (-0.2)) / 1.0) * 100;

                  // Render paths
                  const ndwiPts = history.map((pt, i) => `${getX(i)},${getY(pt.ndwi)}`).join(' L ');
                  const ndtiPts = history.map((pt, i) => `${getX(i)},${getY(pt.ndti)}`).join(' L ');
                  const ndviPts = history.map((pt, i) => `${getX(i)},${getY(pt.ndvi)}`).join(' L ');

                  return (
                    <>
                      {/* Lines */}
                      {ndwiPts && <path d={`M ${ndwiPts}`} fill="none" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                      {ndtiPts && <path d={`M ${ndtiPts}`} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                      {ndviPts && <path d={`M ${ndviPts}`} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

                      {/* Interactive Circles & Labels */}
                      {history.map((pt, i) => {
                        const x = getX(i);
                        const month = new Date(pt.acquisition_date).toLocaleDateString('en-US', { month: 'short' });
                        
                        return (
                          <g key={`nodes-${i}`}>
                            {/* X-Axis labels */}
                            <text x={x} y="142" fill="#9CA3AF" fontSize="10" textAnchor="middle" className="font-mono">
                              {month}
                            </text>
                            
                            {/* Data points */}
                            <circle cx={x} cy={getY(pt.ndwi)} r="3.5" fill="#22D3EE" stroke="#0F172A" strokeWidth="1" />
                            <circle cx={x} cy={getY(pt.ndti)} r="3.5" fill="#F59E0B" stroke="#0F172A" strokeWidth="1" />
                            <circle cx={x} cy={getY(pt.ndvi)} r="3.5" fill="#10B981" stroke="#0F172A" strokeWidth="1" />
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        ) : (
          <div className="bg-dark-900/60 p-4 rounded-xl border border-dark-700 text-center text-xs text-gray-400">
            No historical trend data available yet for this segment.
          </div>
        )}
      </div>

      {/* Ground Verification Section */}
      <div className="space-y-3 pt-2 border-t border-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-200">
            <Eye className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold">Ground Verification</h3>
          </div>
          <button
            onClick={onOpenUpload}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Camera className="w-3.5 h-3.5" />
            + Add Photo
          </button>
        </div>

        {groundEvList.length === 0 ? (
          <div className="bg-dark-900/60 p-4 rounded-xl border border-dark-700 text-center text-xs text-gray-400">
            No ground verification photo available yet. Priority score currently based on satellite metrics alone.
          </div>
        ) : (
          groundEvList.map((ev) => (
            <div key={ev.id} className="bg-dark-900 p-3 rounded-xl border border-dark-700 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={ev.photo_url}
                  alt="Ground Evidence"
                  className="w-20 h-20 object-cover rounded-lg border border-dark-600"
                />
                <div className="flex-1 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ground Score</span>
                    <span className="font-bold font-mono text-amber-400">{ev.ground_score} / 100</span>
                  </div>
                  <p className="text-gray-300 italic text-[11px]">"{ev.notes || 'Ground photo uploaded'}"</p>
                </div>
              </div>

              {/* Vision AI Detection Tags */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className={`px-2 py-1 rounded flex items-center justify-between ${ev.ai_analysis?.waste_detected ? 'bg-red-500/20 text-red-300' : 'bg-dark-800 text-gray-500'}`}>
                  <span>Waste Debris</span>
                  <span>{ev.ai_analysis?.waste_detected ? 'DETECTED' : 'Clean'}</span>
                </div>
                <div className={`px-2 py-1 rounded flex items-center justify-between ${ev.ai_analysis?.foam_detected ? 'bg-red-500/20 text-red-300' : 'bg-dark-800 text-gray-500'}`}>
                  <span>Chemical Foam</span>
                  <span>{ev.ai_analysis?.foam_detected ? 'DETECTED' : 'Clean'}</span>
                </div>
                <div className={`px-2 py-1 rounded flex items-center justify-between ${ev.ai_analysis?.discoloration_detected ? 'bg-orange-500/20 text-orange-300' : 'bg-dark-800 text-gray-500'}`}>
                  <span>Discoloration</span>
                  <span>{ev.ai_analysis?.discoloration_detected ? 'DETECTED' : 'Clean'}</span>
                </div>
                <div className={`px-2 py-1 rounded flex items-center justify-between ${ev.ai_analysis?.bank_degradation_detected ? 'bg-amber-500/20 text-amber-300' : 'bg-dark-800 text-gray-500'}`}>
                  <span>Bank Degradation</span>
                  <span>{ev.ai_analysis?.bank_degradation_detected ? 'DETECTED' : 'Clean'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
