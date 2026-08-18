import json
import os

def main():
    mock_segments_path = "data/sample/mock_segments.json"
    if not os.path.exists(mock_segments_path):
        print(f"Error: {mock_segments_path} not found.")
        return
        
    with open(mock_segments_path, "r") as f:
        mock_segments = json.load(f)
        
    sql_lines = [
        "-- NagRiver Sentinel Ground Evidence Ingestion Data\n\n",
        "INSERT INTO ground_evidence (id, segment_id, photo_url, lat, lng, waste_detected, foam_detected, discoloration_detected, bank_degradation_detected, confidence_score, ground_score, notes)\nVALUES\n"
    ]
    
    evidence_values = []
    update_segment_queries = []
    
    for seg in mock_segments:
        ev_list = seg.get("ground_evidence", [])
        if not ev_list:
            continue
            
        priority_score = seg["priority_score"]
        priority_level = seg["priority_level"]
        seg_id = seg["segment_id"]
        
        # Safe update block that handles both column names (priority_score and investigation_priority_score)
        update_segment_queries.append(
            f"DO $$\nBEGIN\n"
            f"    UPDATE river_segments SET priority_score = {priority_score}, priority_level = '{priority_level}', has_ground_data = true, last_updated = CURRENT_TIMESTAMP WHERE segment_id = '{seg_id}';\n"
            f"EXCEPTION WHEN undefined_column THEN\n"
            f"    UPDATE river_segments SET investigation_priority_score = {priority_score}, priority_level = '{priority_level}', has_ground_data = true, last_updated = CURRENT_TIMESTAMP WHERE segment_id = '{seg_id}';\n"
            f"END $$;"
        )
        
        for ev in ev_list:
            ev_id = ev["id"]
            photo_url = ev["photo_url"]
            lat = ev["location"]["lat"]
            lng = ev["location"]["lng"]
            
            ai = ev["ai_analysis"]
            waste = "true" if ai["waste_detected"] else "false"
            foam = "true" if ai["foam_detected"] else "false"
            discoloration = "true" if ai["discoloration_detected"] else "false"
            bank = "true" if ai["bank_degradation_detected"] else "false"
            confidence = ai["confidence_score"]
            ground_score = ev["ground_score"]
            
            notes = ev["notes"].replace("'", "''")
            
            evidence_values.append(
                f"('{ev_id}', '{seg_id}', '{photo_url}', {lat}, {lng}, {waste}, {foam}, {discoloration}, {bank}, {confidence}, {ground_score}, '{notes}')"
            )
            
    if not evidence_values:
        print("No ground evidence found to seed.")
        return
        
    sql_lines.append(",\n".join(evidence_values))
    sql_lines.append("\nON CONFLICT (id) DO UPDATE SET\n")
    sql_lines.append("  waste_detected = EXCLUDED.waste_detected,\n")
    sql_lines.append("  foam_detected = EXCLUDED.foam_detected,\n")
    sql_lines.append("  discoloration_detected = EXCLUDED.discoloration_detected,\n")
    sql_lines.append("  bank_degradation_detected = EXCLUDED.bank_degradation_detected,\n")
    sql_lines.append("  confidence_score = EXCLUDED.confidence_score,\n")
    sql_lines.append("  ground_score = EXCLUDED.ground_score,\n")
    sql_lines.append("  notes = EXCLUDED.notes;\n\n")
    
    sql_lines.append("-- Update fused priority scores on segments table (handles both column names)\n")
    sql_lines.append("\n".join(update_segment_queries))
    sql_lines.append("\n")
    
    output_path = "database/seed_ground_evidence.sql"
    with open(output_path, "w") as f:
        f.writelines(sql_lines)
        
    print(f"[SQL Seed Generator] Successfully generated {output_path} with {len(evidence_values)} records.")

if __name__ == "__main__":
    main()
