import React, { useState } from 'react';
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

function getPriorityTextColor(level) {
  switch (level) {
    case 'Critical': return 'text-red-500';
    case 'High': return 'text-orange-500';
    case 'Moderate': return 'text-amber-500';
    case 'Low':
    default: return 'text-emerald-500';
  }
}

function getPriorityBarColor(level) {
  switch (level) {
    case 'Critical': return '#EF4444';
    case 'High': return '#F97316';
    case 'Moderate': return '#F59E0B';
    case 'Low':
    default: return '#10B981';
  }
}

function getPriorityShadowColor(level) {
  switch (level) {
    case 'Critical': return 'rgba(239, 68, 68, 0.15)';
    case 'High': return 'rgba(249, 115, 22, 0.15)';
    case 'Moderate': return 'rgba(245, 158, 11, 0.15)';
    case 'Low':
    default: return 'rgba(16, 185, 129, 0.15)';
  }
}

export default function SegmentDetails({ theme, segment, onOpenUpload }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

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
  const score = segment.priority_score ?? segment.investigation_priority_score ?? 0;

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
      <div 
        className="bg-dark-900 p-5 rounded-xl border border-dark-700 relative overflow-hidden transition-all duration-500"
        style={{
          boxShadow: `0 8px 30px ${getPriorityShadowColor(segment.priority_level)}`,
          borderLeft: `5px solid ${getPriorityBarColor(segment.priority_level)}`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold">Investigation Priority Score</span>
            <span className={`text-4xl font-black mt-1 block transition-all duration-300 ${getPriorityTextColor(segment.priority_level)}`}>
              {score} <span className="text-sm font-normal text-gray-400">/ 100</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-semibold">Evidence Source</span>
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 mt-1 inline-block">
              {segment.evidence_agreement || 'Satellite + Ground Fused'}
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-4 w-full bg-dark-700/50 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${score}%`,
              backgroundColor: getPriorityBarColor(segment.priority_level),
              boxShadow: `0 0 8px ${getPriorityBarColor(segment.priority_level)}`
            }}
          />
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
          <div className="bg-dark-900 p-4 rounded-xl border border-dark-700 space-y-3 relative">
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
                <defs>
                  <linearGradient id="ndwi-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="ndti-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="ndvi-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                <line x1="35" y1="20" x2="330" y2="20" stroke={theme === 'light' ? '#e2e8f0' : '#374151'} strokeWidth="1" strokeDasharray="3 3" />
                <line x1="35" y1="70" x2="330" y2="70" stroke={theme === 'light' ? '#e2e8f0' : '#374151'} strokeWidth="1" strokeDasharray="3 3" />
                <line x1="35" y1="120" x2="330" y2="120" stroke={theme === 'light' ? '#e2e8f0' : '#374151'} strokeWidth="1" />

                {/* Y-Axis Labels */}
                <text x="5" y="24" fill={theme === 'light' ? '#475569' : '#9CA3AF'} fontSize="10" className="font-mono">0.8</text>
                <text x="5" y="74" fill={theme === 'light' ? '#475569' : '#9CA3AF'} fontSize="10" className="font-mono">0.3</text>
                <text x="5" y="124" fill={theme === 'light' ? '#475569' : '#9CA3AF'} fontSize="10" className="font-mono">-0.2</text>

                {/* Helper variables for coordinates */}
                {(() => {
                  const history = segment.historical_data || [];
                  const getX = (idx) => 35 + (idx / 5) * 285;
                  const getY = (val) => 120 - ((val - (-0.2)) / 1.0) * 100;

                  const ndwiPts = history.map((pt, i) => ({ x: getX(i), y: getY(pt.ndwi) }));
                  const ndtiPts = history.map((pt, i) => ({ x: getX(i), y: getY(pt.ndti) }));
                  const ndviPts = history.map((pt, i) => ({ x: getX(i), y: getY(pt.ndvi) }));

                  const getBezierPath = (points) => {
                    if (points.length === 0) return '';
                    let path = `M ${points[0].x} ${points[0].y}`;
                    for (let i = 0; i < points.length - 1; i++) {
                      const p0 = points[i];
                      const p1 = points[i+1];
                      const cp1x = p0.x + (p1.x - p0.x) / 3;
                      const cp1y = p0.y;
                      const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
                      const cp2y = p1.y;
                      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
                    }
                    return path;
                  };

                  const getBezierAreaPath = (points, baselineY) => {
                    if (points.length === 0) return '';
                    const linePath = getBezierPath(points);
                    return `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;
                  };

                  const dotStroke = theme === 'light' ? '#FFFFFF' : '#0F172A';

                  return (
                    <>
                      {/* Area Gradients */}
                      {ndwiPts.length > 0 && <path d={getBezierAreaPath(ndwiPts, 120)} fill="url(#ndwi-grad)" className="chart-area" />}
                      {ndtiPts.length > 0 && <path d={getBezierAreaPath(ndtiPts, 120)} fill="url(#ndti-grad)" className="chart-area" />}
                      {ndviPts.length > 0 && <path d={getBezierAreaPath(ndviPts, 120)} fill="url(#ndvi-grad)" className="chart-area" />}

                      {/* Smooth lines */}
                      {ndwiPts.length > 0 && <path d={getBezierPath(ndwiPts)} fill="none" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-path" />}
                      {ndtiPts.length > 0 && <path d={getBezierPath(ndtiPts)} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-path" />}
                      {ndviPts.length > 0 && <path d={getBezierPath(ndviPts)} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-path" />}

                      {/* Hover Vertical Guide Line */}
                      {hoveredIndex !== null && (
                        <line x1={getX(hoveredIndex)} y1={10} x2={getX(hoveredIndex)} y2={120} stroke={theme === 'light' ? '#cbd5e1' : '#4b5563'} strokeWidth="1.5" strokeDasharray="3 3" pointerEvents="none" />
                      )}

                      {/* Data nodes */}
                      {history.map((pt, i) => {
                        const x = getX(i);
                        const month = new Date(pt.acquisition_date).toLocaleDateString('en-US', { month: 'short' });
                        const isHovered = hoveredIndex === i;
                        
                        return (
                          <g key={`nodes-${i}`}>
                            {/* X-Axis labels */}
                            <text x={x} y="142" fill={theme === 'light' ? '#475569' : '#9CA3AF'} fontSize="10" textAnchor="middle" className="font-mono">
                              {month}
                            </text>
                            
                            {/* Data points */}
                            <circle cx={x} cy={getY(pt.ndwi)} r={isHovered ? 5.5 : 3.5} fill="#22D3EE" stroke={dotStroke} strokeWidth={isHovered ? 2 : 1} className="transition-all duration-150" />
                            <circle cx={x} cy={getY(pt.ndti)} r={isHovered ? 5.5 : 3.5} fill="#F59E0B" stroke={dotStroke} strokeWidth={isHovered ? 2 : 1} className="transition-all duration-150" />
                            <circle cx={x} cy={getY(pt.ndvi)} r={isHovered ? 5.5 : 3.5} fill="#10B981" stroke={dotStroke} strokeWidth={isHovered ? 2 : 1} className="transition-all duration-150" />
                          </g>
                        );
                      })}

                      {/* Hover Zones */}
                      {history.map((pt, i) => {
                        const x = getX(i);
                        return (
                          <rect
                            key={`hover-zone-${i}`}
                            x={x - 15}
                            y={10}
                            width={30}
                            height={120}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Interactive Tooltip Overlay */}
            {hoveredIndex !== null && segment.historical_data && segment.historical_data[hoveredIndex] && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 bg-dark-800/95 backdrop-blur border border-dark-700 p-2.5 rounded-lg shadow-xl text-[11px] pointer-events-none flex flex-col gap-1 min-w-[150px]">
                <span className="font-bold text-center border-b border-dark-700 pb-1 mb-1 text-gray-400 font-mono">
                  {new Date(segment.historical_data[hoveredIndex].acquisition_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex justify-between gap-4">
                  <span className="text-cyan-400 font-semibold">NDWI (Water):</span>
                  <span className="font-mono text-white">{segment.historical_data[hoveredIndex].ndwi.toFixed(3)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-amber-400 font-semibold">NDTI (Turbidity):</span>
                  <span className="font-mono text-white">{segment.historical_data[hoveredIndex].ndti.toFixed(3)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-emerald-400 font-semibold">NDVI (Algae):</span>
                  <span className="font-mono text-white">{segment.historical_data[hoveredIndex].ndvi.toFixed(3)}</span>
                </div>
              </div>
            )}
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
