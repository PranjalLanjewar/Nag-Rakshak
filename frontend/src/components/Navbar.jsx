import React from 'react';
import { Waves, Camera, RefreshCw, Sun, Moon } from 'lucide-react';

export default function Navbar({ mockMode, onToggleMock, onOpenUpload, syncing, onSync, theme, onChangeTheme }) {
  return (
    <header className="bg-dark-800 border-b border-dark-700 px-6 py-3 flex items-center justify-between z-30 relative shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
          <Waves className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            NagRiver Sentinel
          </h1>
          <p className="text-xs text-gray-400">Sentinel-2 & Vision AI Hotspot Screening Platform</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* GEE Sync Button */}
        <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center space-x-2 bg-dark-750 hover:bg-dark-700 border border-dark-600 text-gray-200 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-indigo-400' : 'text-gray-400'}`} />
          <span>{syncing ? 'Syncing GEE...' : 'Sync GEE Satellite'}</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-blue-500/20"
        >
          <Camera className="w-4 h-4" />
          <span>Upload Ground Photo</span>
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={() => onChangeTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex items-center justify-center p-2 bg-dark-750 hover:bg-dark-700 border border-dark-600 text-gray-300 hover:text-white rounded-lg transition-all"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-amber-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
}

