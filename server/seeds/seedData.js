require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const NGOProfile = require('../models/NGOProfile');
const DriverProfile = require('../models/DriverProfile');
const Donation = require('../models/Donation');
const Match = require('../models/Match');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const { calculateHaversineDistance, calculateEstimatedTravelTime, generateRouteCoordinates } = require('../utils/distance');
const { connectDB } = require('../config/db');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      DonorProfile.deleteMany({}),
      NGOProfile.deleteMany({}),
      DriverProfile.deleteMany({}),
      Donation.deleteMany({}),
      Match.deleteMany({}),
      Delivery.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('[Seeder] Seeding Users and Profiles...');
    const defaultPassword = 'password123';

    // 1. ADMIN USER
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@surplustoshelter.org',
      password: defaultPassword,
      phone: '+91 98290 11000',
      role: 'ADMIN',
      location: { address: 'Ajmer Control Hub, Collectorate Circle', latitude: 26.4620, longitude: 74.6370 }
    });

    // 2. DONORS (5 around Ajmer)
    const donorRaw = [
      {
        name: 'Chef Rajesh Sharma',
        org: 'Royal Spice Banquet & Kitchen',
        email: 'donor@royalspice.com',
        phone: '+91 98291 22334',
        type: 'Restaurant',
        address: 'Civil Lines, Near Circuit House, Ajmer',
        lat: 26.4700,
        lng: 74.6400
      },
      {
        name: 'Sunil Mathur',
        org: 'Silver Oak Caterers & Event Hub',
        email: 'events@silveroak.com',
        phone: '+91 98292 33445',
        type: 'Caterer',
        address: 'B-Block, Panchsheel Nagar, Ajmer',
        lat: 26.4890,
        lng: 74.6490
      },
      {
        name: 'Kavita Agarwal',
        org: 'Golden Harvest Fresh Mart',
        email: 'fresh@goldenharvest.com',
        phone: '+91 98293 44556',
        type: 'Grocery Store',
        address: 'Main Market, Vaishali Nagar, Ajmer',
        lat: 26.4820,
        lng: 74.6410
      },
      {
        name: 'Vikramaditya Rathore',
        org: 'Rajasthan Heritage Heritage Hotel',
        email: 'kitchen@heritagehotel.com',
        phone: '+91 98294 55667',
        type: 'Hotel',
        address: 'Ana Sagar Circular Road, Ajmer',
        lat: 26.4715,
        lng: 74.6280
      },
      {
        name: 'Prof. Alok Gupta',
        org: 'Apex University Central Cafeteria',
        email: 'cafeteria@apexuniv.edu',
        phone: '+91 98295 66778',
        type: 'Cafeteria',
        address: 'NH-8, Barli Educational Complex, Ajmer',
        lat: 26.4950,
        lng: 74.6320
      }
    ];

    const donors = [];
    for (const d of donorRaw) {
      const user = await User.create({
        name: d.name,
        email: d.email,
        password: defaultPassword,
        phone: d.phone,
        role: 'DONOR',
        location: { address: d.address, latitude: d.lat, longitude: d.lng }
      });
      await DonorProfile.create({
        userId: user._id,
        organizationName: d.org,
        businessType: d.type,
        address: d.address,
        latitude: d.lat,
        longitude: d.lng,
        contactPerson: d.name,
        verificationStatus: 'Verified'
      });
      donors.push({ user, raw: d });
    }

    // 3. NGOs (5 around Ajmer)
    const ngoRaw = [
      {
        name: 'Sister Teresa Maria',
        org: 'Helping Hands Shelter & Care Home',
        email: 'ngo@helpinghands.org',
        phone: '+91 98296 77889',
        address: 'Station Road, Near Railway Junction, Ajmer',
        lat: 26.4520,
        lng: 74.6360,
        capacity: 150,
        available: 110,
        prefs: ['Cooked Food', 'Packaged Food'],
        needs: 'High'
      },
      {
        name: 'Haji Mohammad Ismail',
        org: 'Annam Community Kitchen & Food Bank',
        email: 'contact@annamkitchen.org',
        phone: '+91 98297 88990',
        address: 'Dargah Bazaar, Naya Bazaar Chowk, Ajmer',
        lat: 26.4560,
        lng: 74.6300,
        capacity: 250,
        available: 200,
        prefs: ['Cooked Food', 'Produce / Raw', 'Packaged Food'],
        needs: 'Critical'
      },
      {
        name: 'Dr. Meenakshi Joshi',
        org: 'Aasha Orphanage & Senior Center',
        email: 'trustee@aashahome.org',
        phone: '+91 98298 99001',
        address: 'Sector 4, Adarsh Nagar, Ajmer',
        lat: 26.4250,
        lng: 74.6620,
        capacity: 100,
        available: 60,
        prefs: ['Produce / Raw', 'Cooked Food', 'Bakery / Dairy'],
        needs: 'High'
      },
      {
        name: 'Father George Mathew',
        org: 'Snehalaya Child Rehabilitation Shelter',
        email: 'care@snehalayashelter.org',
        phone: '+91 98299 11223',
        address: 'Opposite Sessions Court, Kutchery Road, Ajmer',
        lat: 26.4600,
        lng: 74.6350,
        capacity: 120,
        available: 85,
        prefs: ['Bakery / Dairy', 'Cooked Food', 'Packaged Food'],
        needs: 'Medium'
      },
      {
        name: 'Rameshwar Dayal',
        org: 'Jeevan Jyoti Shanti Dham',
        email: 'seva@jeevanjyotitrust.org',
        phone: '+91 98290 33445',
        address: 'Near Shiv Mandir, Makarwali Road, Ajmer',
        lat: 26.4920,
        lng: 74.6380,
        capacity: 180,
        available: 140,
        prefs: ['Cooked Food', 'Produce / Raw'],
        needs: 'High'
      }
    ];

    const ngos = [];
    for (const n of ngoRaw) {
      const user = await User.create({
        name: n.name,
        email: n.email,
        password: defaultPassword,
        phone: n.phone,
        role: 'NGO',
        location: { address: n.address, latitude: n.lat, longitude: n.lng }
      });
      await NGOProfile.create({
        userId: user._id,
        organizationName: n.org,
        address: n.address,
        latitude: n.lat,
        longitude: n.lng,
        capacity: n.capacity,
        availableCapacity: n.available,
        foodPreferences: n.prefs,
        currentNeeds: n.needs,
        contactPerson: n.name,
        verificationStatus: 'Verified'
      });
      ngos.push({ user, raw: n });
    }

    // 4. DRIVERS (8 active volunteers & drivers around Ajmer)
    const driverRaw = [
      {
        name: 'Vikram Singh',
        email: 'driver@rescueteam.com',
        phone: '+91 94140 12345',
        vehicleType: 'Three-Wheeler (Auto/Van)',
        vehicleNumber: 'RJ-01-EA-4521',
        status: 'Available',
        lat: 26.4550,
        lng: 74.6380
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.driver@rescueteam.com',
        phone: '+91 94140 23456',
        vehicleType: 'Two-Wheeler (Bike/Scooter)',
        vehicleNumber: 'RJ-01-SV-8910',
        status: 'Available',
        lat: 26.4680,
        lng: 74.6420
      },
      {
        name: 'Amit Sharma',
        email: 'amit.driver@rescueteam.com',
        phone: '+91 94140 34567',
        vehicleType: 'Four-Wheeler (Car/Truck)',
        vehicleNumber: 'RJ-01-TC-3321',
        status: 'Available',
        lat: 26.4850,
        lng: 74.6450
      },
      {
        name: 'Priya Rathore',
        email: 'priya.driver@rescueteam.com',
        phone: '+91 94140 45678',
        vehicleType: 'Two-Wheeler (Bike/Scooter)',
        vehicleNumber: 'RJ-01-BQ-7744',
        status: 'Available',
        lat: 26.4720,
        lng: 74.6290
      },
      {
        name: 'Suresh Meena',
        email: 'suresh.driver@rescueteam.com',
        phone: '+91 94140 56789',
        vehicleType: 'Four-Wheeler (Car/Truck)',
        vehicleNumber: 'RJ-01-GA-9011',
        status: 'On Delivery',
        lat: 26.4600,
        lng: 74.6340
      },
      {
        name: 'Rohit Soni',
        email: 'rohit.driver@rescueteam.com',
        phone: '+91 94140 67890',
        vehicleType: 'Two-Wheeler (Bike/Scooter)',
        vehicleNumber: 'RJ-01-LK-2143',
        status: 'Available',
        lat: 26.4510,
        lng: 74.6370
      },
      {
        name: 'Deepa Choudhary',
        email: 'deepa.driver@rescueteam.com',
        phone: '+91 94140 78901',
        vehicleType: 'Two-Wheeler (Bike/Scooter)',
        vehicleNumber: 'RJ-01-MN-5566',
        status: 'Available',
        lat: 26.4810,
        lng: 74.6400
      },
      {
        name: 'Manoj Yadav',
        email: 'manoj.driver@rescueteam.com',
        phone: '+91 94140 89012',
        vehicleType: 'Three-Wheeler (Auto/Van)',
        vehicleNumber: 'RJ-01-TY-4390',
        status: 'Available',
        lat: 26.4300,
        lng: 74.6600
      }
    ];

    const drivers = [];
    for (const drv of driverRaw) {
      const user = await User.create({
        name: drv.name,
        email: drv.email,
        password: defaultPassword,
        phone: drv.phone,
        role: 'DRIVER',
        location: { address: 'Ajmer Sector Patrol', latitude: drv.lat, longitude: drv.lng }
      });
      await DriverProfile.create({
        userId: user._id,
        vehicleType: drv.vehicleType,
        vehicleNumber: drv.vehicleNumber,
        availabilityStatus: drv.status,
        currentLocation: { latitude: drv.lat, longitude: drv.lng, updatedAt: new Date() },
        verificationStatus: 'Verified',
        totalDeliveriesCompleted: drv.status === 'On Delivery' ? 4 : 8
      });
      drivers.push({ user, raw: drv });
    }

    console.log('[Seeder] Seeding 15 Realistic Donations with Lifecycle states...');

    const now = new Date();
    const plusHours = (h) => new Date(now.getTime() + h * 3600 * 1000);
    const minusHours = (h) => new Date(now.getTime() - h * 3600 * 1000);

    // 15 realistic food donation entries
    const donationsData = [
      // 1. Ready for Hackathon Live Demo (Cooked Rice + Dal, 30kg, 2 hours usable)
      {
        donorIdx: 0,
        foodName: 'Cooked Rice + Dal Tadka',
        category: 'Cooked Food',
        quantity: 30,
        unit: 'kg',
        preparedAt: minusHours(1),
        usableUntil: plusHours(2), // 2 hours
        description: 'Steam cooked basmati rice with nutritious dal tadka. Freshly packed in clean insulated food grade containers.',
        foodSafetyInfo: 'Maintained at >65°C in thermal carriers. FSSAI certified kitchen.',
        status: 'POSTED' // Live demo start point
      },
      // 2. MATCHED - Waiting for Driver acceptance
      {
        donorIdx: 1,
        ngoIdx: 0,
        foodName: 'Paneer Butter Masala & Roti Platter',
        category: 'Cooked Food',
        quantity: 25,
        unit: 'kg',
        preparedAt: minusHours(1.5),
        usableUntil: plusHours(3),
        description: 'Surplus wedding banquet buffet food. Rich paneer curry with fresh handmade wheat rotis.',
        foodSafetyInfo: 'Packed immediately after dining session, hygiene inspected.',
        status: 'MATCHED'
      },
      // 3. DRIVER_ASSIGNED - Driver accepted and about to start pickup
      {
        donorIdx: 2,
        ngoIdx: 1,
        driverIdx: 0,
        foodName: 'Fresh Organic Apples & Bananas Crates',
        category: 'Produce / Raw',
        quantity: 45,
        unit: 'kg',
        preparedAt: minusHours(4),
        usableUntil: plusHours(18),
        description: 'Ripe seasonal fruits from retail display change. Crisp and high nutritional value.',
        foodSafetyInfo: 'Crated in clean cardboard boxes. Kept cool.',
        status: 'DRIVER_ASSIGNED'
      },
      // 4. PICKUP_STARTED - Driver on the way to restaurant
      {
        donorIdx: 3,
        ngoIdx: 2,
        driverIdx: 1,
        foodName: 'Rajasthani Gatta Curry & Khichdi',
        category: 'Cooked Food',
        quantity: 35,
        unit: 'kg',
        preparedAt: minusHours(2),
        usableUntil: plusHours(2.5),
        description: 'Traditional wholesome local meal prepared in hotel banquet.',
        foodSafetyInfo: 'Sealed stainless steel containers.',
        status: 'PICKUP_STARTED'
      },
      // 5. PICKED_UP - Driver loaded food
      {
        donorIdx: 4,
        ngoIdx: 3,
        driverIdx: 2,
        foodName: 'Sandwiches & Whole Wheat Breads',
        category: 'Bakery / Dairy',
        quantity: 20,
        unit: 'kg',
        preparedAt: minusHours(3),
        usableUntil: plusHours(6),
        description: 'Nutritious vegetable sandwiches and freshly baked loaves from student dining hall.',
        foodSafetyInfo: 'Individually wrapped in foil wrap.',
        status: 'PICKED_UP'
      },
      // 6. IN_TRANSIT - Driver actively on the road to shelter
      {
        donorIdx: 0,
        ngoIdx: 4,
        driverIdx: 4,
        foodName: 'Vegetable Biryani with Raita',
        category: 'Cooked Food',
        quantity: 40,
        unit: 'kg',
        preparedAt: minusHours(2.5),
        usableUntil: plusHours(1.8),
        description: 'Spiced aromatic vegetable biryani packed for 90 people.',
        foodSafetyInfo: 'Maintained hot in transport canisters.',
        status: 'IN_TRANSIT'
      },
      // 7 to 13. COMPLETED DELIVERIES (for Impact Dashboard demonstration)
      {
        donorIdx: 0,
        ngoIdx: 0,
        driverIdx: 0,
        foodName: 'Mix Veg Korma & Chapati',
        category: 'Cooked Food',
        quantity: 50,
        unit: 'kg',
        preparedAt: minusHours(24),
        usableUntil: minusHours(20),
        description: 'Delivered yesterday for dinner service at Helping Hands Shelter.',
        foodSafetyInfo: 'Passed temperature check.',
        status: 'DELIVERED',
        deliveryHoursAgo: 21
      },
      {
        donorIdx: 1,
        ngoIdx: 1,
        driverIdx: 1,
        foodName: 'Catering Buffet Surplus (Rice & Curry)',
        category: 'Cooked Food',
        quantity: 65,
        unit: 'kg',
        preparedAt: minusHours(48),
        usableUntil: minusHours(44),
        description: 'Delivered to Annam Food Bank.',
        foodSafetyInfo: 'Verified food safety check.',
        status: 'DELIVERED',
        deliveryHoursAgo: 45
      },
      {
        donorIdx: 2,
        ngoIdx: 2,
        driverIdx: 3,
        foodName: 'Seasonal Vegetables (Potatoes & Tomatoes)',
        category: 'Produce / Raw',
        quantity: 80,
        unit: 'kg',
        preparedAt: minusHours(72),
        usableUntil: minusHours(60),
        description: 'Delivered to Aasha Senior Center kitchen.',
        foodSafetyInfo: 'Clean produce.',
        status: 'DELIVERED',
        deliveryHoursAgo: 65
      },
      {
        donorIdx: 3,
        ngoIdx: 3,
        driverIdx: 2,
        foodName: 'Milk Packets & Yogurt Cups',
        category: 'Bakery / Dairy',
        quantity: 30,
        unit: 'liters',
        preparedAt: minusHours(30),
        usableUntil: minusHours(26),
        description: 'Delivered to Snehalaya Child Home.',
        foodSafetyInfo: 'Cold chain verified.',
        status: 'DELIVERED',
        deliveryHoursAgo: 27
      },
      {
        donorIdx: 4,
        ngoIdx: 4,
        driverIdx: 5,
        foodName: 'Poha & Upma Breakfast Packets',
        category: 'Cooked Food',
        quantity: 25,
        unit: 'kg',
        preparedAt: minusHours(12),
        usableUntil: minusHours(8),
        description: 'Morning breakfast delivered to Jeevan Jyoti kitchen.',
        foodSafetyInfo: 'Served immediately.',
        status: 'DELIVERED',
        deliveryHoursAgo: 9
      },
      {
        donorIdx: 1,
        ngoIdx: 0,
        driverIdx: 6,
        foodName: 'Assorted Sweets & Dry Fruits Packets',
        category: 'Packaged Food',
        quantity: 15,
        unit: 'packets',
        preparedAt: minusHours(50),
        usableUntil: minusHours(30),
        description: 'Festive treats delivered to children at shelter.',
        foodSafetyInfo: 'Sealed factory packaging.',
        status: 'DELIVERED',
        deliveryHoursAgo: 35
      },
      {
        donorIdx: 0,
        ngoIdx: 1,
        driverIdx: 7,
        foodName: 'Chole Kulche & Salad',
        category: 'Cooked Food',
        quantity: 42,
        unit: 'kg',
        preparedAt: minusHours(16),
        usableUntil: minusHours(12),
        description: 'Afternoon lunch distribution.',
        foodSafetyInfo: 'Inspected upon delivery.',
        status: 'DELIVERED',
        deliveryHoursAgo: 13
      },
      // 14. EXPIRED donation (to show expiry monitoring)
      {
        donorIdx: 2,
        foodName: 'Cooked Pastries & Cream Cakes',
        category: 'Bakery / Dairy',
        quantity: 12,
        unit: 'kg',
        preparedAt: minusHours(8),
        usableUntil: minusHours(1), // Passed usable time
        description: 'Short shelf-life dairy item not picked up in time.',
        foodSafetyInfo: 'Room temperature storage.',
        status: 'EXPIRED'
      },
      // 15. CANCELLED donation
      {
        donorIdx: 3,
        foodName: 'Leftover Appetizers Tray',
        category: 'Cooked Food',
        quantity: 10,
        unit: 'trays',
        preparedAt: minusHours(5),
        usableUntil: plusHours(1),
        description: 'Event cancelled unexpectedly.',
        foodSafetyInfo: 'Hygienic standard.',
        status: 'CANCELLED'
      }
    ];

    for (const d of donationsData) {
      const donorUser = donors[d.donorIdx].user;
      const donorInfo = donors[d.donorIdx].raw;

      const matchedNgoUser = d.ngoIdx !== undefined ? ngos[d.ngoIdx].user : null;
      const ngoInfo = d.ngoIdx !== undefined ? ngos[d.ngoIdx].raw : null;
      const assignedDriverUser = d.driverIdx !== undefined ? drivers[d.driverIdx].user : null;

      const donation = await Donation.create({
        donorId: donorUser._id,
        foodName: d.foodName,
        category: d.category,
        description: d.description,
        quantity: d.quantity,
        unit: d.unit,
        preparedAt: d.preparedAt,
        usableUntil: d.usableUntil,
        pickupAddress: donorInfo.address,
        latitude: donorInfo.lat,
        longitude: donorInfo.lng,
        foodSafetyInfo: d.foodSafetyInfo,
        status: d.status,
        matchedNgoId: matchedNgoUser ? matchedNgoUser._id : null,
        assignedDriverId: assignedDriverUser ? assignedDriverUser._id : null,
        statusHistory: [
          {
            status: 'POSTED',
            timestamp: d.preparedAt,
            note: 'Donation posted',
            updatedBy: donorUser._id
          }
        ]
      });

      // If matched, create match record
      if (matchedNgoUser && ngoInfo) {
        const dist = calculateHaversineDistance(donorInfo.lat, donorInfo.lng, ngoInfo.lat, ngoInfo.lng);
        const match = await Match.create({
          donationId: donation._id,
          ngoId: matchedNgoUser._id,
          distance: dist,
          capacityScore: 92,
          needScore: 85,
          foodCompatibilityScore: 100,
          expirySafetyScore: 80,
          finalScore: 89.5,
          status: 'ACCEPTED'
        });

        // If driver assigned or further along, create Delivery record
        if (assignedDriverUser) {
          const estimatedMin = calculateEstimatedTravelTime(dist);
          const waypoints = generateRouteCoordinates(
            [donorInfo.lat, donorInfo.lng],
            [ngoInfo.lat, ngoInfo.lng]
          );

          let deliveryStatus = 'ASSIGNED';
          let pickupTime = null;
          let deliveryTime = null;

          if (d.status === 'PICKUP_STARTED') {
            deliveryStatus = 'PICKUP_STARTED';
          } else if (d.status === 'PICKED_UP') {
            deliveryStatus = 'PICKED_UP';
            pickupTime = minusHours(0.5);
          } else if (d.status === 'IN_TRANSIT') {
            deliveryStatus = 'IN_TRANSIT';
            pickupTime = minusHours(0.8);
          } else if (d.status === 'DELIVERED') {
            deliveryStatus = 'DELIVERED';
            pickupTime = minusHours((d.deliveryHoursAgo || 20) + 1);
            deliveryTime = minusHours(d.deliveryHoursAgo || 20);
          }

          await Delivery.create({
            donationId: donation._id,
            driverId: assignedDriverUser._id,
            donorId: donorUser._id,
            ngoId: matchedNgoUser._id,
            pickupLocation: { address: donorInfo.address, latitude: donorInfo.lat, longitude: donorInfo.lng },
            deliveryLocation: { address: ngoInfo.address, latitude: ngoInfo.lat, longitude: ngoInfo.lng },
            distance: dist,
            estimatedTime: estimatedMin,
            status: deliveryStatus,
            pickupTime,
            deliveryTime,
            routeCoordinates: waypoints
          });
        }
      }
    }

    // Seed sample notifications
    console.log('[Seeder] Creating sample notifications...');
    await Notification.create([
      {
        userId: donors[0].user._id,
        type: 'MATCH_FOUND',
        title: 'Recipient Match Confirmed',
        message: 'Your donation "Cooked Rice + Dal" has been auto-matched with Helping Hands Shelter (Score: 91/100).',
        isRead: false
      },
      {
        userId: ngos[0].user._id,
        type: 'DONATION_CREATED',
        title: 'New Surplus Rescue Available',
        message: 'Royal Spice Banquet has 30 kg Cooked Food available 2.4 km away.',
        isRead: false
      },
      {
        userId: drivers[0].user._id,
        type: 'DRIVER_ASSIGNED',
        title: 'New Rescue Dispatch Ready',
        message: 'Pickup request assigned from Civil Lines to Station Road (2.4 km).',
        isRead: false
      }
    ]);

    console.log('===========================================================');
    console.log(' Seed Data successfully loaded:');
    console.log(` - 1 Admin User (admin@surplustoshelter.org / password123)`);
    console.log(` - 5 Donors (e.g. donor@royalspice.com / password123)`);
    console.log(` - 5 NGOs (e.g. ngo@helpinghands.org / password123)`);
    console.log(` - 8 Drivers (e.g. driver@rescueteam.com / password123)`);
    console.log(` - 15 Donations with full lifecycle history in Ajmer, RJ`);
    console.log('===========================================================');
    
    if (process.env.RUN_STANDALONE === 'true') {
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seeder Error]', err);
    process.exit(1);
  }
};

if (require.main === module) {
  process.env.RUN_STANDALONE = 'true';
  seedDatabase();
}

module.exports = { seedDatabase };
