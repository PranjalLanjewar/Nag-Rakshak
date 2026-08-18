import os
import json
import urllib.request
import urllib.parse
import math

def fetch_osm_data():
    print("[OSM Client] Fetching Nag River geometry from Overpass API...")
    query = """
    [out:json][timeout:30];
    (
      way["waterway"~"river|stream|drain|canal"](21.11,79.02,21.16,79.16);
    );
    out geom;
    """
    
    endpoints = [
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass.osm.ch/api/interpreter",
        "https://overpass-api.de/api/interpreter"
    ]
    
    for url in endpoints:
        print(f"[OSM Client] Querying: {url}")
        data = urllib.parse.urlencode({'data': query}).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'User-Agent': 'NagRiverSentinel/1.0'})
        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                result = json.loads(response.read().decode('utf-8'))
                if result and result.get("elements") and len(result["elements"]) > 0:
                    return result
                print(f"[OSM Client] Server {url} returned empty results. Trying next...")
        except Exception as e:
            print(f"[OSM Client] Server {url} failed: {e}")
            continue
            
    return None

def rebuild_continuous_line(osm_json):
    if not osm_json or "elements" not in osm_json:
        return []
    
    elements = osm_json["elements"]
    
    # Filter for ways containing 'Nag' in their name tag (case-insensitive)
    ways = []
    for el in elements:
        if el.get("type") == "way" and "geometry" in el and len(el["geometry"]) > 0:
            tags = el.get("tags", {})
            name = tags.get("name", "").lower()
            name_en = tags.get("name:en", "").lower()
            waterway = tags.get("waterway", "").lower()
            
            # Match any variant of Nag River
            is_nag = "nag" in name or "nag" in name_en
            if is_nag:
                ways.append(el)
                
    if not ways:
        print("[OSM Client] No river ways found.")
        return []
    
    print(f"[OSM Client] Found {len(ways)} river path segments in OpenStreetMap.")
    
    # Simple path stitching algorithm
    # Start with the westmost way (nearest to Ambazari, longitude ~79.04)
    ways_pool = list(ways)
    ordered_coords = []
    
    # Find starting way
    start_way = min(ways_pool, key=lambda w: min(pt["lon"] for pt in w["geometry"]))
    ways_pool.remove(start_way)
    
    # Orient the first way from West to East
    geom = start_way["geometry"]
    if geom[0]["lon"] > geom[-1]["lon"]:
        geom = list(reversed(geom))
    
    ordered_coords.extend([(pt["lon"], pt["lat"]) for pt in geom])
    
    while ways_pool:
        last_pt = ordered_coords[-1]
        next_way = None
        reverse_next = False
        min_dist = float('inf')
        
        for w in ways_pool:
            w_geom = w["geometry"]
            # Distance from last point to start of this way
            d_start = math.dist(last_pt, (w_geom[0]["lon"], w_geom[0]["lat"]))
            # Distance from last point to end of this way
            d_end = math.dist(last_pt, (w_geom[-1]["lon"], w_geom[-1]["lat"]))
            
            if d_start < min_dist:
                min_dist = d_start
                next_way = w
                reverse_next = False
            if d_end < min_dist:
                min_dist = d_end
                next_way = w
                reverse_next = True
                
        # If the gap is too large, we break or just stitch
        if next_way:
            ways_pool.remove(next_way)
            next_geom = next_way["geometry"]
            if reverse_next:
                next_geom = list(reversed(next_geom))
            
            # Skip duplicate point at seam
            ordered_coords.extend([(pt["lon"], pt["lat"]) for pt in next_geom[1:]])
        else:
            break
            
    return ordered_coords

