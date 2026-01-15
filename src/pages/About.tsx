import React from "react";
import {
  ShieldCheck,
  Bolt,
  Store,
  TrendingUp,
  Star,
  Users,
  Headphones,
  ThumbsUp,
  BadgeCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 px-6 md:px-20 py-12">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400">
            Welcome to QuickBid
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
            A premium bidding platform trusted by thousands. Verified users, real-time auctions,
            and secure payments — all in one place.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            QuickBid is owned and operated by <strong>Tekvoro Technologies Pvt Ltd</strong>.
          </p>
        </section>

        {/* Why Choose QuickBid */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <Bolt className="text-yellow-500" /> Why Choose QuickBid?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="text-green-500 w-6 h-6" />,
                title: "Verified Users & Products",
                desc: "All users are verified through valid government IDs. Only genuine listings are allowed.",
              },
              {
                icon: <TrendingUp className="text-blue-500 w-6 h-6" />,
                title: "Live Real-Time Bidding",
                desc: "Get notified and place bids instantly in our lightning-fast live auction rooms.",
              },
              {
                icon: <Star className="text-purple-500 w-6 h-6" />,
                title: "Premium User Experience",
                desc: "Material Design meets responsive beauty — intuitive, clean, and fast.",
              },
              {
                icon: <ThumbsUp className="text-indigo-500 w-6 h-6" />,
                title: "Customer Satisfaction First",
                desc: "We’re obsessed with keeping our users happy. Ratings, reviews, and care always matter.",
              },
              {
                icon: <Store className="text-pink-500 w-6 h-6" />,
                title: "Sell Smarter, Earn More",
                desc: "Upload products, set prices, schedule auctions — all with ease and control.",
              },
              {
                icon: <Headphones className="text-red-500 w-6 h-6" />,
                title: "24/7 Expert Support",
                desc: "Our experienced team is always ready to help you with anything you need.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-3 border border-gray-100 dark:border-gray-700 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <TrendingUp className="text-green-500" /> How QuickBid Works
          </h2>
          <ol className="grid md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            <li>
              <strong className="text-blue-600">1. Create an Account:</strong> Sign up with email or phone, verify your ID, and set up your profile.
            </li>
            <li>
              <strong className="text-blue-600">2. Explore Products:</strong> Browse through rare collectibles, new items, and hot deals.
            </li>
            <li>
              <strong className="text-blue-600">3. Join Auctions:</strong> Enter live bidding rooms, track prices, and place competitive bids.
            </li>
            <li>
              <strong className="text-blue-600">4. Win & Pay:</strong> Secure payment via Razorpay or UPI. Your funds are protected via escrow.
            </li>
            <li>
              <strong className="text-blue-600">5. Track & Receive:</strong> Get updates on your shipment until the product reaches your doorstep.
            </li>
            <li>
              <strong className="text-blue-600">6. Rate the Experience:</strong> Give feedback and earn rewards through referrals and loyalty bonuses.
            </li>
          </ol>
        </section>

        {/* Trusted & Verified */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-bold flex justify-center items-center gap-2">
            <BadgeCheck className="text-teal-500" /> Trusted. Verified. Protected.
          </h2>
          <p className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
            Every user and product on QuickBid undergoes manual and automated verification. Our
            platform is designed to build trust, foster fairness, and ensure secure transactions.
          </p>
        </section>

        {/* Our Team */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-bold flex justify-center items-center gap-2">
            <Users className="text-orange-500" /> Meet Our Team
          </h2>
          <p className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
            A crew of passionate developers, designers, support agents, and growth experts —
            committed to providing the best online auction experience. We're here 24/7 to serve you!
          </p>
        </section>

        {/* Call to Action */}
        <section className="text-center mt-10 space-y-4">
          <p className="text-xl font-medium">
            Still curious? <Link to="/faq" className="text-blue-600 dark:text-blue-400 underline">Check our FAQs</Link> or{" "}
            <Link to="/contactus" className="text-blue-600 dark:text-blue-400 underline">contact us</Link>.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition"
          >
            Start Exploring QuickBid
          </Link>
        </section>
      </div>
    </div>
  );
};

export default About;
