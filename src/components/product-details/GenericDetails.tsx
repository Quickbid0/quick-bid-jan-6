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

const GenericDetails: React.FC<Props> = ({ data }) => {
  const a = data?.attributes || {};
  const entries = Object.entries(a || {});
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-6 space-y-5">
      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Details</h4>
      {entries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entries.map(([key, value]) => (
            <Row key={key} label={key.replace(/_/g, ' ')} value={String(value)} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">No additional attributes provided.</p>
      )}
    </div>
  );
};

export default GenericDetails;

