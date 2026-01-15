import React from 'react';

const CatalogSettings: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Catalog Settings</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Admin can manage Categories, Item Types, Brands, and Attributes here. Detailed CRUD UI will be wired to Supabase tables created in the taxonomy migration.
      </p>
    </div>
  );
};

export default CatalogSettings;
