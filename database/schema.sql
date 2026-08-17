-- NagRiver Sentinel Database Schema (Supabase / PostgreSQL)

CREATE TABLE IF NOT EXISTS river_segments (
    segment_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    length_km NUMERIC(5, 2) NOT NULL,
    centroid JSONB NOT NULL,
    priority_score INT DEFAULT 0 CHECK (priority_score BETWEEN 0 AND 100),
    priority_level VARCHAR(20) DEFAULT 'Low' CHECK (priority_level IN ('Low', 'Moderate', 'High', 'Critical')),
    has_ground_data BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS satellite_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id VARCHAR(50) REFERENCES river_segments(segment_id) ON DELETE CASCADE,
    ndwi NUMERIC(4, 3),
    mndwi NUMERIC(4, 3),
    ndti NUMERIC(4, 3),
    ndvi NUMERIC(4, 3),
    temporal_change_percent NUMERIC(5, 2),
    satellite_score INT CHECK (satellite_score BETWEEN 0 AND 100),
    cloud_cover_percent NUMERIC(5, 2),
    acquisition_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ground_evidence (
    id VARCHAR(50) PRIMARY KEY,
    segment_id VARCHAR(50) REFERENCES river_segments(segment_id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    lat NUMERIC(9, 6),
    lng NUMERIC(9, 6),
    waste_detected BOOLEAN DEFAULT FALSE,
    foam_detected BOOLEAN DEFAULT FALSE,
    discoloration_detected BOOLEAN DEFAULT FALSE,
    bank_degradation_detected BOOLEAN DEFAULT FALSE,
    confidence_score NUMERIC(3, 2) DEFAULT 0.0,
    ground_score INT CHECK (ground_score BETWEEN 0 AND 100),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS fusion_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id VARCHAR(50) REFERENCES river_segments(segment_id) ON DELETE CASCADE,
    satellite_score INT NOT NULL,
    ground_score INT,
    fused_score INT NOT NULL,
    priority_level VARCHAR(20) NOT NULL,
    evidence_agreement VARCHAR(50) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_satellite_metrics_segment ON satellite_metrics(segment_id);
CREATE INDEX IF NOT EXISTS idx_ground_evidence_segment ON ground_evidence(segment_id);
