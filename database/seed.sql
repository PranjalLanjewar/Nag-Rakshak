-- NagRiver Sentinel Initial Seed Data

INSERT INTO river_segments (segment_id, name, length_km, centroid, investigation_priority_score, priority_level, has_ground_data)
VALUES
('nag-seg-001', 'Ambazari Spillway to Subhash Nagar', 2.4, '[21.1275, 79.0520]', 18, 'Low', false),
('nag-seg-002', 'Subhash Nagar to Krazy Castle Stretch', 1.8, '[21.1310, 79.0620]', 38, 'Moderate', true),
('nag-seg-003', 'Krazy Castle to Panchsheel Square', 3.1, '[21.1350, 79.0740]', 68, 'High', false),
('nag-seg-004', 'Panchsheel Square to Sitabuldi Bridge', 2.2, '[21.1400, 79.0850]', 88, 'Critical', true),
('nag-seg-005', 'Sitabuldi Bridge to Mokshdham', 2.9, '[21.1440, 79.0980]', 58, 'High', true),
('nag-seg-006', 'Mokshdham to Pardi Confluence', 4.5, '[21.1480, 79.1150]', 42, 'Moderate', false)
ON CONFLICT (segment_id) DO NOTHING;

INSERT INTO satellite_metrics (segment_id, ndwi, mndwi, ndti, ndvi, temporal_change_percent, satellite_score, cloud_cover_percent, acquisition_date)
VALUES
('nag-seg-001', 0.35, 0.42, 0.08, 0.55, -2.1, 18, 1.2, '2026-08-16'),
('nag-seg-002', 0.22, 0.28, 0.21, 0.38, 4.5, 35, 2.0, '2026-08-16'),
('nag-seg-003', 0.15, 0.10, 0.45, 0.20, 12.8, 68, 0.5, '2026-08-16'),
('nag-seg-004', 0.05, -0.02, 0.62, 0.12, 24.3, 78, 1.0, '2026-08-16'),
('nag-seg-005', 0.18, 0.15, 0.38, 0.25, 8.2, 52, 0.8, '2026-08-16'),
('nag-seg-006', 0.25, 0.30, 0.22, 0.40, 3.1, 42, 1.5, '2026-08-16');

INSERT INTO ground_evidence (id, segment_id, photo_url, lat, lng, waste_detected, foam_detected, discoloration_detected, bank_degradation_detected, confidence_score, ground_score, notes)
VALUES
('ev-001', 'nag-seg-002', '/assests/ChatGPT Image Aug 15, 2026, 06_04_30 PM.png', 21.1310, 79.0620, true, false, false, true, 0.88, 42, 'Minor plastic debris accumulation near culvert'),
('ev-002', 'nag-seg-004', '/assests/ChatGPT Image Aug 15, 2026, 08_09_01 PM.png', 21.1400, 79.0850, true, true, true, true, 0.96, 94, 'Heavy chemical foam and industrial runoff visible under Sitabuldi bridge'),
('ev-003', 'nag-seg-005', '/assests/ChatGPT Image Aug 15, 2026, 11_19_18 PM.png', 21.1440, 79.0980, true, false, true, false, 0.91, 64, 'Sewage discharge outfall pipe active')
ON CONFLICT (id) DO NOTHING;
