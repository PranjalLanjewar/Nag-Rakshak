import React, { useState } from 'react';
import { X, UploadCloud, Camera, Sparkles, Check } from 'lucide-react';
import { uploadGroundPhoto } from '../services/api';

export default function PhotoUploader({ segments, defaultSegmentId, onClose, onSuccess }) {
  const [selectedSegmentId, setSelectedSegmentId] = useState(defaultSegmentId || (segments[0] ? segments[0].segment_id : 'nag-seg-001'));
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (file) formData.append('photo', file);
    formData.append('notes', notes);

    try {
      const res = await uploadGroundPhoto(selectedSegmentId, formData);
      setResult(res);
      setLoading(false);
      setTimeout(() => {
        onSuccess(selectedSegmentId);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-dark-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Ground Verification Photo Upload</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Segment Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Target River Segment</label>
            <select
              value={selectedSegmentId}
              onChange={(e) => setSelectedSegmentId(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 text-gray-100 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500"
            >
              {segments.map((s) => (
                <option key={s.segment_id} value={s.segment_id}>
                  {s.segment_id}: {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Ground Verification Photo</label>
            <div className="border-2 border-dashed border-dark-600 rounded-xl p-4 text-center bg-dark-900/50 hover:bg-dark-900 transition-colors relative">
              {preview ? (
                <div className="space-y-2">
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                  <p className="text-xs text-blue-400 font-mono">{file ? file.name : 'Sample Photo Loaded'}</p>
                </div>
              ) : (
                <label className="cursor-pointer space-y-2 block">
                  <UploadCloud className="w-8 h-8 text-blue-400 mx-auto" />
                  <span className="text-xs text-gray-300 block">Click to select photo or drag & drop</span>
                  <span className="text-[11px] text-gray-500 block">JPEG, PNG supported</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Field Observations / Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Foam accumulation observed near drain outfall..."
              className="w-full bg-dark-900 border border-dark-700 text-gray-100 text-xs rounded-lg p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Result Alert */}
          {result && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Vision AI Analysis complete! Priority score fused to {result.updated_fused_score?.investigation_priority_score} ({result.updated_fused_score?.priority_level}).</span>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-lg"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Running Vision AI...</span>
                </>
              ) : (
                <span>Analyze & Fuse Evidence</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
