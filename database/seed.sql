-- NagRiver Sentinel Initial Seed Data for OSM Segments
INSERT INTO river_segments (segment_id, name, length_km, centroid, priority_score, priority_level, has_ground_data)
VALUES
('S001', 'Nag River - Ambazari Outlet Part 1', 0.42, '[21.12474, 79.04319]', 15, 'Low', false),
('S002', 'Nag River - Ambazari Outlet Part 2', 0.38, '[21.127, 79.04554]', 18, 'Low', false),
('S003', 'Nag River - Ambazari Layout', 0.4, '[21.1293, 79.04849]', 21, 'Low', false),
('S004', 'Nag River - Dharampeth Part 1', 0.41, '[21.12977, 79.05198]', 24, 'Low', false),
('S005', 'Nag River - Dharampeth Part 2', 0.39, '[21.13082, 79.05545]', 27, 'Moderate', false),
('S006', 'Nag River - Ramdaspeth Part 1', 0.38, '[21.13338, 79.05776]', 30, 'Moderate', false),
('S007', 'Nag River - Ramdaspeth Part 2', 0.4, '[21.1349, 79.0608]', 33, 'Moderate', false),
('S008', 'Nag River - Dhantoli Part 1', 0.39, '[21.13587, 79.06454]', 36, 'Moderate', false),
('S009', 'Nag River - Dhantoli Part 2', 0.42, '[21.13674, 79.06831]', 39, 'Moderate', false),
('S010', 'Nag River - Baidyanath Chowk Part 1', 0.39, '[21.13762, 79.07207]', 42, 'Moderate', false),
('S011', 'Nag River - Baidyanath Chowk Part 2', 0.39, '[21.13846, 79.0757]', 45, 'Moderate', false),
('S012', 'Nag River - Great Nag Road Part 1', 0.39, '[21.1393, 79.07932]', 48, 'Moderate', false),
('S013', 'Nag River - Great Nag Road Part 2', 0.41, '[21.14003, 79.08312]', 51, 'High', false),
('S014', 'Nag River - Great Nag Road Part 3', 0.39, '[21.13845, 79.0858]', 54, 'High', false),
('S015', 'Nag River - Reshimbagh Part 1', 0.39, '[21.13754, 79.08907]', 57, 'High', false),
('S016', 'Nag River - Reshimbagh Part 2', 0.41, '[21.13707, 79.09281]', 60, 'High', false),
('S017', 'Nag River - Ashok Nagar Part 1', 0.41, '[21.13731, 79.09643]', 63, 'High', false),
('S018', 'Nag River - Ashok Nagar Part 2', 0.37, '[21.13718, 79.10025]', 66, 'High', false),
('S019', 'Nag River - Pardi Part 1', 0.4, '[21.13704, 79.10378]', 69, 'High', false),
('S020', 'Nag River - Pardi Part 2', 0.42, '[21.13844, 79.10669]', 72, 'High', false),
('S021', 'Nag River - Pardi Part 3', 0.38, '[21.13864, 79.11026]', 75, 'High', false),
('S022', 'Nag River - Pardi Part 4', 0.39, '[21.1389, 79.11382]', 78, 'Critical', false),
('S023', 'Nag River - Bhandara Road Part 1', 0.41, '[21.13983, 79.11759]', 81, 'Critical', false),
('S024', 'Nag River - Bhandara Road Part 2', 0.4, '[21.14078, 79.12128]', 84, 'Critical', false),
('S025', 'Nag River - Punapur Border', 0.37, '[21.1415, 79.12496]', 87, 'Critical', false)
ON CONFLICT (segment_id) DO UPDATE SET
  priority_score = EXCLUDED.priority_score,
  priority_level = EXCLUDED.priority_level,
  has_ground_data = EXCLUDED.has_ground_data;
