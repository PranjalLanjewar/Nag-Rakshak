-- NagRiver Sentinel Initial Seed Data for OSM Segments
INSERT INTO river_segments (segment_id, name, length_km, centroid, priority_score, priority_level, has_ground_data)
VALUES
('S001', 'Nag River Segment S001', 0.3, '[21.12458, 79.04299]', 15, 'Low', false),
('S002', 'Nag River Segment S002', 0.42, '[21.12574, 79.04465]', 19, 'Low', true),
('S003', 'Nag River Segment S003', 0.44, '[21.12904, 79.04805]', 23, 'Low', false),
('S004', 'Nag River Segment S004', 0.24, '[21.12987, 79.05009]', 27, 'Moderate', false),
('S005', 'Nag River Segment S005', 0.64, '[21.13049, 79.05457]', 31, 'Moderate', true),
('S006', 'Nag River Segment S006', 0.47, '[21.13356, 79.05801]', 35, 'Moderate', false),
('S007', 'Nag River Segment S007', 2.97, '[21.13732, 79.07221]', 39, 'Moderate', false),
('S008', 'Nag River Segment S008', 0.26, '[21.1387, 79.08547]', 43, 'Moderate', true),
('S009', 'Nag River Segment S009', 0.42, '[21.13757, 79.08837]', 47, 'Moderate', false),
('S010', 'Nag River Segment S010', 0.44, '[21.13719, 79.09208]', 51, 'High', false),
('S011', 'Nag River Segment S011', 0.25, '[21.13705, 79.09475]', 55, 'High', true),
('S012', 'Nag River Segment S012', 0.55, '[21.13731, 79.09855]', 59, 'High', false),
('S013', 'Nag River Segment S013', 0.4, '[21.13712, 79.1024]', 63, 'High', false),
('S014', 'Nag River Segment S014', 0.18, '[21.13712, 79.10505]', 67, 'High', true),
('S015', 'Nag River Segment S015', 0.63, '[21.13849, 79.10759]', 71, 'High', false),
('S016', 'Nag River Segment S016', 0.24, '[21.1386, 79.11162]', 75, 'High', false),
('S017', 'Nag River Segment S017', 0.29, '[21.13884, 79.11362]', 79, 'Critical', true),
('S018', 'Nag River Segment S018', 0.34, '[21.13953, 79.11647]', 83, 'Critical', false),
('S019', 'Nag River Segment S019', 0.33, '[21.14025, 79.11914]', 87, 'Critical', false),
('S020', 'Nag River Segment S020', 0.68, '[21.14127, 79.12377]', 91, 'Critical', true)
ON CONFLICT (segment_id) DO UPDATE SET
  priority_score = EXCLUDED.priority_score,
  priority_level = EXCLUDED.priority_level,
  has_ground_data = EXCLUDED.has_ground_data;
