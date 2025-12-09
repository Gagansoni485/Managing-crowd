# Backend API Documentation

## Server Information
- **Port**: 6000
- **Base URL**: http://localhost:6000/api
- **Database**: MongoDB Atlas (Connected)

## Test Credentials

### Admin User
- **Email**: admin@temple.com
- **Password**: admin123
- **Phone**: +919999999999

### Volunteer User
- **Email**: volunteer@temple.com
- **Password**: volunteer123
- **Phone**: +918888888888

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (Protected)

### Temple Routes (`/api/temples`)
- `GET /` - Get all active temples
- `GET /:id` - Get temple by ID
- `POST /` - Create temple (Admin only)
- `PUT /:id` - Update temple (Admin only)
- `DELETE /:id` - Deactivate temple (Admin only)

### Queue Routes (`/api/queue`)
- `GET /` - Get all queues (Protected)
- `GET /temple/:templeId` - Get queue by temple (Public)
- `POST /join` - Join queue (Protected)
- `PUT /:id/position` - Update queue position (Admin only)
- `DELETE /:id` - Leave queue (Protected)

### Token/Visitor Routes (`/api/visitor`)
- `GET /tokens` - Get visitor tokens (Protected)
- `POST /tokens` - Create token booking (Protected)
- `GET /queue/:tokenId` - Get queue position (Protected)
- `POST /queue/rejoin` - Rejoin queue (Protected)

### Emergency Routes (`/api/emergency`)
- `POST /` - Create emergency request (Protected)
- `GET /my-requests` - Get user's emergencies (Protected)
- `GET /` - Get all emergencies (Admin/Volunteer)
- `PUT /:id` - Update emergency status (Admin/Volunteer)

### Volunteer Routes (`/api/volunteer`)
- `GET /queues` - Get assigned queues (Volunteer)
- `PUT /queues/:id` - Update queue status (Volunteer)
- `GET /emergencies` - Get emergency requests (Volunteer)
- `PUT /emergencies/:id` - Respond to emergency (Volunteer)

### Admin Routes (`/api/admin`)
- `GET /users` - Get all users (Admin)
- `GET /stats` - Get dashboard stats (Admin)
- `PUT /users/:id/role` - Update user role (Admin)

### Parking Routes (`/api/parking`)
- `GET /` - Get all parking slots (Public)
- `GET /available` - Get available slots (Public)
- `POST /` - Create parking slot (Admin)
- `PUT /:id` - Update parking slot (Admin)
- `POST /bulk-update` - Bulk update slots (System/CV)

## Socket.IO Namespaces

### Queue Socket (`/queue`)
Events:
- `join-temple` - Join temple queue room
- `leave-temple` - Leave temple queue room
- `join-user` - Join user-specific room
- `get-queue-status` - Get current queue status
- `queue-updated` - Receive queue updates
- `personal-queue-update` - Receive personal updates

### Emergency Socket (`/emergency`)
Events:
- `join-responders` - Join responders room (Volunteer/Admin)
- `join-user` - Join user-specific room
- `get-pending-emergencies` - Get pending emergencies
- `acknowledge-emergency` - Acknowledge emergency
- `new-emergency` - New emergency alert
- `emergency-update` - Emergency status update
- `emergency-resolved` - Emergency resolved notification

## Database Collections

### Users
- Stores user information with role-based access
- Roles: visitor, volunteer, admin
- Password hashing with bcrypt

### Temples
- Temple information with timings and capacity
- Time slots configuration
- Active/inactive status

### Tokens
- Virtual token bookings
- Auto-generated token numbers
- Status tracking (active, used, expired, cancelled)

### Queue
- Real-time queue management
- Position tracking
- Estimated wait times

### EmergencyRequest
- Emergency requests with priority levels
- Response tracking
- Status management

### ParkingSlot
- Parking slot management
- Zone-based organization
- Occupancy tracking
- Types: regular, handicapped, vip, two-wheeler, four-wheeler

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with initial data

## Environment Variables

Located in `.env` file:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (6000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `CLIENT_URL` - Frontend URL for CORS
