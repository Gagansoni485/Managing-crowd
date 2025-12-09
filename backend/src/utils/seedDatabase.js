const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Temple = require('../models/Temple');
const User = require('../models/User');
const ParkingSlot = require('../models/ParkingSlot');

dotenv.config();

const temples = [
  {
    name: 'Shri Shankaracharya Temple',
    location: 'Srinagar, Jammu & Kashmir',
    description: 'Ancient Hindu temple dedicated to Lord Shiva, situated on Shankaracharya Hill',
    imageUrl: 'https://www.hinduismtoday.com/wp-content/uploads/2024/06/shankara-temple-1024x683.jpg',
    capacity: 150,
    timings: {
      opening: '06:00',
      closing: '20:00',
    },
    timeSlots: [
      { slot: '06:00-08:00', capacity: 30 },
      { slot: '08:00-10:00', capacity: 30 },
      { slot: '10:00-12:00', capacity: 30 },
      { slot: '12:00-14:00', capacity: 30 },
      { slot: '14:00-16:00', capacity: 30 },
      { slot: '16:00-18:00', capacity: 30 },
      { slot: '18:00-20:00', capacity: 30 },
    ],
    isActive: true,
  },
  {
    name: 'Kedarnath Temple',
    location: 'Kedarnath, Uttarakhand',
    description: 'One of the twelve Jyotirlingas of Lord Shiva',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kedarnath_Temple_in_Rainy_season.jpg/1200px-Kedarnath_Temple_in_Rainy_season.jpg',
    capacity: 200,
    timings: {
      opening: '04:00',
      closing: '21:00',
    },
    timeSlots: [
      { slot: '04:00-07:00', capacity: 40 },
      { slot: '07:00-10:00', capacity: 40 },
      { slot: '10:00-13:00', capacity: 40 },
      { slot: '13:00-16:00', capacity: 40 },
      { slot: '16:00-19:00', capacity: 40 },
      { slot: '19:00-21:00', capacity: 40 },
    ],
    isActive: true,
  },
  {
    name: 'Badrinath Temple',
    location: 'Badrinath, Uttarakhand',
    description: 'Sacred temple dedicated to Lord Vishnu',
    imageUrl: 'https://badrinath-kedarnath.gov.in/Assets/image/badrinath.jpg',
    capacity: 180,
    timings: {
      opening: '04:30',
      closing: '21:00',
    },
    timeSlots: [
      { slot: '04:30-07:30', capacity: 35 },
      { slot: '07:30-10:30', capacity: 35 },
      { slot: '10:30-13:30', capacity: 35 },
      { slot: '13:30-16:30', capacity: 35 },
      { slot: '16:30-19:30', capacity: 35 },
      { slot: '19:30-21:00', capacity: 35 },
    ],
    isActive: true,
  },
  {
    name: 'Vaishno Devi Temple',
    location: 'Katra, Jammu & Kashmir',
    description: 'Holy shrine of Mata Vaishno Devi in Trikuta Mountains',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Mata_Vaishno_Devi_Bhawan.jpg',
    capacity: 250,
    timings: {
      opening: '05:00',
      closing: '22:00',
    },
    timeSlots: [
      { slot: '05:00-08:00', capacity: 50 },
      { slot: '08:00-11:00', capacity: 50 },
      { slot: '11:00-14:00', capacity: 50 },
      { slot: '14:00-17:00', capacity: 50 },
      { slot: '17:00-20:00', capacity: 50 },
      { slot: '20:00-22:00', capacity: 50 },
    ],
    isActive: true,
  },
  {
    name: 'Tirupati Balaji Temple',
    location: 'Tirupati, Andhra Pradesh',
    description: 'Famous temple of Lord Venkateswara atop Tirumala hills',
    imageUrl: 'https://www.iamsanatani.com/wp-content/uploads/2024/09/12345-Tirupati-Balaji-temple.jpg',
    capacity: 300,
    timings: {
      opening: '02:30',
      closing: '22:00',
    },
    timeSlots: [
      { slot: '02:30-06:00', capacity: 50 },
      { slot: '06:00-09:00', capacity: 50 },
      { slot: '09:00-12:00', capacity: 50 },
      { slot: '12:00-15:00', capacity: 50 },
      { slot: '15:00-18:00', capacity: 50 },
      { slot: '18:00-22:00', capacity: 50 },
    ],
    isActive: true,
  },
  {
    name: 'Golden Temple',
    location: 'Amritsar, Punjab',
    description: 'Holiest Gurdwara of Sikhism, also known as Harmandir Sahib',
    imageUrl: 'https://www.whyweseek.com/wp-content/uploads/2020/01/facebook-amritsar.jpg',
    capacity: 500,
    timings: {
      opening: '02:00',
      closing: '23:00',
    },
    timeSlots: [
      { slot: '02:00-06:00', capacity: 100 },
      { slot: '06:00-10:00', capacity: 100 },
      { slot: '10:00-14:00', capacity: 100 },
      { slot: '14:00-18:00', capacity: 100 },
      { slot: '18:00-23:00', capacity: 100 },
    ],
    isActive: true,
  },
  {
    name: 'Somnath Temple',
    location: 'Prabhas Patan, Gujarat',
    description: 'First among twelve Jyotirlinga shrines of Lord Shiva',
    imageUrl: 'https://pravase.co.in/admin_pravase/uploads/yatradham/Sonath%20Temple_1558702865.JPG',
    capacity: 220,
    timings: {
      opening: '06:00',
      closing: '21:00',
    },
    timeSlots: [
      { slot: '06:00-09:00', capacity: 45 },
      { slot: '09:00-12:00', capacity: 45 },
      { slot: '12:00-15:00', capacity: 45 },
      { slot: '15:00-18:00', capacity: 45 },
      { slot: '18:00-21:00', capacity: 40 },
    ],
    isActive: true,
  },
  {
    name: 'Meenakshi Temple',
    location: 'Madurai, Tamil Nadu',
    description: 'Historic Hindu temple dedicated to Goddess Meenakshi and Lord Sundareswarar',
    imageUrl: 'https://sanatanajourney.com/wp-content/uploads/2025/03/Madurai-Meenakshi-Amman-Temple-Features.jpg',
    capacity: 280,
    timings: {
      opening: '05:00',
      closing: '22:00',
    },
    timeSlots: [
      { slot: '05:00-08:00', capacity: 55 },
      { slot: '08:00-11:00', capacity: 55 },
      { slot: '11:00-14:00', capacity: 55 },
      { slot: '14:00-17:00', capacity: 55 },
      { slot: '17:00-20:00', capacity: 55 },
      { slot: '20:00-22:00', capacity: 55 },
    ],
    isActive: true,
  },
];

