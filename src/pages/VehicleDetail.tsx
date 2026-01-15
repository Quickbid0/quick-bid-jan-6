import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Car, 
  Calendar, 
  MapPin, 
  Fuel, 
  Settings, 
  Eye,
  FileText,
  Shield,
  Building,
  Phone,
  Mail,
  Download,
  Lock,
  Gavel,
  Heart,
  Share2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface VehicleDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  registration_number: string;
  engine_number: string;
  chassis_number: string;
  fuel_type: string;
  transmission: string;
  mileage: number;
  condition: string;
  reserve_price: number;
  current_bid: number;
  auction_date: string;
  location: string;
  description: string;
  images: string[];
  documents: string[];
  inspection_report: any;
  seller: {
    name: string;
    type: string;
    gst_number: string;
    contact_email: string;
    contact_phone: string;
    verified: boolean;
  };
  loan_details: {
    bank_name: string;
    loan_account: string;
    outstanding_amount: number;
    emi_amount: number;
  };
  specifications: {
    color: string;
    seating_capacity: number;
    insurance_valid_till: string;
    rc_status: string;
    hypothecation: string;
  };
  challans?: {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'unpaid';
    offense: string;
    location: string;
  }[];
}

const VehicleDetail = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const maskReg = (reg: string) => {
    if (!reg) return '';
    return reg.length > 6 ? reg.slice(0, 2) + '*'.repeat(Math.max(0, reg.length - 6)) + reg.slice(-4) : '*'.repeat(reg.length);
  };

  const maskTail = (value: string, visibleTail: number = 4) => {
    if (!value) return '';
    return value.length > visibleTail ? '*'.repeat(Math.max(0, value.length - visibleTail)) + value.slice(-visibleTail) : '*'.repeat(value.length);
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      // Mock vehicle data - in real implementation, fetch from database
      const mockVehicle: VehicleDetails = {
        id: id || '1',
        make: 'Maruti Suzuki',
        model: 'Swift Dzire',
        year: 2019,
        vehicle_type: 'Sedan',
        registration_number: 'MH01AB1234',
        engine_number: 'K12M1234567',
        chassis_number: 'MA3ERLF1S00123456',
        fuel_type: 'Petrol',
        transmission: 'Manual',
        mileage: 45000,
        condition: 'Good',
        reserve_price: 450000,
        current_bid: 420000,
        auction_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Mumbai, Maharashtra',
        description: 'Well-maintained vehicle with complete service history. Single owner, accident-free. All documents available.',
        images: [
          'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1494976688153-c785a4cfc2a5?auto=format&fit=crop&w=800&q=80'
        ],
        documents: [
          'Registration Certificate',
          'Insurance Policy',
          'Pollution Certificate',
          'Service Records',
          'Loan Documents'
        ],
        inspection_report: {
          engine: 'Good - No major issues',
          transmission: 'Good - Smooth operation',
          brakes: 'Fair - Brake pads need replacement soon',
          tyres: 'Good - 70% tread remaining',
          body: 'Minor scratches on rear bumper',
          interior: 'Good - Clean and well-maintained',
          electrical: 'Good - All systems working',
          overall_rating: 'B+'
        },
        seller: {
          name: 'Seized Vehicles (Bank/NBFC pool)',
          type: 'NBFC',
          gst_number: 'GST123456789',
          contact_email: 'seized-vehicles@quickbid.com',
          contact_phone: '+91 98765 43210',
          verified: true
        },
        loan_details: {
          bank_name: 'State Bank of India',
          loan_account: 'SBI123456789',
          outstanding_amount: 380000,
          emi_amount: 12500
        },
        specifications: {
          color: 'Pearl White',
          seating_capacity: 5,
          insurance_valid_till: '2024-08-15',
          rc_status: 'Clear',
          hypothecation: 'State Bank of India'
        },
        challans: [
          {
            id: 'CHL-1001',
            date: '2024-06-12',
            amount: 500,
            status: 'paid',
            offense: 'Speeding',
            location: 'Mumbai'
          },
          {
            id: 'CHL-1023',
            date: '2024-10-05',
            amount: 1000,
            status: 'unpaid',
            offense: 'No Parking',
            location: 'Thane'
          }
        ]
      };

      setVehicle(mockVehicle);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast.error('Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (!amount || amount <= (vehicle?.current_bid || 0)) {
      toast.error('Bid must be higher than current bid');
      return;
    }

    toast.success(`Bid of ₹${amount.toLocaleString()} placed successfully!`);
    if (vehicle) {
      setVehicle({
        ...vehicle,
        current_bid: amount
      });
    }
    setShowBidModal(false);
    setBidAmount('');
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vehicle Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The vehicle you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="relative">
              <img
                src={vehicle.images[selectedImage]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-96 object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full">
                <Car className="h-4 w-4 inline mr-2" />
                {vehicle.vehicle_type}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleWishlist}
                  className={`p-2 rounded-full ${
                    isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700'
                  }`}
                >
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-2 bg-white/80 text-gray-700 rounded-full">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {vehicle.images.length > 1 && (
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {vehicle.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-indigo-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{vehicle.description}</p>

            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Mileage</p>
                  <p className="font-medium">{vehicle.mileage.toLocaleString()} km</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Fuel className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Fuel Type</p>
                  <p className="font-medium">{vehicle.fuel_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Transmission</p>
                  <p className="font-medium">{vehicle.transmission}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{vehicle.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-medium">{vehicle.condition}</p>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration Number:</span>
                    <span className="font-medium">{maskReg(vehicle.registration_number)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Engine Number:</span>
                    <span className="font-medium">{maskTail(vehicle.engine_number, 4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chassis Number:</span>
                    <span className="font-medium">{maskTail(vehicle.chassis_number, 6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{vehicle.specifications.color}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seating Capacity:</span>
                    <span className="font-medium">{vehicle.specifications.seating_capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurance Valid Till:</span>
                    <span className="font-medium">{new Date(vehicle.specifications.insurance_valid_till).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RC Status:</span>
                    <span className="font-medium text-green-600">{vehicle.specifications.rc_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hypothecation:</span>
                    <span className="font-medium">{vehicle.specifications.hypothecation}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">Owner details, full chassis/engine numbers, and original RC/Insurance are visible to admins only.</p>
          </div>

          {/* Inspection Report */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Inspection Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(vehicle.inspection_report as Record<string, unknown>).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300 capitalize">
                    {key.replace('_', ' ')}:
                  </span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Available Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vehicle.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{doc}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Lock className="h-4 w-4" />
                    <span className="text-xs">Admin only</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">Document downloads are restricted. Only authorized admins can access originals.</p>
          </div>

          {/* RC & Insurance (Masked) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">RC & Insurance (Masked)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">RC Number</p>
                  <p className="font-medium">{maskReg(vehicle.registration_number)}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Available</span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Insurance Valid Till</p>
                  <p className="font-medium">{new Date(vehicle.specifications.insurance_valid_till).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Masked</span>
              </div>
            </div>
          </div>

          {/* Challan Records */}
          {vehicle.challans && vehicle.challans.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Challan Records</h3>
              <div className="space-y-3">
                {vehicle.challans.map((c) => (
                  <div key={c.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{c.offense}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(c.date).toLocaleDateString()} • {c.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{c.amount.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded ${c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {c.status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bidding Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-600 font-medium">Auction Ends In</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                5 days 12 hours
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Bid</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{vehicle.current_bid.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Reserve Price</p>
                <p className="text-xl font-bold text-blue-600">
                  ₹{vehicle.reserve_price.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowBidModal(true)}
              className="btn btn-primary w-full flex items-center justify-center gap-2 mb-4"
            >
              <Gavel className="h-5 w-5" />
              Place Bid
            </button>

            <div className="text-center text-sm text-gray-500">
              <p>Auction Date: {new Date(vehicle.auction_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{vehicle.seller.name}</p>
                  <p className="text-sm text-gray-500">{vehicle.seller.type}</p>
                </div>
                {vehicle.seller.verified && (
                  <Shield className="h-5 w-5 text-green-500" />
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{vehicle.seller.contact_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{vehicle.seller.contact_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>GST: {vehicle.seller.gst_number}</span>
                </div>
              </div>

              <Link
                to={`/seller/company`}
                className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
              >
                View Seller Profile
              </Link>
            </div>
          </div>

          {/* Loan Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Loan Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Bank:</span>
                <span className="font-medium">{vehicle.loan_details.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Account:</span>
                <span className="font-medium">{vehicle.loan_details.loan_account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding:</span>
                <span className="font-medium text-red-600">
                  ₹{vehicle.loan_details.outstanding_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EMI:</span>
                <span className="font-medium">₹{vehicle.loan_details.emi_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Place Your Bid</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Current Bid: ₹{vehicle.current_bid.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Reserve Price: ₹{vehicle.reserve_price.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Bid Amount (₹)
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Minimum: ₹${(vehicle.current_bid + 5000).toLocaleString()}`}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> A security deposit of 10% will be held from your wallet.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowBidModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceBid}
                className="btn btn-primary"
              >
                Place Bid
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sticky Mobile CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 p-3">
        <div className="max-w-7xl mx-auto px-2 flex gap-2">
          <button
            onClick={() => setShowBidModal(true)}
            className="btn btn-primary flex-1"
          >
            Place Bid
          </button>
          <button
            onClick={toggleWishlist}
            className={`btn flex-1 ${isWishlisted ? 'bg-red-600 text-white hover:bg-red-700' : 'btn-outline'}`}
          >
            {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
