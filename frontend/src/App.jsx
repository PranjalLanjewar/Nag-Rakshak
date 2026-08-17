import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapView from './components/MapView';
import SegmentDetails from './components/SegmentDetails';
import PhotoUploader from './components/PhotoUploader';
import { fetchSegments, fetchSegmentDetails, syncSatelliteData } from './services/api';

export default function App() {
  const [segments, setSegments] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [mockMode, setMockMode] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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
    <div className="h-screen w-screen flex flex-col bg-dark-900 overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        mockMode={mockMode}
        onToggleMock={() => setMockMode(!mockMode)}
        onOpenUpload={() => setIsUploadOpen(true)}
        syncing={syncing}
        onSync={handleSync}
      />

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Leaflet Hotspot Map */}
        <div className="flex-1 h-full relative">
          <MapView
            segments={segments}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={handleSelectSegment}
          />
        </div>

        {/* Right: Segment Evidence & Analysis Sidebar */}
        <div className="w-[420px] h-full">
          <SegmentDetails
            segment={selectedDetails}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
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
