/**
 * Seed Services Data
 * Populate the database with sample services for QuickFix
 */

const mongoose = require('mongoose');
const Service = require('../backend/models/Service');
require('dotenv').config();

const services = [
  // Plumbing Services
  {
    name: 'Pipe Repair & Replacement',
    description: 'Professional pipe repair and replacement services for all types of plumbing issues including leaks, bursts, and blockages.',
    category: 'plumbing',
    subcategory: 'pipe-repair',
    basePrice: 2500,
    priceRange: { min: 1500, max: 8000 },
    estimatedDuration: 120,
    skillLevel: 'intermediate',
    isEmergencyService: true,
    requirements: ['Plumbing license', 'Tools', 'Materials'],
    tools: [
      { name: 'Pipe wrench', required: true },
      { name: 'Pipe cutter', required: true },
      { name: 'Soldering equipment', required: false }
    ],
    icon: 'water-outline',
    tags: ['emergency', 'repair', 'maintenance', 'water'],
    isActive: true
  },
  {
    name: 'Toilet Installation & Repair',
    description: 'Complete toilet installation, repair, and maintenance services including unclogging and fixture replacement.',
    category: 'plumbing',
    subcategory: 'toilet-repair',
    basePrice: 3000,
    priceRange: { min: 2000, max: 12000 },
    estimatedDuration: 90,
    skillLevel: 'intermediate',
    requirements: ['Plumbing experience', 'Tools'],
    icon: 'water-outline',
    tags: ['installation', 'repair', 'bathroom', 'fixtures'],
    isActive: true
  },
  {
    name: 'Sink & Faucet Services',
    description: 'Kitchen and bathroom sink installation, faucet repair, and drainage solutions.',
    category: 'plumbing',
    subcategory: 'sink-faucet',
    basePrice: 2000,
    priceRange: { min: 1000, max: 6000 },
    estimatedDuration: 60,
    skillLevel: 'basic',
    icon: 'water-outline',
    tags: ['kitchen', 'bathroom', 'faucet', 'installation'],
    isActive: true
  },

  // Electrical Services
  {
    name: 'House Wiring & Rewiring',
    description: 'Complete electrical wiring solutions for homes and offices including new installations and rewiring services.',
    category: 'electrical',
    subcategory: 'wiring',
    basePrice: 8000,
    priceRange: { min: 5000, max: 25000 },
    estimatedDuration: 240,
    skillLevel: 'advanced',
    requirements: ['Electrical license', 'Safety certification'],
    tools: [
      { name: 'Multimeter', required: true },
      { name: 'Wire strippers', required: true },
      { name: 'Electrical drill', required: true }
    ],
    icon: 'flash-outline',
    tags: ['wiring', 'installation', 'safety', 'power'],
    isActive: true
  },
  {
    name: 'Power Outlet Installation',
    description: 'Safe installation of power outlets, switches, and electrical fixtures throughout your property.',
    category: 'electrical',
    subcategory: 'outlets',
    basePrice: 1500,
    priceRange: { min: 800, max: 4000 },
    estimatedDuration: 45,
    skillLevel: 'intermediate',
    icon: 'flash-outline',
    tags: ['outlets', 'switches', 'installation', 'power'],
    isActive: true
  },
  {
    name: 'Electrical Fault Diagnosis',
    description: 'Professional electrical fault finding and repair services to restore power safely.',
    category: 'electrical',
    subcategory: 'fault-diagnosis',
    basePrice: 2000,
    priceRange: { min: 1500, max: 6000 },
    estimatedDuration: 90,
    skillLevel: 'advanced',
    isEmergencyService: true,
    icon: 'flash-outline',
    tags: ['emergency', 'diagnosis', 'repair', 'troubleshooting'],
    isActive: true
  },

  // Carpentry Services
  {
    name: 'Custom Furniture Making',
    description: 'Bespoke furniture design and creation including cabinets, tables, wardrobes, and storage solutions.',
    category: 'carpentry',
    subcategory: 'furniture',
    basePrice: 15000,
    priceRange: { min: 8000, max: 50000 },
    estimatedDuration: 480,
    skillLevel: 'advanced',
    tools: [
      { name: 'Table saw', required: true },
      { name: 'Router', required: false },
      { name: 'Drill set', required: true }
    ],
    icon: 'hammer-outline',
    tags: ['custom', 'furniture', 'design', 'storage'],
    isActive: true
  },
  {
    name: 'Door & Window Installation',
    description: 'Professional installation and repair of doors, windows, and frames with proper sealing.',
    category: 'carpentry',
    subcategory: 'doors-windows',
    basePrice: 5000,
    priceRange: { min: 3000, max: 15000 },
    estimatedDuration: 180,
    skillLevel: 'intermediate',
    icon: 'hammer-outline',
    tags: ['installation', 'doors', 'windows', 'security'],
    isActive: true
  },

  // Painting Services
  {
    name: 'Interior Wall Painting',
    description: 'Professional interior painting services including wall preparation, priming, and finishing.',
    category: 'painting',
    subcategory: 'interior',
    basePrice: 800,
    priceRange: { min: 500, max: 2000 },
    estimatedDuration: 360,
    skillLevel: 'basic',
    materials: [
      { name: 'Paint', estimatedCost: 2000, required: true },
      { name: 'Brushes & rollers', estimatedCost: 500, required: true }
    ],
    icon: 'color-palette-outline',
    tags: ['interior', 'decoration', 'walls', 'finishing'],
    isActive: true
  },
  {
    name: 'Exterior House Painting',
    description: 'Weather-resistant exterior painting services to protect and beautify your property.',
    category: 'painting',
    subcategory: 'exterior',
    basePrice: 1200,
    priceRange: { min: 800, max: 3000 },
    estimatedDuration: 480,
    skillLevel: 'intermediate',
    icon: 'color-palette-outline',
    tags: ['exterior', 'weather-protection', 'maintenance', 'curb-appeal'],
    isActive: true
  },

  // Appliance Repair
  {
    name: 'Refrigerator Repair',
    description: 'Expert refrigerator and freezer repair services including cooling system, compressor, and electrical issues.',
    category: 'appliance-repair',
    subcategory: 'refrigeration',
    basePrice: 3500,
    priceRange: { min: 2000, max: 8000 },
    estimatedDuration: 120,
    skillLevel: 'advanced',
    isEmergencyService: true,
    icon: 'snow-outline',
    tags: ['emergency', 'refrigerator', 'cooling', 'food-safety'],
    isActive: true
  },
  {
    name: 'Washing Machine Service',
    description: 'Complete washing machine repair and maintenance including drum, motor, and drainage issues.',
    category: 'appliance-repair',
    subcategory: 'laundry',
    basePrice: 2500,
    priceRange: { min: 1500, max: 6000 },
    estimatedDuration: 90,
    skillLevel: 'intermediate',
    icon: 'leaf-outline',
    tags: ['washing-machine', 'laundry', 'maintenance', 'motor'],
    isActive: true
  },

  // HVAC Services
  {
    name: 'Air Conditioning Installation',
    description: 'Professional AC installation including split units, central air, and ventilation systems.',
    category: 'hvac',
    subcategory: 'ac-installation',
    basePrice: 12000,
    priceRange: { min: 8000, max: 30000 },
    estimatedDuration: 300,
    skillLevel: 'advanced',
    requirements: ['HVAC certification', 'Refrigerant license'],
    icon: 'thermometer-outline',
    tags: ['air-conditioning', 'installation', 'cooling', 'comfort'],
    isActive: true
  },
  {
    name: 'AC Repair & Maintenance',
    description: 'Air conditioning repair, cleaning, and regular maintenance services for optimal performance.',
    category: 'hvac',
    subcategory: 'ac-repair',
    basePrice: 2500,
    priceRange: { min: 1500, max: 7000 },
    estimatedDuration: 90,
    skillLevel: 'intermediate',
    isEmergencyService: true,
    icon: 'thermometer-outline',
    tags: ['repair', 'maintenance', 'cleaning', 'efficiency'],
    isActive: true
  },

  // Cleaning Services
  {
    name: 'Deep House Cleaning',
    description: 'Comprehensive deep cleaning service including all rooms, surfaces, and hard-to-reach areas.',
    category: 'cleaning',
    subcategory: 'deep-cleaning',
    basePrice: 4000,
    priceRange: { min: 2500, max: 8000 },
    estimatedDuration: 240,
    skillLevel: 'basic',
    materials: [
      { name: 'Cleaning supplies', estimatedCost: 1000, required: true },
      { name: 'Equipment', estimatedCost: 0, required: true }
    ],
    icon: 'sparkles-outline',
    tags: ['deep-cleaning', 'sanitization', 'hygiene', 'comprehensive'],
    isActive: true
  },
  {
    name: 'Carpet & Upholstery Cleaning',
    description: 'Professional carpet and furniture cleaning using steam cleaning and eco-friendly products.',
    category: 'cleaning',
    subcategory: 'carpet-upholstery',
    basePrice: 2000,
    priceRange: { min: 1200, max: 5000 },
    estimatedDuration: 120,
    skillLevel: 'intermediate',
    icon: 'sparkles-outline',
    tags: ['carpet', 'upholstery', 'steam-cleaning', 'stain-removal'],
    isActive: true
  },

  // Electronics Repair
  {
    name: 'TV & Home Theater Setup',
    description: 'Professional TV mounting, home theater installation, and audio-visual system setup.',
    category: 'electronics',
    subcategory: 'tv-audio',
    basePrice: 3000,
    priceRange: { min: 2000, max: 8000 },
    estimatedDuration: 120,
    skillLevel: 'intermediate',
    icon: 'tv-outline',
    tags: ['tv-mounting', 'home-theater', 'audio-visual', 'entertainment'],
    isActive: true
  },
  {
    name: 'Computer & Phone Repair',
    description: 'Expert repair services for computers, laptops, smartphones, and tablets.',
    category: 'electronics',
    subcategory: 'computer-phone',
    basePrice: 2000,
    priceRange: { min: 1000, max: 8000 },
    estimatedDuration: 90,
    skillLevel: 'advanced',
    icon: 'hardware-chip-outline',
    tags: ['computer', 'phone', 'laptop', 'data-recovery'],
    isActive: true
  },

  // Security Services
  {
    name: 'CCTV System Installation',
    description: 'Complete CCTV security system installation including cameras, recording equipment, and monitoring setup.',
    category: 'security',
    subcategory: 'cctv',
    basePrice: 15000,
    priceRange: { min: 8000, max: 40000 },
    estimatedDuration: 300,
    skillLevel: 'advanced',
    icon: 'videocam-outline',
    tags: ['security', 'surveillance', 'cctv', 'monitoring'],
    isActive: true
  },
  {
    name: 'Lock Installation & Repair',
    description: 'Professional lock installation, repair, and emergency lockout services for homes and offices.',
    category: 'security',
    subcategory: 'locks',
    basePrice: 1500,
    priceRange: { min: 800, max: 5000 },
    estimatedDuration: 45,
    skillLevel: 'intermediate',
    isEmergencyService: true,
    icon: 'lock-closed-outline',
    tags: ['emergency', 'lockout', 'security', 'access-control'],
    isActive: true
  },

  // Automotive Services
  {
    name: 'Car Engine Repair',
    description: 'Professional car engine diagnostics and repair services for all vehicle types.',
    category: 'automotive',
    subcategory: 'engine-repair',
    basePrice: 5000,
    priceRange: { min: 3000, max: 15000 },
    estimatedDuration: 180,
    skillLevel: 'advanced',
    requirements: ['Automotive certification', 'Diagnostic tools'],
    icon: 'car-outline',
    tags: ['engine', 'car', 'diagnostics', 'repair'],
    isActive: true
  },
  {
    name: 'Motorcycle Repair',
    description: 'Complete motorcycle repair and maintenance services including engine, brakes, and electrical systems.',
    category: 'automotive',
    subcategory: 'motorcycle',
    basePrice: 2500,
    priceRange: { min: 1500, max: 8000 },
    estimatedDuration: 120,
    skillLevel: 'intermediate',
    icon: 'bicycle-outline',
    tags: ['motorcycle', 'bike', 'repair', 'maintenance'],
    isActive: true
  },
  {
    name: 'Car Electrical System',
    description: 'Auto electrical services including battery replacement, wiring, and electrical fault diagnosis.',
    category: 'automotive',
    subcategory: 'electrical',
    basePrice: 2000,
    priceRange: { min: 1000, max: 6000 },
    estimatedDuration: 90,
    skillLevel: 'intermediate',
    icon: 'flash-outline',
    tags: ['auto-electrical', 'battery', 'wiring', 'car'],
    isActive: true
  },
  {
    name: 'Brake System Repair',
    description: 'Professional brake system inspection, repair, and replacement for cars and motorcycles.',
    category: 'automotive',
    subcategory: 'brakes',
    basePrice: 3000,
    priceRange: { min: 2000, max: 10000 },
    estimatedDuration: 120,
    skillLevel: 'intermediate',
    isEmergencyService: true,
    icon: 'car-outline',
    tags: ['brakes', 'safety', 'car', 'emergency'],
    isActive: true
  },
  {
    name: 'Emergency Roadside Assistance',
    description: '24/7 emergency roadside help including jump starts, tire changes, and towing services.',
    category: 'automotive',
    subcategory: 'emergency',
    basePrice: 2500,
    priceRange: { min: 1500, max: 8000 },
    estimatedDuration: 45,
    skillLevel: 'basic',
    isEmergencyService: true,
    icon: 'car-outline',
    tags: ['emergency', 'roadside', 'towing', '24/7'],
    isActive: true
  },
  {
    name: 'Motorcycle Repair & Service',
    description: 'Complete motorcycle mechanical repair, service, and maintenance for all bike types.',
    category: 'automotive',
    subcategory: 'motorcycle',
    basePrice: 1800,
    priceRange: { min: 1000, max: 5000 },
    estimatedDuration: 90,
    skillLevel: 'intermediate',
    icon: 'bicycle-outline',
    tags: ['motorcycle', 'bike', 'service', 'repair'],
    isActive: true
  },
  {
    name: 'Truck & Heavy Vehicle Repair',
    description: 'Professional repair services for trucks, buses, and heavy commercial vehicles.',
    category: 'automotive',
    subcategory: 'heavy-vehicle',
    basePrice: 5000,
    priceRange: { min: 3000, max: 15000 },
    estimatedDuration: 180,
    skillLevel: 'advanced',
    isEmergencyService: true,
    icon: 'car-outline',
    tags: ['truck', 'heavy', 'commercial', 'emergency'],
    isActive: true
  },
  {
    name: 'Car Battery Jump Start',
    description: 'Emergency battery jump start service available 24/7 anywhere in Nairobi.',
    category: 'automotive',
    subcategory: 'emergency',
    basePrice: 800,
    priceRange: { min: 500, max: 1500 },
    estimatedDuration: 30,
    skillLevel: 'basic',
    isEmergencyService: true,
    icon: 'flash-outline',
    tags: ['battery', 'jumpstart', 'emergency', '24/7'],
    isActive: true
  },
  {
    name: 'Tire Puncture & Replacement',
    description: 'Quick tire puncture repair and tire replacement service for all vehicles.',
    category: 'automotive',
    subcategory: 'tires',
    basePrice: 1200,
    priceRange: { min: 800, max: 4000 },
    estimatedDuration: 45,
    skillLevel: 'basic',
    isEmergencyService: true,
    icon: 'car-outline',
    tags: ['tire', 'puncture', 'emergency', 'replacement'],
    isActive: true
  },
  {
    name: 'Truck & Heavy Vehicle Repair',
    description: 'Specialized repair services for trucks, buses, and heavy commercial vehicles.',
    category: 'automotive',
    subcategory: 'heavy-vehicles',
    basePrice: 8000,
    priceRange: { min: 5000, max: 25000 },
    estimatedDuration: 240,
    skillLevel: 'advanced',
    requirements: ['Heavy vehicle certification', 'Specialized tools'],
    icon: 'car-outline',
    tags: ['truck', 'heavy-vehicle', 'commercial', 'repair'],
    isActive: true
  }
];

async function seedServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickfix', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Insert new services
    const insertedServices = await Service.insertMany(services);
    console.log(` Successfully seeded ${insertedServices.length} services`);

    // Update popularity for some services to simulate usage
    const popularServiceNames = [
      'Pipe Repair & Replacement',
      'Electrical Fault Diagnosis',
      'AC Repair & Maintenance',
      'Lock Installation & Repair',
      'Deep House Cleaning'
    ];

    for (const serviceName of popularServiceNames) {
      const service = await Service.findOne({ name: serviceName });
      if (service) {
        service.popularity = Math.floor(Math.random() * 100) + 50;
        service.averageRating = (Math.random() * 2 + 3).toFixed(1); // 3-5 rating
        service.totalRatings = Math.floor(Math.random() * 50) + 10;
        service.completedJobs = Math.floor(Math.random() * 100) + 20;
        await service.save();
      }
    }

    console.log(' Updated popularity metrics for featured services');

    process.exit(0);
  } catch (error) {
    console.error(' Error seeding services:', error);
    process.exit(1);
  }
}

// Run the seed function
if (require.main === module) {
  seedServices();
}

module.exports = { seedServices, services };
