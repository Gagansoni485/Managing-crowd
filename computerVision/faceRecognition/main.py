import os.path
import datetime
import pickle

import tkinter as tk
import cv2
from PIL import Image, ImageTk
import face_recognition

import util
from db_handler import DatabaseHandler


class App:
    def __init__(self):
        self.main_window = tk.Tk()
        self.main_window.geometry("1200x600+350+100")
        self.main_window.title("Temple Face Recognition Login")

        # Initialize database handler
        self.db_handler = DatabaseHandler()
        
        # Sync face encodings from database
        self.sync_button = util.get_button(self.main_window, 'Sync Faces from DB', 'blue', self.sync_faces)
        self.sync_button.place(x=750, y=100)

        self.login_button_main_window = util.get_button(self.main_window, 'Face Login', 'green', self.login)
        self.login_button_main_window.place(x=750, y=200)

        self.check_booking_button = util.get_button(self.main_window, 'Check Bookings', 'orange', self.check_bookings)
        self.check_booking_button.place(x=750, y=300)

        self.exit_button = util.get_button(self.main_window, 'Exit', 'red', self.exit_app)
        self.exit_button.place(x=750, y=400)

        self.webcam_label = util.get_img_label(self.main_window)
        self.webcam_label.place(x=10, y=0, width=700, height=580)

        # Info display area
        self.info_text = tk.Text(self.main_window, height=10, width=50, font=('Arial', 10))
        self.info_text.place(x=750, y=450)

        self.add_webcam(self.webcam_label)

        self.current_user = None
        self.log_path = './login_log.txt'

    def sync_faces(self):
        """Sync face encodings from database to local cache"""
        self.update_info("Syncing face encodings from database...\n")
        try:
            self.db_handler.sync_face_encodings_to_cache()
            self.update_info("Face sync completed!\n")
            util.msg_box('Success', 'Face encodings synced from database')
        except Exception as e:
            self.update_info(f"Sync error: {str(e)}\n")
            util.msg_box('Error', f'Failed to sync faces: {str(e)}')
    
    def update_info(self, message):
        """Update info text area"""
        self.info_text.insert(tk.END, message)
        self.info_text.see(tk.END)
        self.main_window.update()

    def add_webcam(self, label):
        if 'cap' not in self.__dict__:
            self.cap = cv2.VideoCapture(0)

        self._label = label
        self.process_webcam()

    def process_webcam(self):
        ret, frame = self.cap.read()

        self.most_recent_capture_arr = frame
        img_ = cv2.cvtColor(self.most_recent_capture_arr, cv2.COLOR_BGR2RGB)
        self.most_recent_capture_pil = Image.fromarray(img_)
        imgtk = ImageTk.PhotoImage(image=self.most_recent_capture_pil)
        self._label.imgtk = imgtk
        self._label.configure(image=imgtk)

        self._label.after(20, self.process_webcam)

    def login(self):
        """Face recognition login with booking validation"""
        self.update_info("Processing face recognition...\n")
        
        # Get face encoding from current frame
        embeddings = face_recognition.face_encodings(self.most_recent_capture_arr)
        
        if len(embeddings) == 0:
            util.msg_box('Error', 'No face detected. Please position your face clearly.')
            self.update_info("No face detected.\n")
            return
        
        face_encoding = embeddings[0]
        
        # Recognize user from database
        user = self.db_handler.recognize_user_from_face(face_encoding)
        
        if user is None:
            util.msg_box('Access Denied', 'Face not recognized. Please register first at the counter.')
            self.update_info("Unknown user.\n")
            return
        
        # User recognized
        self.current_user = user
        user_name = user['name']
        user_id = str(user['_id'])
        
        self.update_info(f"✓ User recognized: {user_name}\n")
        self.update_info(f"Email: {user['email']}\n")
        self.update_info(f"Phone: {user['phone']}\n")
        
        # Get user bookings
        bookings = self.db_handler.get_user_bookings(user_id)
        
        if len(bookings) == 0:
            util.msg_box('No Booking', f'Welcome {user_name}!\nYou have no active bookings.')
            self.update_info("No active bookings found.\n")
            return
        
        # Check today's bookings
        today = datetime.datetime.now().date()
        today_bookings = [b for b in bookings if b['visitDate'].date() == today]
        
        if len(today_bookings) == 0:
            future_dates = [b['visitDate'].strftime('%Y-%m-%d') for b in bookings]
            util.msg_box('No Booking Today', 
                        f'{user_name}, you have no booking for today.\nYour upcoming bookings: {', '.join(future_dates)}')
            self.update_info(f"No booking for today. Future bookings: {future_dates}\n")
            return
        
        # Validate time slot for today's booking
        booking = today_bookings[0]  # Take first booking
        validation = self.db_handler.validate_booking_time(booking)
        
        self.update_info(f"Time Slot: {booking['timeSlot']}\n")
        self.update_info(f"Temple ID: {booking['templeId']}\n")
        self.update_info(f"Token: {booking['tokenNumber']}\n")
        self.update_info(f"Visitors: {booking['numberOfVisitors']}\n")
        
        if validation['is_valid']:
            # Mark entry
            self.db_handler.mark_user_entry(user_id, str(booking['_id']))
            
            # Log entry
            with open(self.log_path, 'a') as f:
                f.write(f"{user_name},{user['email']},{datetime.datetime.now()},ENTRY_GRANTED,{booking['tokenNumber']}\n")
            
            util.msg_box('✓ Entry Granted', 
                        f"Welcome {user_name}!\n\nToken: {booking['tokenNumber']}\nTemple: {booking['templeId']}\nSlot: {booking['timeSlot']}\nVisitors: {booking['numberOfVisitors']}")
            self.update_info("✓ ENTRY GRANTED\n")
        else:
            util.msg_box('Entry Denied', 
                        f"{user_name}, {validation['message']}\n\nYour slot: {booking['timeSlot']}")
            self.update_info(f"✗ ENTRY DENIED: {validation['message']}\n")
        
        self.update_info("-" * 50 + "\n")

    def check_bookings(self):
        """Display current user's bookings"""
        if self.current_user is None:
            util.msg_box('Info', 'Please login first using face recognition')
            return
        
        user_id = str(self.current_user['_id'])
        bookings = self.db_handler.get_user_bookings(user_id)
        
        self.update_info("\n=== Your Bookings ===\n")
        
        if len(bookings) == 0:
            self.update_info("No active bookings.\n")
            util.msg_box('Bookings', 'You have no active bookings')
            return
        
        booking_info = ""
        for i, booking in enumerate(bookings, 1):
            info = f"Booking {i}:\n"
            info += f"  Token: {booking['tokenNumber']}\n"
            info += f"  Temple: {booking['templeId']}\n"
            info += f"  Date: {booking['visitDate'].strftime('%Y-%m-%d')}\n"
            info += f"  Slot: {booking['timeSlot']}\n"
            info += f"  Visitors: {booking['numberOfVisitors']}\n"
            info += f"  Status: {booking['status']}\n\n"
            
            self.update_info(info)
            booking_info += info
        
        util.msg_box('Your Bookings', booking_info)

    def exit_app(self):
        """Close application and cleanup"""
        self.db_handler.close()
        self.cap.release()
        cv2.destroyAllWindows()
        self.main_window.destroy()
    
    def start(self):
        self.main_window.mainloop()


if __name__ == "__main__":
    app = App()
    app.start()