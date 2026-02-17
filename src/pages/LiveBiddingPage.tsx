import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  Heart,
  Share2,
  Eye,
  MessageSquare,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  BidIcon,
  AlertCircle,
  CheckCircle,
  Zap,
  Timer,
  Crown,
  Trophy,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock auction data
const mockAuction = {
  id: '1',
  title: 'BMW X3 2020 Excellent Condition',
  make: 'BMW',
  model: 'X3',
  year: 2020,
  mileage: 45000,
  fuel: 'Petrol',
  transmission: 'Automatic',
  location: 'Mumbai, Maharashtra',
  reservePrice: 1750000,
  startingBid: 1650000,
  bidIncrement: 10000,
  images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
  dealer: {
    name: 'Elite Motors',
    verified: true,
    rating: 4.8,
    auctions: 127
  },
  trust: {
    inspected: true,
    warranty: true,
    riskGrade: 'A',
    inspectionScore: 85
  },
  loanAvailable: true,
  emiPreview: {
    monthly: 38750,
    tenure: 60
  },
  specs: {
    engine: '2.0L Turbo',
    power: '248 HP',
    torque: '350 Nm',
    acceleration: '6.3s (0-100km/h)',
    topSpeed: '240 km/h',
    fuelEfficiency: '14.3 km/l',
    seating: '5 seats',
    bootSpace: '550L'
  }
};

// Mock bidding data
const mockBids = [
  { id: '1', bidder: 'Rajesh K.', amount: 1850000, time: new Date(Date.now() - 30 * 1000), isHighest: true },
  { id: '2', bidder: 'Priya M.', amount: 1840000, time: new Date(Date.now() - 60 * 1000), isHighest: false },
  { id: '3', bidder: 'Arun S.', amount: 1830000, time: new Date(Date.now() - 90 * 1000), isHighest: false },
  { id: '4', bidder: 'Sneha R.', amount: 1820000, time: new Date(Date.now() - 120 * 1000), isHighest: false },
  { id: '5', bidder: 'Vikram T.', amount: 1810000, time: new Date(Date.now() - 150 * 1000), isHighest: false },
];

