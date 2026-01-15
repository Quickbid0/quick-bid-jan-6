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

const WatchDetails: React.FC<Props> = ({ data }) => {
  const a = data?.attributes || {};
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-6 space-y-5">
      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Watch Specifications</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Row label="Brand" value={a.brand} />
        <Row label="Model" value={a.model} />
        <Row label="Reference Number" value={a.reference_number} />
        <Row label="Year" value={a.year} />
        <Row label="Condition" value={a.condition || data.condition} />
        <Row label="Box & Papers" value={a.box_papers === true ? 'Yes' : a.box_papers === false ? 'No' : '—'} />
        <Row label="Movement" value={a.movement} />
        <Row label="Case Size" value={a.case_size ? `${a.case_size} mm` : '—'} />
        <Row label="Authenticity Certificate" value={a.authenticity_certificate ? 'Yes' : '—'} />
      </div>
    </div>
  );
};

export default WatchDetails;

