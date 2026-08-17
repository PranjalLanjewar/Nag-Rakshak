import json

def main():
    # Read the generated segments to align mock data exactly
    with open("data/geojson/nag-river-segments.geojson", "r") as f:
        geojson = json.load(f)
        
    features = geojson["features"]
    
    mock_segments = []
    mock_satellite = {
        "collection": "COPERNICUS/S2_SR_HARMONIZED",
        "cloud_mask": "COPERNICUS/S2_CLOUD_PROBABILITY",
        "latest_pass": "2026-08-16T05:22:18Z",
        "metrics": {}
    }
    
    seed_sql_lines = [
        "-- NagRiver Sentinel Initial Seed Data for OSM Segments\n",
        "INSERT INTO river_segments (segment_id, name, length_km, centroid, priority_score, priority_level, has_ground_data)\nVALUES\n"
    ]
    
    seed_values = []
    
    for i, feat in enumerate(features):
        props = feat["properties"]
        seg_id = props["segment_id"]
        name = props["name"]
        length = props["length_km"]
        centroid = props["centroid"]
        priority_score = props["priority_score"]
        priority_level = props["priority_level"]
        has_ground = props["has_ground_data"]
        
        # Determine satellite metrics
        # Modulo calculations to give variation
        ndwi = round(0.35 - (i * 0.02) % 0.4, 2)
        mndwi = round(0.42 - (i * 0.02) % 0.4, 2)
        ndti = round(0.08 + (i * 0.04) % 0.6, 2)
        ndvi = round(0.55 - (i * 0.03) % 0.5, 2)
        temporal = round(-2.1 + (i * 1.5) % 15, 1)
        sat_score = priority_score # Match for mock testing
        
        # 1. Populating mock_segments
        ground_evidence = []
        if has_ground:
            ground_evidence.append({
                "id": f"ev-{seg_id}-01",
                "photo_url": "/assests/ChatGPT Image Aug 15, 2026, 06_04_30 PM.png" if i % 2 == 0 else "/assests/ChatGPT Image Aug 15, 2026, 08_09_01 PM.png",
                "uploaded_at": "2026-08-17T12:30:00Z",
                "ground_score": priority_score + 5,
                "ai_analysis": {
                    "waste_detected": True,
                    "foam_detected": (priority_score > 70),
                    "discoloration_detected": (priority_score > 50),
                    "bank_degradation_detected": (priority_score > 40),
                    "confidence_score": 0.94
                },
                "notes": "Field observation for segment " + seg_id
            })
            
        mock_segments.append({
            "segment_id": seg_id,
            "name": name,
            "length_km": length,
            "centroid": centroid,
            "priority_score": priority_score,
            "priority_level": priority_level,
            "satellite_metrics": {
                "ndwi": ndwi,
                "mndwi": mndwi,
                "ndti": ndti,
                "ndvi": ndvi,
                "temporal_change_percent": temporal,
                "satellite_score": sat_score,
                "cloud_cover_percent": 1.0,
                "acquisition_date": "2026-08-16"
            },
            "ground_evidence": ground_evidence,
            "evidence_agreement": "High Agreement" if has_ground else "Satellite Only",
            "recommended_action": "Routine satellite monitoring." if priority_level == 'Low' else "Priority field investigation.",
            "last_updated": "2026-08-17T12:45:00Z"
        })
        
        # 2. Populating mock_satellite
        mock_satellite["metrics"][seg_id] = {
            "ndwi": ndwi,
            "mndwi": mndwi,
            "ndti": ndti,
            "ndvi": ndvi,
            "temporal_change_percent": temporal,
            "satellite_score": sat_score
        }
        
        # 3. Populating seed values
        has_ground_str = "true" if has_ground else "false"
        centroid_str = f"[{centroid[0]}, {centroid[1]}]"
        seed_values.append(f"('{seg_id}', '{name}', {length}, '{centroid_str}', {priority_score}, '{priority_level}', {has_ground_str})")
        
    # Write mock segments
    with open("data/sample/mock_segments.json", "w") as f:
        json.dump(mock_segments, f, indent=2)
        
    # Write mock satellite
    with open("data/sample/mock_satellite.json", "w") as f:
        json.dump(mock_satellite, f, indent=2)
        
    # Write seed SQL
    seed_sql_lines.append(",\n".join(seed_values))
    seed_sql_lines.append("\nON CONFLICT (segment_id) DO UPDATE SET\n  priority_score = EXCLUDED.priority_score,\n  priority_level = EXCLUDED.priority_level,\n  has_ground_data = EXCLUDED.has_ground_data;\n")
    
    with open("database/seed.sql", "w") as f:
        f.writelines(seed_sql_lines)
        
    print("[Data Sync] Successfully updated mock files and seed.sql with S001-S020.")

if __name__ == "__main__":
    main()
