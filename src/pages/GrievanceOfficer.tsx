import React from 'react';

const GrievanceOfficer: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Grievance Officer</h1>
      <p className="text-gray-600 mb-6">
        In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020,
        the following are the details of the Grievance Officer for Quick Mela.
      </p>

      <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 p-6 space-y-4">
        <div>
          <h2 className="font-semibold">Name</h2>
          <p>Mr. Rahul Sharma (Grievance Officer)</p>
        </div>
        <div>
          <h2 className="font-semibold">Email</h2>
          <p>info@tekvoro.com</p>
        </div>
        <div>
          <h2 className="font-semibold">Phone</h2>
          <p>+91 91234 56789 (Mon–Fri, 10:00–18:00 IST)</p>
        </div>
        <div>
          <h2 className="font-semibold">Address</h2>
          <p>
            Tekvoro Technologies Pvt Ltd,
            <br /> 2nd Floor, Indiranagar,
            <br /> Bengaluru, Karnataka 560038, India
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            You may write to the Grievance Officer with your name, contact details, order/product details (if applicable),
            and a clear description of the issue. We aim to acknowledge grievances within 48 hours and resolve them within 30 days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GrievanceOfficer;
