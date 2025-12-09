import os
import pickle
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
import face_recognition
import numpy as np
from PIL import Image
import cv2

load_dotenv()

class DatabaseHandler:
    def __init__(self):
        # MongoDB connection
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/temple_management')
        self.client = MongoClient(mongo_uri)
        self.db = self.client.get_database()
        self.users = self.db['users']
        self.tokens = self.db['tokens']
        self.queues = self.db['queues']
        
    def get_all_users_with_images(self):
        """Fetch all users who have profile images"""
        users = self.users.find({'profileImage': {'$ne': None}})
        return list(users)
    
    def recognize_user_from_face(self, face_encoding):
        """
        Match face encoding against all users in database
        Returns user data if match found, None otherwise
        """
        users = self.get_all_users_with_images()
        
        for user in users:
            # Get stored face encoding from user's profile
            # Assuming face encodings are stored in a separate field or derived from profileImage
            # For now, we'll use a hybrid approach with local cache
            user_id = str(user['_id'])
            cache_file = f"./face_cache/{user_id}.pickle"
            
            if os.path.exists(cache_file):
                with open(cache_file, 'rb') as f:
                    stored_encoding = pickle.load(f)
                
                # Compare faces
                match = face_recognition.compare_faces([stored_encoding], face_encoding, tolerance=0.6)[0]
                
                if match:
                    return user
        
        return None
    
    def get_user_bookings(self, user_id):
        """Get active bookings/tokens for a user"""
        from bson import ObjectId
        
        # Get active tokens for today and future
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        tokens = self.tokens.find({
            'userId': ObjectId(user_id),
            'status': 'active',
            'visitDate': {'$gte': today}
        })
        
        return list(tokens)
    
    def validate_booking_time(self, booking):
        """
        Validate if current time matches booking slot
        Returns: dict with validation result
        """
        visit_date = booking['visitDate']
        time_slot = booking['timeSlot']
        
        # Parse time slot (format: "09:00 AM - 10:00 AM")
        try:
            start_time_str = time_slot.split('-')[0].strip()
            
            # Convert to datetime
            slot_datetime = datetime.combine(visit_date.date(), datetime.strptime(start_time_str, '%I:%M %p').time())
            
            # Current time
            now = datetime.now()
            
            # Allow entry 30 minutes before slot and 1 hour after
            allowed_start = slot_datetime - timedelta(minutes=30)
            allowed_end = slot_datetime + timedelta(hours=1)
            
            is_valid = allowed_start <= now <= allowed_end
            
            return {
                'is_valid': is_valid,
                'slot_time': slot_datetime,
                'current_time': now,
                'message': 'Entry allowed' if is_valid else f'Entry only allowed between {allowed_start.strftime("%I:%M %p")} and {allowed_end.strftime("%I:%M %p")}'
            }
        except Exception as e:
            return {
                'is_valid': False,
                'message': f'Error validating time: {str(e)}'
            }
    
    def get_user_queue_status(self, user_id, temple_id):
        """Get user's queue status for a temple"""
        from bson import ObjectId
        
        queue = self.queues.find_one({
            'userId': ObjectId(user_id),
            'templeId': temple_id,
            'status': 'active'
        })
        
        return queue
    
    def mark_user_entry(self, user_id, booking_id):
        """Mark user as entered (update token status)"""
        from bson import ObjectId
        
        result = self.tokens.update_one(
            {'_id': ObjectId(booking_id)},
            {'$set': {'status': 'used'}}
        )
        
        return result.modified_count > 0
    
    def sync_face_encodings_to_cache(self):
        """
        Sync face encodings from profile images to local cache
        This should be run periodically or when new users register
        """
        import requests
        from io import BytesIO
        import cv2
        
        users = self.get_all_users_with_images()
        os.makedirs('./face_cache', exist_ok=True)
        
        for user in users:
            user_id = str(user['_id'])
            cache_file = f"./face_cache/{user_id}.pickle"
            
            # Skip if already cached
            if os.path.exists(cache_file):
                continue
            
            try:
                # Download image from Cloudinary or URL
                image_url = user['profileImage']
                response = requests.get(image_url, timeout=10)
                
                if response.status_code == 200:
                    # Load image using cv2 to handle various formats
                    image_array = np.frombuffer(response.content, np.uint8)
                    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
                    
                    if image is None:
                        print(f"Could not decode image for user: {user['name']}")
                        continue
                    
                    # Convert BGR to RGB (OpenCV uses BGR, face_recognition needs RGB)
                    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    
                    # Get face encoding
                    face_encodings = face_recognition.face_encodings(image_rgb)
                    
                    if len(face_encodings) > 0:
                        # Save to cache
                        with open(cache_file, 'wb') as f:
                            pickle.dump(face_encodings[0], f)
                        
                        print(f"✓ Cached face encoding for user: {user['name']}")
                    else:
                        print(f"✗ No face detected in image for user: {user['name']}")
            except Exception as e:
                print(f"Error processing user {user.get('name', 'Unknown')}: {str(e)}")
    
    def close(self):
        """Close database connection"""
        self.client.close()
