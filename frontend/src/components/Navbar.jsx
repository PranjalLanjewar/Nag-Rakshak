import React from 'react';
import { Waves, ShieldAlert, Database, Camera } from 'lucide-react';

export default function Navbar({ mockMode, onToggleMock, onOpenUpload }) {
  return (
    <header className="bg-dark-800 border-b border-dark-700 px-6 py-3 flex items-center justify-between z-30 relative shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
          <Waves className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            NagRiver Sentinel
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              MVP v1.0
            </span>
          </h1>
          <p className="text-xs text-gray-400">Sentinel-2 & Vision AI Hotspot Screening Platform</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-blue-500/20"
        >
          <Camera className="w-4 h-4" />
          <span>Upload Ground Photo</span>
        </button>

        {/* Mock Mode Toggle Badge */}
        <div className="flex items-center space-x-2 bg-dark-700/80 px-3 py-1.5 rounded-lg border border-dark-600">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-gray-300 font-mono">MOCK_MODE</span>
          <button
            onClick={onToggleMock}
            className={`text-xs px-2 py-0.5 rounded font-bold transition-colors ${
              mockMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-green-500/20 text-green-300 border border-green-500/40'
            }`}
          >
            {mockMode ? 'ACTIVE' : 'LIVE'}
          </button>
        </div>
      </div>
    </header>
  );
}
