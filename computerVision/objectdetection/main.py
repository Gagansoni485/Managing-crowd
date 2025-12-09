import os
import random

import cv2
from ultralytics import YOLO


# Get the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
video_path = os.path.join(script_dir, 'people.mp4')
video_out_path = os.path.join(script_dir, 'out.mp4')

cap = cv2.VideoCapture(video_path)
ret, frame = cap.read()

# Check if video opened successfully
if not ret or frame is None:
    print(f"Error: Could not open video file: {video_path}")
    exit()

cap_out = cv2.VideoWriter(video_out_path, cv2.VideoWriter_fourcc(*'MP4V'), cap.get(cv2.CAP_PROP_FPS),
                          (frame.shape[1], frame.shape[0]))

# Load YOLO model
model = YOLO("yolov8n.pt")

# Generate random colors for visualization
colors = [(random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)) for j in range(50)]

detection_threshold = 0.5

while ret:
    # Check if frame is valid
    if frame is None:
        break

    # Use YOLO's built-in tracking (ByteTrack)
    results = model.track(frame, persist=True, conf=detection_threshold, classes=[0])  # class 0 is 'person'

    # Draw detections
    person_count = 0
    if results[0].boxes is not None and results[0].boxes.id is not None:
        boxes = results[0].boxes.xyxy.cpu().numpy()  # bounding boxes
        track_ids = results[0].boxes.id.cpu().numpy().astype(int)  # track IDs
        confidences = results[0].boxes.conf.cpu().numpy()  # confidence scores
        person_count = len(track_ids)
        
        for box, track_id, conf in zip(boxes, track_ids, confidences):
            x1, y1, x2, y2 = map(int, box)
            color = colors[track_id % len(colors)]
            
            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
            
            # Add label with ID and confidence
            label = f'ID: {track_id} ({conf:.2f})'
            cv2.putText(frame, label, (x1, y1 - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    
    # Add people count
    cv2.rectangle(frame, (10, 10), (300, 50), (0, 0, 0), -1)
    cv2.putText(frame, f'People Count: {person_count}', (20, 35), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    # Display the frame with detections
    cv2.namedWindow('People Detection', cv2.WINDOW_NORMAL)
    cv2.imshow('People Detection', frame)
    
    # Write to output file
    cap_out.write(frame)
    
    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
    
    ret, frame = cap.read()

cap.release()
cap_out.release()
cv2.destroyAllWindows()
print(f"\nProcessing complete! Output saved to: {video_out_path}")