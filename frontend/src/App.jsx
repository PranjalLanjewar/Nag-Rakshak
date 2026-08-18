import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapView from './components/MapView';
import SegmentDetails from './components/SegmentDetails';
import PhotoUploader from './components/PhotoUploader';
import { fetchSegments, fetchSegmentDetails, syncSatelliteData } from './services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [segments, setSegments] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [mockMode, setMockMode] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load all segments on mount and when mockMode is toggled
  useEffect(() => {
    loadSegments();
  }, [mockMode]);

  const loadSegments = async () => {
    setLoading(true);
    const list = await fetchSegments(mockMode);
    setSegments(list);
    
    // Default to the first segment or maintain currently selected segment
    const targetId = selectedSegmentId || (list[0] ? list[0].segment_id : null);
    if (targetId) {
      handleSelectSegment(targetId);
    }
    setLoading(false);
  };

  const handleSelectSegment = async (id) => {
    setSelectedSegmentId(id);
    const details = await fetchSegmentDetails(id, mockMode);
    setSelectedDetails(details);
  };

  const handleUploadSuccess = (segmentId) => {
    loadSegments();
    handleSelectSegment(segmentId);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncSatelliteData(mockMode);
      await loadSegments();
      if (selectedSegmentId) {
        await handleSelectSegment(selectedSegmentId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={`h-screen w-screen flex flex-col bg-dark-900 overflow-hidden ${theme === 'light' ? 'light' : 'dark'}`}>
      {/* Top Navbar */}
      <Navbar
        mockMode={mockMode}
        onToggleMock={() => setMockMode(!mockMode)}
        onOpenUpload={() => setIsUploadOpen(true)}
        syncing={syncing}
        onSync={handleSync}
        theme={theme}
        onChangeTheme={setTheme}
      />

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Leaflet Hotspot Map (takes full screen) */}
        <div className="w-full h-full relative z-10">
          <MapView
            theme={theme}
            segments={segments}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={handleSelectSegment}
          />
        </div>

        {/* Collapsible Sidebar Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-1/2 -translate-y-1/2 z-40 w-6 h-16 bg-dark-800 border border-dark-700 hover:bg-dark-700 rounded-l-xl transition-all duration-300 flex items-center justify-center text-gray-300 hover:text-white shadow-2xl ${
            isSidebarOpen ? 'right-[420px]' : 'right-0'
          }`}
          style={{ borderRight: 'none' }}
        >
          {isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Right: Segment Evidence & Analysis Sidebar (overlay on top of map) */}
        <div
          className={`absolute top-0 right-0 h-full transition-all duration-300 overflow-hidden z-30 ${
            isSidebarOpen ? 'w-[420px]' : 'w-0'
          }`}
        >
          <div className="w-[420px] h-full">
            <SegmentDetails
              theme={theme}
              segment={selectedDetails}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <PhotoUploader
          segments={segments}
          defaultSegmentId={selectedSegmentId}
          mockMode={mockMode}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