const LiveBiddingPage: React.FC = () => {
  const [auction, setAuction] = useState(mockAuction);
  const [bids, setBids] = useState(mockBids);
  const [currentBid, setCurrentBid] = useState(1850000);
  const [myBid, setMyBid] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [activeViewers, setActiveViewers] = useState(247);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBidHistory, setShowBidHistory] = useState(true);
  const [bidStatus, setBidStatus] = useState<'idle' | 'placing' | 'success' | 'error'>('idle');

  // Simulate time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auction ended
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate new bids
  useEffect(() => {
    if (timeRemaining > 0) {
      const bidTimer = setInterval(() => {
        const randomBid = Math.floor(Math.random() * 5000) + 10000; // 10k-15k increment
        const newBidAmount = currentBid + randomBid;

        const newBid = {
          id: Date.now().toString(),
          bidder: `Bidder ${Math.floor(Math.random() * 100)}`,
          amount: newBidAmount,
          time: new Date(),
          isHighest: true
        };

        setBids(prev => [newBid, ...prev.slice(0, 4)]);
        setCurrentBid(newBidAmount);
        setActiveViewers(prev => prev + Math.floor(Math.random() * 5) - 2);
      }, Math.random() * 10000 + 5000); // Random interval between 5-15 seconds

      return () => clearInterval(bidTimer);
    }
  }, [timeRemaining, currentBid]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  const handlePlaceBid = async () => {
    const bidAmount = parseInt(myBid.replace(/,/g, ''));

    if (bidAmount <= currentBid) {
      setBidStatus('error');
      setTimeout(() => setBidStatus('idle'), 3000);
      return;
    }

    setBidStatus('placing');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newBid = {
      id: Date.now().toString(),
      bidder: 'You',
      amount: bidAmount,
      time: new Date(),
      isHighest: true
    };

    setBids(prev => [newBid, ...prev.slice(0, 4)]);
    setCurrentBid(bidAmount);
    setMyBid('');
    setBidStatus('success');

    setTimeout(() => setBidStatus('idle'), 3000);
  };

  const suggestedBids = [
    currentBid + auction.bidIncrement,
    currentBid + auction.bidIncrement * 2,
    currentBid + auction.bidIncrement * 5
  ];

  const isAuctionEnded = timeRemaining === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                ← Back to Auctions
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{auction.title}</h1>
                <p className="text-sm text-gray-600">{auction.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{activeViewers} watching</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg font-semibold ${
                    isAuctionEnded
                      ? 'bg-red-100 text-red-800'
                      : timeRemaining < 300
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isAuctionEnded ? (
                      <>
                        <Trophy className="h-5 w-5 inline mr-2" />
                        Auction Ended
                      </>
                    ) : (
                      <>
                        <Timer className="h-5 w-5 inline mr-2" />
                        {timeRemaining < 300 ? 'Ending Soon' : 'Live Auction'}
                      </>
                    )}
                  </div>

                  {!isAuctionEnded && (
                    <div className="text-3xl font-mono font-bold text-gray-900">
                      {formatTime(timeRemaining)}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-600">Current Bid</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(currentBid)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Reserve: {formatCurrency(auction.reservePrice)}
                  </div>
                </div>
              </div>

              {!isAuctionEnded && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Place Your Bid</h3>
                      <p className="text-sm text-gray-600">Minimum bid: {formatCurrency(currentBid + auction.bidIncrement)}</p>
                    </div>

                    <div className="flex gap-3">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Enter bid amount"
                          className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                          value={myBid}
                          onChange={(e) => setMyBid(e.target.value)}
                        />
                      </div>

                      <Button
                        onClick={handlePlaceBid}
                        disabled={!myBid || bidStatus === 'placing'}
                        className="px-8 bg-blue-600 hover:bg-blue-700"
                      >
                        {bidStatus === 'placing' ? 'Placing...' :
                         bidStatus === 'success' ? 'Bid Placed!' :
                         'Place Bid'}
                      </Button>
                    </div>
                  </div>

                  {/* Suggested Bids */}
                  <div className="mt-4 flex gap-2">
                    <span className="text-sm text-gray-600 mr-2">Quick bid:</span>
                    {suggestedBids.map((bid, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setMyBid(bid.toLocaleString())}
                      >
                        {formatCurrency(bid)}
                      </Button>
                    ))}
                  </div>

                  {/* Bid Status */}
                  <Fragment>
                    {bidStatus === 'error' && (
                      <div
}
}
}
                        className="mt-3 flex items-center gap-2 text-red-600"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Bid must be higher than current bid</span>
                      </div>
                    )}
                    {bidStatus === 'success' && (
                      <div
}
}
}
                        className="mt-3 flex items-center gap-2 text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Your bid has been placed successfully!</span>
                      </div>
                    )}
                  </Fragment>
                </div>
              )}

              {isAuctionEnded && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 text-center">
                  <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Auction Ended!</h3>
                  <p className="text-gray-600 mb-4">
                    Winning bid: {formatCurrency(currentBid)} by {bids[0]?.bidder}
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Proceed to Payment
                  </Button>
                </div>
              )}
            </Card>

            {/* Image Gallery */}
            <Card className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={auction.images[selectedImage]}
                    alt={auction.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="flex gap-2 mt-3">
                    {auction.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Vehicle Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Make & Model:</span>
                      <p className="font-medium">{auction.make} {auction.model}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Year:</span>
                      <p className="font-medium">{auction.year}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Mileage:</span>
                      <p className="font-medium">{auction.mileage.toLocaleString()} km</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fuel:</span>
                      <p className="font-medium">{auction.fuel}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Transmission:</span>
                      <p className="font-medium">{auction.transmission}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">{auction.location}</p>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Trust & Quality</h4>
                    <div className="flex flex-wrap gap-2">
                      {auction.trust.inspected && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          ✓ Inspected
                        </span>
                      )}
                      {auction.trust.warranty && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          ✓ Warranty
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        auction.trust.riskGrade === 'A' ? 'bg-green-100 text-green-800' :
                        auction.trust.riskGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                        auction.trust.riskGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Risk Grade {auction.trust.riskGrade}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        Score: {auction.trust.inspectionScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Loan Option */}
                  {auction.loanAvailable && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Loan Available</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        EMI: {formatCurrency(auction.emiPreview.monthly)}/month for {auction.emiPreview.tenure} months
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Check Eligibility
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bid History */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Bid History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBidHistory(!showBidHistory)}
                >
                  {showBidHistory ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>

              <Fragment>
                {showBidHistory && (
                  <div
}
}
}
                    className="space-y-3"
                  >
                    {bids.map((bid, index) => (
                      <div
                        key={bid.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          bid.isHighest ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {bid.isHighest && <Crown className="h-4 w-4 text-yellow-500" />}
                          <div>
                            <p className="font-medium text-gray-900">{bid.bidder}</p>
                            <p className="text-xs text-gray-600">{formatTimeAgo(bid.time)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(bid.amount)}</p>
                          {index === 0 && (
                            <p className="text-xs text-green-600 font-medium">Highest Bid</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Fragment>
            </Card>

            {/* Live Chat */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Live Chat</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">RK</span>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Rajesh K.</span> Great vehicle! Worth every penny.</p>
                    <p className="text-xs text-gray-600">2 min ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-green-600">PM</span>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Priya M.</span> Is the warranty still valid?</p>
                    <p className="text-xs text-gray-600">1 min ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-purple-600">AS</span>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Auctioneer</span> Yes, comprehensive warranty valid till 2025.</p>
                    <p className="text-xs text-gray-600">30 sec ago</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button size="sm">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Dealer Info */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Seller Information</h3>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600">
                    {auction.dealer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900">{auction.dealer.name}</h4>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">{auction.dealer.rating}</span>
                  {auction.dealer.verified && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{auction.dealer.auctions} successful auctions</p>
                <Button variant="outline" size="sm" className="mt-3">
                  Contact Seller
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBiddingPage;
