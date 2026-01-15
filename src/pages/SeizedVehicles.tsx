import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { 
  Truck, 
  Car, 
  Bike, 
  Filter, 
  MapPin, 
  Calendar,
  FileText,
  Eye,
  Gavel,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  Shield,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface SeizedVehicle {
  id: string;
  vehicle_type: 'car' | 'bike' | 'truck' | 'bus';
  make: string;
  model: string;
  year: number;
  registration_number: string;
  engine_number: string;
  chassis_number: string;
  fuel_type: string;
  transmission: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  reserve_price: number;
  current_bid: number;
  auction_date: string;
  location: string;
  bank_name: string;
  loan_account: string;
  images: string[];
  documents: string[];
  status: 'upcoming' | 'live' | 'sold' | 'unsold';
  inspection_report: any;
  seller: {
    name: string;
    type: 'bank' | 'nbfc' | 'government';
    gst_number: string;
    verified: boolean;
  };
}

const SeizedVehicles = () => {
  const [vehicles, setVehicles] = useState<SeizedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    vehicle_type: '',
    location: '',
    price_range: '',
    condition: '',
    bank: ''
  });

  // Mock data for seized vehicles
  const mockVehicles: SeizedVehicle[] = [
    {
      id: '1',
      vehicle_type: 'car',
      make: 'Maruti Suzuki',
      model: 'Swift Dzire',
      year: 2019,
      registration_number: 'MH01AB1234',
      engine_number: 'K12M1234567',
      chassis_number: 'MA3ERLF1S00123456',
      fuel_type: 'Petrol',
      transmission: 'Manual',
      mileage: 45000,
      condition: 'good',
      reserve_price: 450000,
      current_bid: 420000,
      auction_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Mumbai, Maharashtra',
      bank_name: 'State Bank of India',
      loan_account: 'SBI123456789',
      images: [
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80'
      ],
      documents: ['RC Copy', 'Insurance', 'Loan Documents', 'NOC'],
      status: 'upcoming',
      inspection_report: {
        engine: 'Good',
        transmission: 'Good',
        brakes: 'Fair',
        tyres: 'Good',
        body: 'Minor scratches',
        interior: 'Good'
      },
      seller: {
        name: 'Seized Vehicles (Bank/NBFC pool)',
        type: 'nbfc',
        gst_number: 'GST123456789',
        verified: true
      }
    },
    {
      id: '2',
      vehicle_type: 'bike',
      make: 'Honda',
      model: 'CB Shine',
      year: 2020,
      registration_number: 'DL05CD5678',
      engine_number: 'CB125E1234567',
      chassis_number: 'ME4KC1250K1234567',
      fuel_type: 'Petrol',
      transmission: 'Manual',
      mileage: 28000,
      condition: 'excellent',
      reserve_price: 75000,
      current_bid: 68000,
      auction_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Delhi, NCR',
      bank_name: 'HDFC Bank',
      loan_account: 'HDFC987654321',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'
      ],
      documents: ['RC Copy', 'Insurance', 'Loan Documents'],
      status: 'live',
      inspection_report: {
        engine: 'Excellent',
        transmission: 'Excellent',
        brakes: 'Good',
        tyres: 'Excellent',
        body: 'No damage'
      },
      seller: {
        name: 'HDFC Bank Ltd.',
        type: 'bank',
        gst_number: 'GST987654321',
        verified: true
      }
    },
    {
      id: '3',
      vehicle_type: 'car',
      make: 'Hyundai',
      model: 'Creta',
      year: 2018,
      registration_number: 'KA03EF9012',
      engine_number: 'G4FG9012345',
      chassis_number: 'KMHRC81DBJA123456',
      fuel_type: 'Diesel',
      transmission: 'Automatic',
      mileage: 65000,
      condition: 'good',
      reserve_price: 950000,
      current_bid: 880000,
      auction_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bangalore, Karnataka',
      bank_name: 'ICICI Bank',
      loan_account: 'ICICI456789123',
      images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'
      ],
      documents: ['RC Copy', 'Insurance', 'Loan Documents', 'Service Records'],
      status: 'upcoming',
      inspection_report: {
        engine: 'Good',
        transmission: 'Excellent',
        brakes: 'Good',
        tyres: 'Fair',
        body: 'Minor dents',
        interior: 'Good'
      },
      seller: {
        name: 'ICICI Bank Ltd.',
        type: 'bank',
        gst_number: 'GST456789123',
        verified: true
      }
    },
    {
      id: '4',
      vehicle_type: 'truck',
      make: 'Tata',
      model: 'LPT 1613',
      year: 2017,
      registration_number: 'UP16GH3456',
      engine_number: 'TCIC1234567890',
      chassis_number: 'MAT123456789012',
      fuel_type: 'Diesel',
      transmission: 'Manual',
      mileage: 180000,
      condition: 'fair',
      reserve_price: 1200000,
      current_bid: 1050000,
      auction_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Lucknow, Uttar Pradesh',
      bank_name: 'Punjab National Bank',
      loan_account: 'PNB789123456',
      images: [
        'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80'
      ],
      documents: ['RC Copy', 'Insurance', 'Loan Documents', 'Fitness Certificate'],
      status: 'upcoming',
      inspection_report: {
        engine: 'Fair',
        transmission: 'Good',
        brakes: 'Fair',
        tyres: 'Poor',
        body: 'Wear and tear',
        cargo_area: 'Good'
      },
      seller: {
        name: 'Punjab National Bank',
        type: 'bank',
        gst_number: 'GST789123456',
        verified: true
      }
    }
  ];

  useEffect(() => {
    setVehicles(mockVehicles);
    setLoading(false);
  }, [filters]);

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car': return <Car className="h-6 w-6" />;
      case 'bike': return <Bike className="h-6 w-6" />;
      case 'truck': return <Truck className="h-6 w-6" />;
      default: return <Car className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'sold': return 'bg-green-100 text-green-800';
      case 'unsold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSellerTypeColor = (type: string) => {
    switch (type) {
      case 'bank': return 'bg-blue-100 text-blue-800';
      case 'nbfc': return 'bg-purple-100 text-purple-800';
      case 'government': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filters.vehicle_type && vehicle.vehicle_type !== filters.vehicle_type) return false;
    if (filters.condition && vehicle.condition !== filters.condition) return false;
    if (filters.location && !vehicle.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.bank && !vehicle.bank_name.toLowerCase().includes(filters.bank.toLowerCase())) return false;
    
    if (filters.price_range) {
      const [min, max] = filters.price_range.split('-').map(Number);
      if (max && (vehicle.reserve_price < min || vehicle.reserve_price > max)) return false;
      if (!max && vehicle.reserve_price < min) return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seized Vehicles</h1>
          <p className="text-gray-600 dark:text-gray-400">Bank and NBFC seized vehicles available for auction</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.vehicle_type}
            onChange={(e) => setFilters(prev => ({ ...prev, vehicle_type: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Vehicle Types</option>
            <option value="car">Cars</option>
            <option value="bike">Bikes</option>
            <option value="truck">Trucks</option>
            <option value="bus">Buses</option>
          </select>

          <select
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Locations</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Bangalore</option>
            <option value="chennai">Chennai</option>
            <option value="kolkata">Kolkata</option>
          </select>

          <select
            value={filters.price_range}
            onChange={(e) => setFilters(prev => ({ ...prev, price_range: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Price Ranges</option>
            <option value="0-100000">Under ₹1L</option>
            <option value="100000-500000">₹1L - ₹5L</option>
            <option value="500000-1000000">₹5L - ₹10L</option>
            <option value="1000000-2000000">₹10L - ₹20L</option>
            <option value="2000000">Above ₹20L</option>
          </select>

          <select
            value={filters.condition}
            onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Conditions</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>

          <select
            value={filters.bank}
            onChange={(e) => setFilters(prev => ({ ...prev, bank: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Banks/NBFCs</option>
            <option value="sbi">State Bank of India</option>
            <option value="hdfc">HDFC Bank</option>
            <option value="icici">ICICI Bank</option>
            <option value="axis">Axis Bank</option>
            <option value="pnb">Punjab National Bank</option>
          </select>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img
                src={vehicle.images[0]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status.toUpperCase()}
                </span>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                {getVehicleIcon(vehicle.vehicle_type)}
                {vehicle.vehicle_type.toUpperCase()}
              </div>
              {vehicle.seller.verified && (
                <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Registration:</span>
                  <span className="font-medium">{vehicle.registration_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mileage:</span>
                  <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Condition:</span>
                  <span className={`font-medium capitalize ${getConditionColor(vehicle.condition)}`}>
                    {vehicle.condition}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fuel:</span>
                  <span className="font-medium">{vehicle.fuel_type}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="border-t pt-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{vehicle.seller.name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getSellerTypeColor(vehicle.seller.type)}`}>
                    {vehicle.seller.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">GST: {vehicle.seller.gst_number}</p>
              </div>

              <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                {vehicle.location}
              </div>

              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                Auction: {new Date(vehicle.auction_date).toLocaleDateString()}
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Reserve Price</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ₹{vehicle.reserve_price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Current Bid</p>
                  <p className="font-bold text-green-600">
                    ₹{vehicle.current_bid.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/vehicle/${vehicle.id}`}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg text-center text-sm hover:bg-indigo-700"
                >
                  View Details
                </Link>
                {vehicle.status === 'live' && (
                  <button className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 flex items-center">
                    <Gavel className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Auction Guidelines */}
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Seized Vehicle Auction Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Required Documents
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Valid ID proof (Aadhar/PAN/Passport)</li>
              <li>• Address proof</li>
              <li>• Bank account details</li>
              <li>• EMD (Earnest Money Deposit) payment</li>
              <li>• Income proof for loan eligibility</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Important Notes
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All sales are final - no returns</li>
              <li>• Physical inspection recommended</li>
              <li>• Transfer charges extra</li>
              <li>• Payment within 7 days of auction</li>
              <li>• Vehicle delivered as-is condition</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeizedVehicles;
