"""
Test script to verify backend connection without running full CV pipeline
"""
import requests
import json
from datetime import datetime

BACKEND_URL = "http://localhost:5000/api/crowd/heatmap"

# Sample test data
test_data = {
    'timestamp': datetime.now().isoformat(),
    'overallPeopleCount': 35,
    'zones': [
        {
            'zoneId': 'entrance',
            'zoneName': 'Entrance',
            'peopleCount': 15,
            'density': 0.3,
            'heatmapGrid': [[0.1, 0.2], [0.3, 0.4]],
            'alertLevel': 'normal',
            'boundingBoxes': []
        },
        {
            'zoneId': 'queue',
            'zoneName': 'Queue',
            'peopleCount': 20,
            'density': 0.5,
            'heatmapGrid': [[0.5, 0.6], [0.7, 0.8]],
            'alertLevel': 'warning',
            'boundingBoxes': []
        }
    ],
    'frameWidth': 1920,
    'frameHeight': 1080
}

print("🧪 Testing backend connection...")
print(f"Backend URL: {BACKEND_URL}")
print()

try:
    response = requests.post(BACKEND_URL, json=test_data, timeout=5)
    
    if response.status_code == 201:
        print("✅ SUCCESS! Backend is receiving heatmap data")
        print()
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
    else:
        print(f"❌ FAILED! Status code: {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("❌ CONNECTION ERROR!")
    print()
    print("Backend is not running. Please start it with:")
    print("  cd backend")
    print("  npm run dev")
    
except Exception as e:
    print(f"❌ ERROR: {str(e)}")

print()
print("=" * 50)