def split_into_segments(coords, num_segments=25):
    if not coords:
        return []
        
    # Calculate cumulative distance along the LineString
    def haversine_dist(p1, p2):
        lon1, lat1 = p1
        lon2, lat2 = p2
        R = 6371.0 # km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return R * c

    # Interpolate coordinates to handle long straight sections (like S007)
    max_dist_km = 0.03 # 30 meters
    interpolated = [coords[0]]
    for idx in range(1, len(coords)):
        p1 = coords[idx-1]
        p2 = coords[idx]
        d = haversine_dist(p1, p2)
        if d > max_dist_km:
            num_steps = int(math.ceil(d / max_dist_km))
            for step in range(1, num_steps):
                fraction = step / num_steps
                interp_lon = p1[0] + (p2[0] - p1[0]) * fraction
                interp_lat = p1[1] + (p2[1] - p1[1]) * fraction
                interpolated.append((interp_lon, interp_lat))
        interpolated.append(p2)
        
    coords = interpolated
        
    distances = [0.0]
    for i in range(1, len(coords)):
        d = haversine_dist(coords[i-1], coords[i])
        distances.append(distances[-1] + d)
        
    total_len = distances[-1]
    seg_len = total_len / num_segments
    
    features = []
    current_seg_idx = 0
    seg_coords = [coords[0]]
    
    for i in range(1, len(coords)):
        seg_coords.append(coords[i])
        # If we reached or exceeded the segment boundary, or if it's the last coordinate
        if distances[i] >= (current_seg_idx + 1) * seg_len or i == len(coords) - 1:
            segment_id = f"S{current_seg_idx+1:03d}"
            
            # Compute length and centroid
            l_km = distances[i] - distances[i - len(seg_coords) + 1]
            if l_km == 0:
                l_km = haversine_dist(seg_coords[0], seg_coords[-1])
            l_km = round(l_km, 2)
            
            centroid_lat = sum(pt[1] for pt in seg_coords) / len(seg_coords)
            centroid_lon = sum(pt[0] for pt in seg_coords) / len(seg_coords)
            
            # Default properties
            priority_score = 15 + (current_seg_idx * 3)
            priority_level = 'Low'
            if priority_score > 75: priority_level = 'Critical'
            elif priority_score > 50: priority_level = 'High'
            elif priority_score > 25: priority_level = 'Moderate'
            
            features.append({
                "type": "Feature",
                "properties": {
                    "segment_id": segment_id,
                    "name": f"Nag River Segment {segment_id}",
                    "length_km": l_km,
                    "priority_score": priority_score,
                    "priority_level": priority_level,
                    "has_ground_data": False,
                    "centroid": [round(centroid_lat, 5), round(centroid_lon, 5)]
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": seg_coords
                }
            })
            
            current_seg_idx += 1
            # Start next segment with the end point of the previous segment to keep the line continuous
            seg_coords = [coords[i]]
            
            if current_seg_idx >= num_segments:
                break
                
    return features

def main():
    osm_data = fetch_osm_data()
    if not osm_data:
        print("[OSM Client] Failed to fetch data. Aborting.")
        return
        
    coords = rebuild_continuous_line(osm_data)
    if not coords:
        print("[OSM Client] Failed to stitch coordinates.")
        return
        
    # Save original source line string
    source_geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {"name": "Nag River Source"},
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            }
        }]
    }
    
    os.makedirs("data/geojson", exist_ok=True)
    
    with open("data/geojson/nag-river-source.geojson", "w") as f:
        json.dump(source_geojson, f, indent=2)
    with open("data/geojson/nag-river-source.json", "w") as f:
        json.dump(source_geojson, f, indent=2)
    print("[OSM Client] Saved source geometry to data/geojson/nag-river-source.geojson / .json")
    
    # Save split segmented version
    segments = split_into_segments(coords, 25)
    segments_geojson = {
        "type": "FeatureCollection",
        "name": "NagRiverSegments",
        "features": segments
    }
    
    with open("data/geojson/nag-river-segments.geojson", "w") as f:
        json.dump(segments_geojson, f, indent=2)
    with open("data/geojson/nag-river-segments.json", "w") as f:
        json.dump(segments_geojson, f, indent=2)
    print("[OSM Client] Saved segmented geometry to data/geojson/nag-river-segments.geojson / .json")

if __name__ == "__main__":
    main()
