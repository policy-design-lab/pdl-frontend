import json
import os

# Define paths - now assuming counties-10m.json is in the current directory
input_file = 'counties-10m.json'
output_dir = 'state_topojsons'

# Create directory for state files if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
    print(f"Created output directory: {output_dir}")

# Load the nationwide counties TopoJSON
print(f"Loading TopoJSON from {input_file}...")
with open(input_file, 'r') as f:
    nationwide_data = json.load(f)

# Dictionary to store county geometries by state FIPS code
states = {}

# Create lookup for state names based on FIPS codes
state_names = {
    "01": "Alabama", "02": "Alaska", "04": "Arizona", "05": "Arkansas", 
    "06": "California", "08": "Colorado", "09": "Connecticut", "10": "Delaware", 
    "11": "District_of_Columbia", "12": "Florida", "13": "Georgia", "15": "Hawaii", 
    "16": "Idaho", "17": "Illinois", "18": "Indiana", "19": "Iowa", "20": "Kansas", 
    "21": "Kentucky", "22": "Louisiana", "23": "Maine", "24": "Maryland", 
    "25": "Massachusetts", "26": "Michigan", "27": "Minnesota", "28": "Mississippi", 
    "29": "Missouri", "30": "Montana", "31": "Nebraska", "32": "Nevada", 
    "33": "New_Hampshire", "34": "New_Jersey", "35": "New_Mexico", "36": "New_York", 
    "37": "North_Carolina", "38": "North_Dakota", "39": "Ohio", "40": "Oklahoma", 
    "41": "Oregon", "42": "Pennsylvania", "44": "Rhode_Island", "45": "South_Carolina", 
    "46": "South_Dakota", "47": "Tennessee", "48": "Texas", "49": "Utah", 
    "50": "Vermont", "51": "Virginia", "53": "Washington", "54": "West_Virginia", 
    "55": "Wisconsin", "56": "Wyoming"
}

print("Grouping counties by state...")
# Process each county feature and group by state
for county in nationwide_data['objects']['counties']['geometries']:
    # Some counties might not have an id, particularly if they're special areas
    if 'id' not in county:
        continue
        
    county_id = county['id']
    # Extract the state FIPS code (first 2 digits)
    # Make sure to handle various formats of county IDs
    county_id_str = str(county_id)
    # Pad with zeros if needed to ensure we can extract state FIPS
    while len(county_id_str) < 5:
        county_id_str = '0' + county_id_str
    
    state_fips = county_id_str[:2]
    
    # Skip if not a valid state FIPS code
    if state_fips not in state_names:
        print(f"Warning: Skipping county {county_id} with unknown state FIPS {state_fips}")
        continue
    
    # Add this feature to the appropriate state collection
    if state_fips not in states:
        states[state_fips] = []
    states[state_fips].append(county)

print(f"Found counties for {len(states)} states")

# Now we need to determine which arcs are needed for each state
print("Analyzing TopoJSON arc references...")

def extract_arc_indices(arcs_data, result_set):
    """
    Extract all arc indices from nested arc structures.
    Preserves the sign of the indices, which is critical for direction.
    """
    if isinstance(arcs_data, list):
        if all(isinstance(item, int) for item in arcs_data):
            # This is a simple arc ring
            for index in arcs_data:
                # Store both the index and its sign (direction)
                result_set.add(index)
        else:
            # This is a nested structure
            for item in arcs_data:
                extract_arc_indices(item, result_set)

# Collect all arc indices used by each county
county_to_arcs = {}
for county in nationwide_data['objects']['counties']['geometries']:
    if 'id' not in county or 'arcs' not in county:
        continue
        
    arc_set = set()
    extract_arc_indices(county['arcs'], arc_set)
    county_to_arcs[county['id']] = arc_set

# Now collect all necessary arcs for each state
arcs_by_state = {}
for state_fips, counties in states.items():
    arc_set = set()
    for county in counties:
        if 'id' not in county or county['id'] not in county_to_arcs:
            continue
        arc_set.update(county_to_arcs[county['id']])
    arcs_by_state[state_fips] = arc_set

print("Creating individual state TopoJSON files...")

# Create a TopoJSON file for each state
for state_fips, counties in states.items():
    # Get state name
    state_name = state_names.get(state_fips, f"state_{state_fips}")
    print(f"Processing {state_name}...")
    
    # Get all required arcs for this state (both positive and negative indices)
    signed_arcs = arcs_by_state[state_fips]
    
    # Get the absolute arc indices (unique arcs we need to include)
    required_arcs = sorted(set(abs(idx) for idx in signed_arcs))
    
    # Create mapping from old arc indices to new ones
    arc_index_map = {old_idx: new_idx for new_idx, old_idx in enumerate(required_arcs)}
    
    # Extract just the arcs we need
    state_arcs = [nationwide_data['arcs'][i] for i in required_arcs]
    
    # Create deep copies of the county geometries and update their arc references
    updated_counties = []
    
    for county in counties:
        # Skip if county has no arcs
        if 'id' not in county or 'arcs' not in county:
            updated_counties.append(json.loads(json.dumps(county)))
            continue
            
        # Create a deep copy of the county
        county_copy = json.loads(json.dumps(county))
        
        # Update the arcs recursively, preserving direction (sign)
        def update_arc_indices(arcs_data):
            if isinstance(arcs_data, list):
                if all(isinstance(item, int) for item in arcs_data):
                    # This is a simple arc ring, update the indices
                    return [
                        # The sign determines if we traverse the arc forward or backward
                        # We need to preserve this when remapping indices
                        (arc_index_map[abs(idx)] * (1 if idx >= 0 else -1))
                        for idx in arcs_data
                    ]
                else:
                    # This is a nested structure
                    return [update_arc_indices(item) for item in arcs_data]
            return arcs_data
        
        county_copy['arcs'] = update_arc_indices(county_copy['arcs'])
        updated_counties.append(county_copy)
    
    # Create a new TopoJSON structure for this state
    state_topojson = {
        "type": nationwide_data['type'],
        "transform": nationwide_data['transform'],
        "objects": {
            "counties": {
                "type": "GeometryCollection",
                "geometries": updated_counties
            }
        },
        "arcs": state_arcs
    }
    
    # Save to file
    output_file = os.path.join(output_dir, f"{state_name}.json")
    with open(output_file, 'w') as f:
        json.dump(state_topojson, f)
    print(f"Created {output_file}")

print(f"Successfully created individual TopoJSON files for {len(states)} states in the '{output_dir}' directory")