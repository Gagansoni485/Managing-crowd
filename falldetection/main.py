import cv2
from ultralytics import YOLO
import pandas as pd
import cvzone
import os

# Download YOLO model if not exists
model_path = "yolov8n.pt"  # Using YOLOv8 nano for better compatibility
if not os.path.exists(model_path):
    print(f"Downloading {model_path}...")
    model = YOLO(model_path)  # Will auto-download
else:
    model = YOLO(model_path)  
 
def RGB(event, x, y, flags, param):
    if event == cv2.EVENT_MOUSEMOVE:
        point = [x, y]
        print(point)

cv2.namedWindow('RGB')
cv2.setMouseCallback('RGB', RGB)


cap=cv2.VideoCapture('fall.mp4')
my_file = open("coco.txt", "r")
data = my_file.read()
class_list = data.split("\n")


count=0
while True:
    ret, frame = cap.read()
    if not ret:
        print("Video ended or cannot read frame")
        break
    
    count += 1
    if count % 3 != 0:
        continue
    frame = cv2.resize(frame, (1020, 600))

    results = model(frame)
    a = results[0].boxes.data
    px = pd.DataFrame(a).astype("float")
    
    for index, row in px.iterrows():
        x1 = int(row[0])
        y1 = int(row[1])
        x2 = int(row[2])
        y2 = int(row[3])
        
        d = int(row[5])
        c = class_list[d]
        
        # Fall detection logic for person
        if 'person' in c:
            h = y2 - y1  # height
            w = x2 - x1  # width
            thresh = h - w
            
            # If width is greater than height, person is likely fallen
            if thresh < 0:
                cvzone.putTextRect(frame, 'PERSON FALL DETECTED', (x1, y1), 2, 2, colorR=(0, 0, 255))
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
            else:
                cvzone.putTextRect(frame, f'{c}', (x1, y1), 1, 1)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        else:
            cvzone.putTextRect(frame, f'{c}', (x1, y1), 1, 1)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)    

                      
                 
                 
    
    
   
    cv2.imshow("RGB", frame)
    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break


cap.release()
cv2.destroyAllWindows()