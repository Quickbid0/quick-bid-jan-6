import React from 'react';

const Shipping: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Shipping Policy</h1>
      <p className="text-gray-600 mb-3">This Shipping Policy outlines how products are shipped and delivered when purchased via QuickBid, owned and operated by Tekvoro Technologies Pvt Ltd.</p>
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500">
        <span>Last updated: {new Date().toLocaleDateString()}</span>
        <span className="text-gray-500">
          Shipping support: <a href="mailto:support@quickbid.com" className="text-indigo-600 hover:text-indigo-800">support@quickbid.com</a>
        </span>
      </div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
        <p className="font-semibold mb-2 text-xs uppercase tracking-wide text-gray-500">On this page</p>
        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
          <li><a href="#dispatch" className="text-indigo-600 hover:text-indigo-800">Dispatch & Handling</a></li>
          <li><a href="#delivery" className="text-indigo-600 hover:text-indigo-800">Delivery</a></li>
          <li><a href="#damages" className="text-indigo-600 hover:text-indigo-800">Damages & Disputes</a></li>
          <li><a href="#contact" className="text-indigo-600 hover:text-indigo-800">Contact</a></li>
        </ul>
      </div>

      <h2 id="dispatch" className="text-xl font-semibold mt-6 mb-2">Dispatch & Handling</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Dispatch timelines vary by seller and product type. Estimated timelines are shown on the product page where applicable.</li>
        <li>Large or seized-asset auctions may require in-person pickup or specialized logistics coordinated post-auction.</li>
        <li>Buyers are responsible for providing accurate shipping details and coordinating delivery where required.</li>
      </ul>

      <h2 id="delivery" className="text-xl font-semibold mt-6 mb-2">Delivery</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Delivery timelines are estimates and may be impacted by location, logistics partners, or regulatory checks.</li>
        <li>Tracking details (where available) will be shared via your registered email or dashboard.</li>
        <li>For pickup-only products, the pickup location and time window will be communicated after payment confirmation.</li>
      </ul>

      <h2 id="damages" className="text-xl font-semibold mt-6 mb-2">Damages & Disputes</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Please inspect your item upon receipt and contact support within 48 hours if there are issues.</li>
        <li>Provide photos/videos and the order reference to expedite resolution.</li>
      </ul>

      <h2 id="contact" className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p className="text-gray-700">For shipping queries, contact support@quickbid.com</p>
    </div>
  );
};

export default Shipping;
