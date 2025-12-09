import os
import sys
from db_handler import DatabaseHandler

def main():
    """Sync all user face encodings from database to local cache"""
    print("="*50)
    print("Face Recognition Database Sync Utility")
    print("="*50)
    print()
    
    # Check if face_cache directory exists
    if not os.path.exists('./face_cache'):
        os.makedirs('./face_cache')
        print("✓ Created face_cache directory")
    
    # Initialize database handler
    print("Connecting to database...")
    try:
        db = DatabaseHandler()
        print("✓ Connected to database successfully")
    except Exception as e:
        print(f"✗ Database connection failed: {str(e)}")
        sys.exit(1)
    
    # Sync face encodings
    print()
    print("Starting face encoding sync...")
    print("-"*50)
    
    try:
        db.sync_face_encodings_to_cache()
        print("-"*50)
        print()
        print("✓ Face encoding sync completed successfully!")
        
        # Count cached faces
        cache_files = [f for f in os.listdir('./face_cache') if f.endswith('.pickle')]
        print(f"Total faces cached: {len(cache_files)}")
        
    except Exception as e:
        print(f"✗ Sync failed: {str(e)}")
        sys.exit(1)
    finally:
        db.close()
    
    print()
    print("="*50)
    print("You can now run the face recognition system!")
    print("="*50)

if __name__ == "__main__":
    main()
