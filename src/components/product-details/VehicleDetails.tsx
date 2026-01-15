import React from 'react';

interface Props {
  data: any;
}

const Row = ({ label, value }: { label: string; value: any }) => (
  <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
    <span className="font-medium text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-semibold text-gray-900 dark:text-gray-100">{value ?? '—'}</span>
  </div>
);

const VehicleDetails: React.FC<Props> = ({ data }) => {
  const a = data?.attributes || {};
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-6 space-y-5">
      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Vehicle Specifications</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Row label="Make" value={a.make || data.make} />
        <Row label="Model" value={a.model} />
        <Row label="Variant" value={a.variant} />
        <Row label="Year" value={a.year || data.year} />
        <Row label="KM Driven" value={a.km_driven ? `${Number(a.km_driven).toLocaleString()} km` : (data.mileage_km ? `${Number(data.mileage_km).toLocaleString()} km` : '—')} />
        <Row label="Fuel" value={a.fuel || data.fuel_type} />
        <Row label="Transmission" value={a.transmission || data.transmission} />
        <Row label="Ownership" value={a.ownership_count} />
        <Row label="RC Status" value={a.rc_status || data.rc_status} />
        <Row label="Accident History" value={a.accident_history} />
        <Row label="Service History" value={a.service_history} />
        <Row label="Location" value={data.location} />
      </div>
      <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-4 space-y-3">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Masked Identifiers</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Row label="Registration Number" value={data.registration_number_masked || a.registration_number_masked || 'Masked'} />
          <Row label="Engine Number" value={data.engine_number_masked || a.engine_number_masked || 'Masked'} />
          <Row label="Chassis Number" value={data.chassis_number_masked || a.chassis_number_masked || 'Masked'} />
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;

