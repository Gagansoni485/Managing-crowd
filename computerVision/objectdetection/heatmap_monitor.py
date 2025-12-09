import os
import random
import cv2
import numpy as np
from ultralytics import YOLO
import requests
import json
from datetime import datetime
import time

# Configuration
BACKEND_URL = "http://localhost:5000/api/crowd/heatmap"
SEND_INTERVAL = 5  # Send heatmap data every 5 seconds
GRID_SIZE = 20  # Grid cells for heatmap (20x20)

# Get the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
video_path = os.path.join(script_dir, 'people.mp4')

# Video capture
cap = cv2.VideoCapture(video_path)
ret, frame = cap.read()

# Check if video opened successfully
if not ret or frame is None:
    print(f"Error: Could not open video file: {video_path}")
    exit()

# Get frame dimensions
FRAME_HEIGHT, FRAME_WIDTH = frame.shape[:2]
print(f"Video dimensions: {FRAME_WIDTH}x{FRAME_HEIGHT}")

# Load YOLO model
model = YOLO("yolov8n.pt")

# Generate random colors for visualization
colors = [(random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)) for j in range(50)]

detection_threshold = 0.5

# Zone definitions (customize based on your venue layout)
ZONES = {
    'entrance': {'x1': 0, 'y1': 0, 'x2': FRAME_WIDTH // 3, 'y2': FRAME_HEIGHT // 2, 'capacity': 50},
    'queue': {'x1': FRAME_WIDTH // 3, 'y1': 0, 'x2': 2 * FRAME_WIDTH // 3, 'y2': FRAME_HEIGHT, 'capacity': 70},
    'darshan': {'x1': 2 * FRAME_WIDTH // 3, 'y1': 0, 'x2': FRAME_WIDTH, 'y2': FRAME_HEIGHT // 2, 'capacity': 80},
    'exit': {'x1': 2 * FRAME_WIDTH // 3, 'y1': FRAME_HEIGHT // 2, 'x2': FRAME_WIDTH, 'y2': FRAME_HEIGHT, 'capacity': 40},
}

# Initialize heatmap grid
def create_heatmap_grid(grid_size):
    return np.zeros((grid_size, grid_size), dtype=float)

# Add detection to heatmap
def update_heatmap(heatmap, x_center, y_center, frame_width, frame_height, grid_size):
    grid_x = int((x_center / frame_width) * grid_size)
    grid_y = int((y_center / frame_height) * grid_size)
    
    grid_x = min(max(0, grid_x), grid_size - 1)
    grid_y = min(max(0, grid_y), grid_size - 1)
    
    heatmap[grid_y, grid_x] += 1
    return heatmap

# Determine alert level based on count and capacity
def get_alert_level(count, capacity):
    ratio = count / capacity if capacity > 0 else 0
    if ratio >= 0.9:
        return 'critical'
    elif ratio >= 0.75:
        return 'high'
    elif ratio >= 0.6:
        return 'warning'
    else:
        return 'normal'

# Check if point is in zone
def point_in_zone(x, y, zone):
    return zone['x1'] <= x <= zone['x2'] and zone['y1'] <= y <= zone['y2']

# Send heatmap data to backend
def send_heatmap_to_backend(zones_data, overall_count, frame_width, frame_height):
    try:
        payload = {
            'timestamp': datetime.now().isoformat(),
            'overallPeopleCount': overall_count,
            'zones': zones_data,
            'frameWidth': frame_width,
            'frameHeight': frame_height,
        }
        
        response = requests.post(BACKEND_URL, json=payload, timeout=2)
        if response.status_code == 201:
            print(f"✓ Heatmap sent successfully | People: {overall_count}")
            result = response.json()
            if result.get('alertsTriggered', 0) > 0:
                print(f"  🚨 ALERT TRIGGERED: {result['alertsTriggered']} zone(s)")
        else:
            print(f"✗ Failed to send heatmap: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"✗ Connection error: {str(e)[:50]}")
    except Exception as e:
        print(f"✗ Error sending heatmap: {str(e)[:50]}")

# Apply Gaussian blur to heatmap for smooth visualization
def apply_gaussian_blur(heatmap, kernel_size=5):
    return cv2.GaussianBlur(heatmap, (kernel_size, kernel_size), 0)

# Render heatmap overlay on frame
def render_heatmap_overlay(frame, heatmap, alpha=0.4):
    # Normalize heatmap to 0-255
    heatmap_norm = cv2.normalize(heatmap, None, 0, 255, cv2.NORM_MINMAX)
    heatmap_norm = heatmap_norm.astype(np.uint8)
    
    # Resize to frame size
    heatmap_resized = cv2.resize(heatmap_norm, (frame.shape[1], frame.shape[0]))
    
    # Apply color map (red for high density)
    heatmap_colored = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
    
    # Blend with original frame
    overlay = cv2.addWeighted(frame, 1 - alpha, heatmap_colored, alpha, 0)
    
    return overlay

# Draw zone boundaries
def draw_zones(frame, zones):
    for zone_name, zone_info in zones.items():
        color = (255, 255, 255)
        cv2.rectangle(frame, (zone_info['x1'], zone_info['y1']), 
                     (zone_info['x2'], zone_info['y2']), color, 2)
        cv2.putText(frame, zone_name.upper(), (zone_info['x1'] + 10, zone_info['y1'] + 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

# Main processing loop
last_send_time = time.time()
frame_count = 0

print("\n🎥 Starting real-time crowd detection with heatmap...")
print(f"📡 Backend: {BACKEND_URL}")
print(f"⏱️  Update interval: {SEND_INTERVAL}s\n")

while ret:
    # Check if frame is valid
    if frame is None:
        break

    frame_count += 1
    
    # Initialize heatmap for this frame
    heatmap_grid = create_heatmap_grid(GRID_SIZE)
    
    # Use YOLO's built-in tracking
    results = model.track(frame, persist=True, conf=detection_threshold, classes=[0])

    # Initialize zone people count
    zone_counts = {zone: [] for zone in ZONES.keys()}
    all_detections = []
    
    # Process detections
    overall_person_count = 0
    if results[0].boxes is not None and results[0].boxes.id is not None:
        boxes = results[0].boxes.xyxy.cpu().numpy()
        track_ids = results[0].boxes.id.cpu().numpy().astype(int)
        confidences = results[0].boxes.conf.cpu().numpy()
        overall_person_count = len(track_ids)
        
        for box, track_id, conf in zip(boxes, track_ids, confidences):
            x1, y1, x2, y2 = map(int, box)
            x_center = (x1 + x2) // 2
            y_center = (y1 + y2) // 2
            
            # Update heatmap
            heatmap_grid = update_heatmap(heatmap_grid, x_center, y_center, 
                                         FRAME_WIDTH, FRAME_HEIGHT, GRID_SIZE)
            
            # Assign to zone
            for zone_name, zone_info in ZONES.items():
                if point_in_zone(x_center, y_center, zone_info):
                    zone_counts[zone_name].append({
                        'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2, 
                        'trackId': int(track_id)
                    })
                    break
            
            # Draw detection
            color = colors[track_id % len(colors)]
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            label = f'ID:{track_id}'
            cv2.putText(frame, label, (x1, y1 - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    
    # Apply Gaussian blur to heatmap
    heatmap_blurred = apply_gaussian_blur(heatmap_grid.astype(np.float32))
    
    # Render heatmap overlay
    frame_with_heatmap = render_heatmap_overlay(frame.copy(), heatmap_blurred)
    
    # Draw zones
    draw_zones(frame_with_heatmap, ZONES)
    
    # Prepare zone data for backend
    zones_data = []
    for zone_name, detections in zone_counts.items():
        zone_info = ZONES[zone_name]
        people_count = len(detections)
        zone_area = (zone_info['x2'] - zone_info['x1']) * (zone_info['y2'] - zone_info['y1'])
        density = people_count / (zone_area / 10000) if zone_area > 0 else 0
        alert_level = get_alert_level(people_count, zone_info['capacity'])
        
        # Extract zone-specific heatmap grid
        grid_x1 = int((zone_info['x1'] / FRAME_WIDTH) * GRID_SIZE)
        grid_y1 = int((zone_info['y1'] / FRAME_HEIGHT) * GRID_SIZE)
        grid_x2 = int((zone_info['x2'] / FRAME_WIDTH) * GRID_SIZE)
        grid_y2 = int((zone_info['y2'] / FRAME_HEIGHT) * GRID_SIZE)
        zone_heatmap = heatmap_grid[grid_y1:grid_y2, grid_x1:grid_x2].tolist()
        
        zones_data.append({
            'zoneId': zone_name,
            'zoneName': zone_name.capitalize(),
            'peopleCount': people_count,
            'density': round(density, 2),
            'heatmapGrid': zone_heatmap if zone_heatmap else [[0]],
            'alertLevel': alert_level,
            'boundingBoxes': detections,
        })
        
        # Draw zone stats
        stats_y = zone_info['y1'] + 60
        cv2.putText(frame_with_heatmap, f"Count: {people_count}", 
                   (zone_info['x1'] + 10, stats_y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Alert level indicator
        alert_colors = {
            'normal': (0, 255, 0),
            'warning': (0, 255, 255),
            'high': (0, 165, 255),
            'critical': (0, 0, 255)
        }
        alert_color = alert_colors.get(alert_level, (255, 255, 255))
        cv2.circle(frame_with_heatmap, (zone_info['x1'] + 20, stats_y + 20), 8, alert_color, -1)
    
    # Display overall stats
    cv2.rectangle(frame_with_heatmap, (10, 10), (350, 70), (0, 0, 0), -1)
    cv2.putText(frame_with_heatmap, f'Total People: {overall_person_count}', 
               (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    cv2.putText(frame_with_heatmap, f'Frame: {frame_count}', 
               (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
    
    # Send data to backend at intervals
    current_time = time.time()
    if current_time - last_send_time >= SEND_INTERVAL:
        send_heatmap_to_backend(zones_data, overall_person_count, FRAME_WIDTH, FRAME_HEIGHT)
        last_send_time = current_time
    
    # Display the frame
    cv2.namedWindow('Crowd Heatmap Monitor', cv2.WINDOW_NORMAL)
    cv2.imshow('Crowd Heatmap Monitor', frame_with_heatmap)
    
    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
    
    ret, frame = cap.read()
    
    # Loop video
    if not ret:
        print("\n🔄 Video ended, restarting...")
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        ret, frame = cap.read()

cap.release()
cv2.destroyAllWindows()
print("\n✅ Crowd detection stopped")
