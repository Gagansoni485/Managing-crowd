# Crowd Heatmap System - Setup Instructions

## 🎯 Overview
Real-time crowd detection and heatmap visualization system that detects rush conditions and sends alerts to admin dashboard.

## 🏗️ Architecture

```
Python CV (Object Detection)
    ↓ (HTTP POST every 5s)
Backend (Node.js + MongoDB)
    ↓ (Socket.IO real-time)
Frontend (React)
```

## 📋 Prerequisites

1. **MongoDB** - Must be running on `mongodb://localhost:27017`
2. **Node.js** - v16+ installed
3. **Python** - 3.8+ installed with pip

## 🚀 Quick Start (Windows)

### Option 1: Automatic Start
```bash
# Double-click this file
START_HEATMAP_SYSTEM.bat
```

### Option 2: Manual Start

#### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**Python CV:**
```bash
cd computerVision/objectdetection
pip install -r requirements.txt
```

#### Step 2: Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Python CV:**
```bash
cd computerVision/objectdetection
python heatmap_monitor.py
```

## 🎬 How to Use

1. **Access Frontend:** http://localhost:5173
2. **Login as Admin** (or navigate directly to heatmap)
3. **Open Heatmap:** 
   - Click "🎯 Heatmap" tab in Admin Dashboard
   - OR go to: http://localhost:5173/crowd-heatmap
4. **Watch Real-Time Updates:**
   - Heatmap updates every 5 seconds
   - Alerts trigger when zones exceed thresholds
   - Emergency requests auto-created for rush alerts

## 🔧 Configuration

### Zone Definitions
Edit zones in: `computerVision/objectdetection/heatmap_monitor.py`

```python
ZONES = {
    'entrance': {'x1': 0, 'y1': 0, 'x2': W//3, 'y2': H//2, 'capacity': 50},
    'queue': {'x1': W//3, 'y1': 0, 'x2': 2*W//3, 'y2': H, 'capacity': 70},
    # ... customize based on your venue
}
```

### Alert Thresholds
Edit in: `backend/src/controllers/crowdController.js`

```javascript
const THRESHOLDS = {
  zones: {
    entrance: { warning: 30, high: 45, critical: 60 },
    // ... customize per zone
  }
}
```

### Send Interval
Edit in: `computerVision/objectdetection/heatmap_monitor.py`

```python
SEND_INTERVAL = 5  # seconds
```

## 📡 API Endpoints

### POST /api/crowd/heatmap
Receive heatmap data from CV system

### GET /api/crowd/current
Get latest heatmap status

### GET /api/crowd/history/:zoneId
Get historical data for a zone

### GET /api/crowd/analytics
Get analytics and statistics

## 🎨 Heatmap Features

### Visual Elements
- **Color-coded zones**: Green (normal) → Yellow (warning) → Orange (high) → Red (critical)
- **Real-time bounding boxes**: Shows detected people
- **Pulsing alerts**: Critical zones pulse red
- **Live statistics**: People count, density, status per zone

### Alert System
- **Browser notifications**: When rush detected (requires permission)
- **Socket.IO real-time**: Instant updates to all connected admins
- **Emergency integration**: Auto-creates emergency request
- **Cooldown period**: Prevents alert spam (default: 10 minutes)

## 🎥 Video Input

The system uses: `computerVision/objectdetection/people.mp4`

**To use live camera:**
```python
# In heatmap_monitor.py, change:
video_path = os.path.join(script_dir, 'people.mp4')
# To:
cap = cv2.VideoCapture(0)  # 0 for default camera
```

**To use different video:**
```python
video_path = "path/to/your/video.mp4"
```

## 🐛 Troubleshooting

### Backend not receiving data
- Check Python script is running: `python heatmap_monitor.py`
- Verify backend URL in script: `BACKEND_URL = "http://localhost:5000/api/crowd/heatmap"`
- Check terminal for connection errors

### Frontend not showing heatmap
- Check Socket.IO connection: Look for "Connected" indicator
- Open browser console (F12) for errors
- Verify backend is running on port 5000

### Video not playing
- Check video file exists: `computerVision/objectdetection/people.mp4`
- Verify OpenCV installed: `pip install opencv-python`
- Check video codec compatibility

### Alerts not triggering
- Verify thresholds are set correctly
- Check MongoDB is running
- Look at backend console for alert logs

## 📊 Database Collections

### CrowdHeatmap
Stores all heatmap snapshots (auto-deletes after 7 days)

### EmergencyRequest
Rush alerts stored here with type "security" and priority "critical/high"

## 🔒 Security Notes

- The `/api/crowd/heatmap` endpoint is **public** (for CV system)
- All other crowd endpoints are accessible without auth (add `protect` middleware for production)
- Admin endpoints use JWT authentication

## 📈 Performance Tips

1. **Reduce send interval** for less network traffic (but delays alerts)
2. **Adjust grid size** (20x20 default) - smaller = less data, larger = more precision
3. **Limit bounding boxes** rendered on canvas (currently max 10 per zone)
4. **Use video downscaling** if processing is slow

## 🎯 Next Steps

- [ ] Add user authentication to crowd endpoints
- [ ] Store zone configurations in database
- [ ] Add historical analytics charts
- [ ] SMS/Email notifications for critical alerts
- [ ] Multi-camera support
- [ ] Predictive rush detection using ML

## 📞 Support

Check console logs in:
- Backend terminal
- Python CV terminal
- Browser console (F12)

All errors and status updates are logged there.

---

**Built for Shankara Hackathon** 🏆
