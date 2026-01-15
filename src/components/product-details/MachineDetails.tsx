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

const MachineDetails: React.FC<Props> = ({ data }) => {
  const a = data?.attributes || {};
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-6 space-y-5">
      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Technical Sheet</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Row label="Manufacturer" value={a.manufacturer} />
        <Row label="Machine Type" value={a.machine_type} />
        <Row label="Year" value={a.year} />
        <Row label="Operating Hours" value={a.operating_hours} />
        <Row label="Power Rating" value={a.power_rating} />
        <Row label="CNC Controller" value={a.cnc_controller} />
        <Row label="Maintenance Logs" value={a.maintenance_logs} />
        <Row label="Installation Location" value={a.installation_location || data.location} />
      </div>
    </div>
  );
};

export default MachineDetails;