const parkingSlots = [
  // Zone A - Regular Parking
  { slotNumber: 'A1', zone: 'A', type: 'four-wheeler', isOccupied: false },
  { slotNumber: 'A2', zone: 'A', type: 'four-wheeler', isOccupied: false },
  { slotNumber: 'A3', zone: 'A', type: 'four-wheeler', isOccupied: false },
  { slotNumber: 'A4', zone: 'A', type: 'four-wheeler', isOccupied: false },
  { slotNumber: 'A5', zone: 'A', type: 'four-wheeler', isOccupied: false },
  
  // Zone B - Two Wheeler Parking
  { slotNumber: 'B1', zone: 'B', type: 'two-wheeler', isOccupied: false },
  { slotNumber: 'B2', zone: 'B', type: 'two-wheeler', isOccupied: false },
  { slotNumber: 'B3', zone: 'B', type: 'two-wheeler', isOccupied: false },
  { slotNumber: 'B4', zone: 'B', type: 'two-wheeler', isOccupied: false },
  { slotNumber: 'B5', zone: 'B', type: 'two-wheeler', isOccupied: false },
  
  // Zone C - VIP Parking
  { slotNumber: 'C1', zone: 'C', type: 'vip', isOccupied: false },
  { slotNumber: 'C2', zone: 'C', type: 'vip', isOccupied: false },
  
  // Zone D - Handicapped Parking
  { slotNumber: 'D1', zone: 'D', type: 'handicapped', isOccupied: false },
  { slotNumber: 'D2', zone: 'D', type: 'handicapped', isOccupied: false },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await Temple.deleteMany({});
    await ParkingSlot.deleteMany({});
    console.log('Cleared existing data');

    // Insert temples
    await Temple.insertMany(temples);
    console.log('Temples seeded successfully');

    // Insert parking slots
    await ParkingSlot.insertMany(parkingSlots);
    console.log('Parking slots seeded successfully');

    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@temple.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@temple.com',
        password: 'admin123',
        phone: '+919999999999',
        role: 'admin',
      });
      console.log('Admin user created');
    }

    // Create volunteer user if doesn't exist
    const volunteerExists = await User.findOne({ email: 'volunteer@temple.com' });
    if (!volunteerExists) {
      await User.create({
        name: 'Volunteer User',
        email: 'volunteer@temple.com',
        password: 'volunteer123',
        phone: '+918888888888',
        role: 'volunteer',
      });
      console.log('Volunteer user created');
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
