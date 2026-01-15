import React from 'react';

const ContactUs = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
      <p className="mb-8 text-center text-lg">
        Have questions, feedback, or need support? Reach out to us — we're here to help!
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <form className="space-y-4">
          <div>
            <label className="block font-medium">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block font-medium">Message</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              placeholder="How can we help you?"
            ></textarea>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Send Message
          </button>
        </form>

        <div className="space-y-4">
          <div>
            <h2 className="font-bold">Email</h2>
            <p>support@quickbid.io</p>
          </div>
          <div>
            <h2 className="font-bold">Phone</h2>
            <p>+1 (234) 567-8901</p>
          </div>
          <div>
            <h2 className="font-bold">Address</h2>
            <p>123 QuickBid Lane, Innovation City, World 45678</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
