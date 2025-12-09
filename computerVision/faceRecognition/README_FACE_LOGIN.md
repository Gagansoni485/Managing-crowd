# Temple Face Recognition Login System

## Overview
This system provides face recognition-based login for temple visitors. It validates bookings and time slots before granting entry.

## Features
- **Face Recognition Login**: Authenticate users using facial recognition
- **Booking Validation**: Checks if user has active booking for today
- **Time Slot Verification**: Validates entry time matches booking slot (±30 min before, +1 hour after)
- **Database Integration**: Fetches user data and bookings from MongoDB
- **Entry Logging**: Records all entry attempts with timestamps

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Database
Update `.env` file with your MongoDB connection string:
```
MONGO_URI=your_mongodb_connection_string
```

### 3. Sync Face Encodings
Before first use, sync face encodings from database:
```bash
python sync_faces.py
```

This will download profile images from the database and create face encodings locally.

## Usage

### Start the Application
```bash
python main.py
```

### Application Controls
1. **Sync Faces from DB** - Updates local face cache from database
2. **Face Login** - Authenticate and validate booking
3. **Check Bookings** - View current user's bookings
4. **Exit** - Close application

### Login Process
1. Position your face in front of the camera
2. Click "Face Login"
3. System will:
   - Recognize your face
   - Fetch your user data
   - Check for active bookings
   - Validate time slot
   - Grant/deny entry based on validation

### Entry Rules
- Entry allowed 30 minutes before slot start time
- Entry allowed up to 1 hour after slot start time
- Must have active booking for current date
- Face must match registered user

## Database Schema

### Users Collection
- `name`: User's full name
- `email`: Email address
- `phone`: Phone number
- `profileImage`: URL to profile image (used for face recognition)
- `role`: User role (visitor, admin, etc.)

### Tokens Collection
- `userId`: Reference to user
- `templeId`: Temple identifier
- `tokenNumber`: Unique token number
- `visitDate`: Date of visit
- `timeSlot`: Time slot (e.g., "09:00 AM - 10:00 AM")
- `numberOfVisitors`: Number of people in booking
- `status`: active, used, expired, cancelled

## File Structure
```
faceRecognition/
├── main.py              # Main application
├── util.py              # UI utilities
├── db_handler.py        # Database operations
├── sync_faces.py        # Face sync utility
├── requirements.txt     # Dependencies
├── .env                 # Configuration
├── face_cache/          # Cached face encodings
└── login_log.txt        # Entry logs
```

## Logs
All entry attempts are logged to `login_log.txt` with format:
```
Name,Email,Timestamp,Status,TokenNumber
```

## Troubleshooting

### Face Not Recognized
- Ensure good lighting
- Face the camera directly
- Run sync_faces.py to update cache
- Check if profile image is in database

### No Booking Found
- Verify booking exists in database
- Check booking date matches current date
- Ensure booking status is 'active'

### Entry Denied (Time Mismatch)
- Check your booking time slot
- Entry window: 30 min before to 1 hour after slot start
- Verify system time is correct

## Notes
- Registration must be done through the main web application
- Face cache is stored locally for faster recognition
- Run sync_faces.py periodically to update cache with new users
