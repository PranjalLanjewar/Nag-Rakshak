import os
import json
import urllib.request
import urllib.error

def main():
    SUPABASE_URL = ""
    SUPABASE_ANON_KEY = ""
    
    env_paths = [os.path.join("backend", ".env"), ".env"]
    for env_path in env_paths:
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    if "=" in line:
                        parts = line.split("=", 1)
                        key = parts[0].strip()
                        val = parts[1].strip().strip('"').strip("'")
                        if key == "SUPABASE_URL":
                            SUPABASE_URL = val
                        elif key == "SUPABASE_ANON_KEY":
                            SUPABASE_ANON_KEY = val

    if not SUPABASE_URL or not SUPABASE_ANON_KEY or "your-project" in SUPABASE_URL:
        print("[Seeder] Error: Valid Supabase credentials not found in env files.")
        return
        
    print(f"[Seeder] Connecting to Supabase: {SUPABASE_URL}")
    
    with open("data/geojson/nag-river-segments.json", "r") as f:
        geojson = json.load(f)
        
    features = geojson["features"]
    print(f"[Seeder] Preparing to seed {len(features)} river segments...")
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    
    success_count = 0
    for feat in features:
        props = feat["properties"]
        payload = {
            "segment_id": props["segment_id"],
            "name": props["name"],
            "length_km": props["length_km"],
            "centroid": props["centroid"],
            "priority_score": props["priority_score"],
            "priority_level": props["priority_level"],
            "has_ground_data": props["has_ground_data"]
        }
        
        url = f"{SUPABASE_URL}/rest/v1/river_segments"
        
        # Try inserting with priority_score first
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=10) as res:
                success_count += 1
        except urllib.error.HTTPError as e:
            res_body = e.read().decode("utf-8")
            if "priority_score" in res_body:
                # Column not found error, retry with investigation_priority_score
                payload_fallback = payload.copy()
                del payload_fallback["priority_score"]
                payload_fallback["investigation_priority_score"] = payload["priority_score"]
                
                req_fb = urllib.request.Request(url, data=json.dumps(payload_fallback).encode("utf-8"), headers=headers, method="POST")
                try:
                    with urllib.request.urlopen(req_fb, timeout=10) as res_fb:
                        success_count += 1
                except Exception as e_fb:
                    print(f"[Seeder] Fallback failed for segment {props['segment_id']}: {e_fb}")
            else:
                print(f"[Seeder] Failed to insert segment {props['segment_id']}: {res_body}")
        except Exception as e:
            print(f"[Seeder] Failed to insert segment {props['segment_id']}: {e}")
            
    print(f"[Seeder] Completed! Successfully seeded {success_count} segments in Supabase.")

if __name__ == "__main__":
    main()
